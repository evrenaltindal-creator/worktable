import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { Orchestrator } from './orchestrator/Orchestrator';
import { AgentState } from './types';

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
  const outPayload =
    event === 'agent_added' || event === 'agent_updated' ? redactAgent(payload as AgentState) : payload;
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
      payload: { agents: orchestrator.listAgents().map(redactAgent), tasks: orchestrator.listTasks() },
    }),
  );
  ws.on('close', () => clients.delete(ws));
});

app.get('/api/agents', (_req, res) => {
  res.json(orchestrator.listAgents().map(redactAgent));
});

app.post('/api/agents', (req, res) => {
  const { id, name, role, provider, model, avatarColor, deskPosition, capabilities, tokenBudget, apiKey, baseUrl } =
    req.body ?? {};
  if (!name || !role || !provider || !model) {
    res.status(400).json({ error: 'name, role, provider ve model zorunlu' });
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
  if (ACCESS_TOKEN) {
    console.log('Uzaktan erisim tokeni aktif: adrese ?token=... parametresiyle baglanin.');
  }
});
