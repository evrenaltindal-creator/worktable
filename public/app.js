const params = new URLSearchParams(location.search);
const TOKEN = params.get('token') || '';

const state = { agents: [], tasks: [], activeTaskId: null };

const STATUS_LABEL = {
  idle: 'Boşta',
  working: 'Çalışıyor',
  discussing: 'Tartışıyor',
  quota_low: 'Kota Doldu',
  error: 'Ulasilamadi',
  pending: 'Bekliyor',
  in_progress: 'Devam Ediyor',
  handed_off: 'Devrediliyor',
  proposal_ready: 'Öneri Hazır',
  completed: 'Tamamlandı',
};

function authHeaders(extra = {}) {
  return TOKEN ? { ...extra, 'x-access-token': TOKEN } : extra;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `İstek başarısız (${res.status})`);
  }
  return res.json();
}

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function renderOffice() {
  const office = document.getElementById('office');
  office.innerHTML = '';
  for (const agent of state.agents) {
    const ratio = agent.tokenBudget ? agent.tokensUsed / agent.tokenBudget : 0;
    const barClass = ratio > 0.9 ? 'danger' : ratio > 0.6 ? 'warn' : '';

    const desk = document.createElement('div');
    desk.className = 'desk';
    desk.style.gridColumn = String(agent.deskPosition.x);
    desk.style.gridRow = String(agent.deskPosition.y);
    desk.innerHTML = `
      <div class="avatar" style="background:${agent.avatarColor}">${initials(agent.name)}</div>
      <div class="name">${agent.name}</div>
      <div class="role">${agent.role}</div>
      <span class="status-badge status-${agent.status}">${STATUS_LABEL[agent.status] || agent.status}</span>
      <div class="token-bar"><div class="token-bar-fill ${barClass}" style="width:${Math.min(100, ratio * 100)}%"></div></div>
    `;
    office.appendChild(desk);
  }
}

function renderTaskList() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  for (const task of state.tasks) {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.id === state.activeTaskId ? ' active' : '');
    item.innerHTML = `<div class="title">${task.title}</div><div class="status">${STATUS_LABEL[task.status] || task.status}</div>`;
    item.addEventListener('click', () => {
      state.activeTaskId = task.id;
      renderTaskList();
      renderTaskDetail();
    });
    list.appendChild(item);
  }
}

function renderTaskDetail() {
  const detail = document.getElementById('taskDetail');
  const task = state.tasks.find((t) => t.id === state.activeTaskId);
  if (!task) {
    detail.hidden = true;
    return;
  }
  detail.hidden = false;

  const messagesHtml = task.messages
    .map(
      (m) => `<div class="msg ${m.authorType}"><span class="author">${m.authorName}</span>${escapeHtml(m.content)}</div>`,
    )
    .join('');

  const proposalHtml =
    task.status === 'proposal_ready' && task.proposal
      ? `<div class="proposal-box"><strong>Nihai öneri:</strong>\n${escapeHtml(task.proposal)}</div>
         <button id="approveBtn">Onayla</button>`
      : '';

  detail.innerHTML = `
    <h3>${task.title}</h3>
    <p style="color:var(--muted);font-size:0.85rem">${task.description}</p>
    <div class="messages">${messagesHtml}</div>
    ${proposalHtml}
    <form class="chat-input" id="chatForm">
      <input type="text" id="chatInput" placeholder="Ekibe mesaj yaz..." autocomplete="off" />
      <button type="submit">Gönder</button>
    </form>
  `;

  const approveBtn = document.getElementById('approveBtn');
  if (approveBtn) {
    approveBtn.addEventListener('click', async () => {
      await api(`/api/tasks/${task.id}/approve`, { method: 'POST' });
    });
  }

  document.getElementById('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    try {
      await api(`/api/tasks/${task.id}/message`, { method: 'POST', body: JSON.stringify({ content }) });
    } catch (err) {
      alert(err.message);
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function upsertTask(task) {
  const idx = state.tasks.findIndex((t) => t.id === task.id);
  if (idx === -1) state.tasks.unshift(task);
  else state.tasks[idx] = task;
}

function upsertAgent(agent) {
  const idx = state.agents.findIndex((a) => a.id === agent.id);
  if (idx === -1) state.agents.push(agent);
  else state.agents[idx] = agent;
}

function removeAgentFromState(id) {
  state.agents = state.agents.filter((a) => a.id !== id);
}

function connectSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}${TOKEN ? `?token=${encodeURIComponent(TOKEN)}` : ''}`;
  const ws = new WebSocket(url);

  ws.addEventListener('message', (event) => {
    const { event: type, payload } = JSON.parse(event.data);
    if (type === 'bootstrap') {
      state.agents = payload.agents;
      state.tasks = payload.tasks;
    } else if (type === 'agent_added' || type === 'agent_updated') {
      upsertAgent(payload);
    } else if (type === 'agent_removed') {
      removeAgentFromState(payload.id);
    } else if (type === 'agents_reset') {
      state.agents = payload;
    } else if (type === 'task_created' || type === 'task_updated') {
      upsertTask(payload);
      if (!state.activeTaskId) state.activeTaskId = payload.id;
    }
    renderOffice();
    renderTaskList();
    renderTaskDetail();
  });

  ws.addEventListener('close', () => setTimeout(connectSocket, 2000));
}

function setupNewProjectDialog() {
  const dialog = document.getElementById('newProjectDialog');
  const form = document.getElementById('newProjectForm');

  document.getElementById('newProjectBtn').addEventListener('click', () => dialog.showModal());
  document.getElementById('cancelNewProject').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', async () => {
    const data = new FormData(form);
    const title = data.get('title');
    const description = data.get('description');
    const capabilities = (data.get('capabilities') || '')
      .toString()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const task = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description, requiredCapabilities: capabilities }),
      });
      state.activeTaskId = task.id;
      form.reset();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function init() {
  try {
    const [agents, tasks] = await Promise.all([api('/api/agents'), api('/api/tasks')]);
    state.agents = agents;
    state.tasks = tasks;
    renderOffice();
    renderTaskList();
    renderTaskDetail();
  } catch (err) {
    console.error(err);
  }
  setupNewProjectDialog();
  connectSocket();
}

init();
