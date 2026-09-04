import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { Orchestrator } from './orchestrator/Orchestrator';
import { AgentState } from './types';
import { isOfflineOnly, offlineViolation } from './offline';
import { comfyUiBaseUrl } from './providers';

/** API anahtarini asla istemciye gondermez; yerine sadece tanimli olup olmadigini isaretler. */
function redactAgent(agent: AgentState) {
  const { apiKey, ...rest } = agent;
  return { ...rest, hasApiKey: Boolean(apiKey) };
}

const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.REMOTE_ACCESS_TOKEN;

if (ACCESS_TOKEN) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const provided = req.header('x-access-token') || req.query.token;
    if (provided !== ACCESS_TOKEN) {
      res.status(401).json({ error: 'Yetkisiz erisim: gecerli bir token gerekli.' });
      return;
    }
    next();
  });
}

app.use(express.static(path.join(__dirname, '..', 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const orchestrator = new Orchestrator();
const clients = new Set<WebSocket>();

orchestrator.onUpdate = (event, payload) => {
  let outPayload: unknown = payload;
  if (event === 'agent_added' || event === 'agent_updated') {
    outPayload = redactAgent(payload as AgentState);
  } else if (event === 'agents_reset') {
    outPayload = (payload as AgentState[]).map(redactAgent);
  }
  const data = JSON.stringify({ event, payload: outPayload });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
};

wss.on('connection', (ws, req) => {
  if (ACCESS_TOKEN) {
    const url = new URL(req.url ?? '', 'http://localhost');
    if (url.searchParams.get('token') !== ACCESS_TOKEN) {
      ws.close(1008, 'Yetkisiz');
      return;
    }
  }

  clients.add(ws);
  ws.send(
    JSON.stringify({
      event: 'bootstrap',
      payload: {
        agents: orchestrator.listAgents().map(redactAgent),
        tasks: orchestrator.listTasks(),
        offlineOnly: isOfflineOnly(),
      },
    }),
  );
  ws.on('close', () => clients.delete(ws));
});

app.get('/api/status', (_req, res) => {
  res.json({ offlineOnly: isOfflineOnly() });
});

/**
 * ComfyUI'nin urettigi gorselleri tarayiciya aktarir. Hedef adres istekten
 * degil, sunucudaki ComfyUI ajaninin ayarindan alinir - boylece bu ucun
 * baska bir adrese yonlendirilmesi mumkun degildir.
 */
app.get('/api/comfy-image', async (req, res) => {
  const filename = String(req.query.filename ?? '');
  const subfolder = String(req.query.subfolder ?? '');
  const type = String(req.query.type ?? 'output');

  if (!filename || filename.includes('..') || /[\\/]/.test(filename)) {
    res.status(400).json({ error: 'Gecersiz dosya adi' });
    return;
  }

  const comfyAgent = orchestrator.listAgents().find((a) => a.provider === 'comfyui');
  const base = comfyUiBaseUrl(comfyAgent?.baseUrl);

  const violation = offlineViolation('comfyui', comfyAgent?.baseUrl);
  if (violation) {
    res.status(403).json({ error: violation });
    return;
  }

  const target =
    `${base.replace(/\/$/, '')}/view?filename=${encodeURIComponent(filename)}` +
    `&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;

  try {
    const upstream = await fetch(target);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `ComfyUI gorseli dondurmedi (${upstream.status})` });
      return;
    }
    res.set('Content-Type', upstream.headers.get('content-type') ?? 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/api/agents', (_req, res) => {
  res.json(orchestrator.listAgents().map(redactAgent));
});

app.post('/api/agents/reset-to-defaults', (_req, res) => {
  const agents = orchestrator.resetAgentsToDefaults();
  res.json(agents.map(redactAgent));
});

app.post('/api/agents', (req, res) => {
  const { id, name, role, provider, model, avatarColor, deskPosition, capabilities, tokenBudget, apiKey, baseUrl } =
    req.body ?? {};
  if (!name || !role || !provider || !model) {
    res.status(400).json({ error: 'name, role, provider ve model zorunlu' });
    return;
  }
  const violation = offlineViolation(provider, baseUrl);
  if (violation) {
    res.status(400).json({ error: violation });
    return;
  }
  try {
    const agent = orchestrator.addAgent({
      id,
      name,
      role,
      provider,
      model,
      avatarColor: avatarColor || '#636e72',
      deskPosition: deskPosition && typeof deskPosition.x === 'number' ? deskPosition : { x: 1, y: 1 },
      capabilities: Array.isArray(capabilities) ? capabilities : [],
      tokenBudget: Number(tokenBudget) > 0 ? Number(tokenBudget) : 100000,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    });
    res.status(201).json(redactAgent(agent));
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.put('/api/agents/:id', (req, res) => {
  const existing = orchestrator.listAgents().find((a) => a.id === req.params.id);
  const nextProvider = req.body?.provider ?? existing?.provider;
  const nextBaseUrl = req.body?.baseUrl ?? existing?.baseUrl;
  if (nextProvider) {
    const violation = offlineViolation(nextProvider, nextBaseUrl);
    if (violation) {
      res.status(400).json({ error: violation });
      return;
    }
  }
  try {
    const agent = orchestrator.updateAgent(req.params.id, req.body ?? {});
    res.json(redactAgent(agent));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.delete('/api/agents/:id', (req, res) => {
  try {
    orchestrator.removeAgent(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/api/tasks', (_req, res) => {
  res.json(orchestrator.listTasks());
});

app.get('/api/tasks/:id', (req, res) => {
  const task = orchestrator.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Gorev bulunamadi' });
    return;
  }
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, requiredCapabilities } = req.body ?? {};
  if (!title || !description) {
    res.status(400).json({ error: 'title ve description zorunlu' });
    return;
  }
  const task = orchestrator.createTask(title, description, requiredCapabilities ?? []);
  res.status(201).json(task);
});

app.post('/api/tasks/:id/message', async (req, res) => {
  const { content } = req.body ?? {};
  if (!content) {
    res.status(400).json({ error: 'content zorunlu' });
    return;
  }
  try {
    await orchestrator.userMessage(req.params.id, content);
    res.json(orchestrator.getTask(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/tasks/:id/approve', (req, res) => {
  try {
    const task = orchestrator.approveTask(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST ?? '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`AI Ofis http://localhost:${PORT} adresinde calisiyor (HOST=${HOST})`);
  if (isOfflineOnly()) {
    console.log('CEVRIMDISI MOD ACIK: veriler bilgisayarinizdan disari cikmaz.');
    console.log('(Bulut saglayicilari engellendi. Kapatmak icin .env: OFFLINE_ONLY=false)');
  } else {
    console.log('UYARI: Cevrimdisi mod KAPALI - bulut saglayicilarina veri gonderilebilir.');
  }
  if (ACCESS_TOKEN) {
    console.log('Uzaktan erisim tokeni aktif: adrese ?token=... parametresiyle baglanin.');
  }
});
