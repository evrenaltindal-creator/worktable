import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { Orchestrator } from './orchestrator/Orchestrator';

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
  const data = JSON.stringify({ event, payload });
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
      payload: { agents: orchestrator.listAgents(), tasks: orchestrator.listTasks() },
    }),
  );
  ws.on('close', () => clients.delete(ws));
});

app.get('/api/agents', (_req, res) => {
  res.json(orchestrator.listAgents());
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
