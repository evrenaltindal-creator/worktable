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
  interrupted: 'Yarım Kaldı',
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

let pixelOffice = null;

function setupOffice() {
  const canvas = document.getElementById('officeCanvas');
  if (!canvas || typeof PixelOffice === 'undefined') return;

  pixelOffice = new PixelOffice(canvas);
  pixelOffice.onAgentClick = (agent) => {
    const ratio = agent.tokenBudget ? Math.round((agent.tokensUsed / agent.tokenBudget) * 100) : 0;
    const hint = document.getElementById('officeHint');
    if (hint) {
      hint.textContent =
        `${agent.name} — ${agent.role} · ${STATUS_LABEL[agent.status] || agent.status} · ` +
        `${agent.model} · token: %${ratio}`;
    }
  };
  pixelOffice.start();
}

function renderOffice() {
  if (pixelOffice) pixelOffice.setState(state.agents, state.tasks);
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
      (m) =>
        `<div class="msg ${m.authorType}"><span class="author">${escapeHtml(m.authorName)}</span>${escapeHtml(m.content)}${renderMessageImages(m)}</div>`,
    )
    .join('');

  const proposalHtml =
    task.status === 'proposal_ready' && task.proposal
      ? `<div class="proposal-box"><strong>Nihai öneri:</strong>\n${escapeHtml(task.proposal)}</div>
         <button id="approveBtn">Onayla</button>`
      : '';

  detail.innerHTML = `
    <div class="task-detail-header">
      <h3>${escapeHtml(task.title)}</h3>
      <button class="secondary small danger-text" id="deleteTaskBtn">Sil</button>
    </div>
    <p style="color:var(--muted);font-size:0.85rem">${escapeHtml(task.description)}</p>
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

  document.getElementById('deleteTaskBtn').addEventListener('click', () => deleteTask(task));

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

// ComfyUI gibi gorsel ureten ajanlarin resimleri. Yalnizca kendi sunucumuzun
// gorsel ucundan gelen adresler gosterilir.
function renderMessageImages(msg) {
  if (!Array.isArray(msg.images) || msg.images.length === 0) return '';
  return msg.images
    .filter((src) => typeof src === 'string' && src.startsWith('/api/comfy-image?'))
    .map((src) => {
      const url = TOKEN ? `${src}&token=${encodeURIComponent(TOKEN)}` : src;
      const safe = escapeHtml(url);
      return `<a href="${safe}" target="_blank" rel="noopener"><img class="msg-image" src="${safe}" alt="Üretilen tasarım" loading="lazy"></a>`;
    })
    .join('');
}

async function deleteTask(task) {
  if (!confirm(`"${task.title}" projesi ve tüm sohbeti kalıcı olarak silinecek. Emin misiniz?`)) return;
  try {
    await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
  } catch (err) {
    alert(err.message);
  }
}

function removeTaskFromState(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.activeTaskId === id) state.activeTaskId = state.tasks[0]?.id ?? null;
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

function renderOfflineBadge(offlineOnly) {
  const badge = document.getElementById('offlineBadge');
  if (!badge) return;
  badge.hidden = false;
  if (offlineOnly) {
    badge.textContent = '🔒 Çevrimdışı — veriler bilgisayarınızdan çıkmıyor';
    badge.classList.remove('warn');
  } else {
    badge.textContent = '⚠️ Çevrimdışı mod kapalı — buluta veri gidebilir';
    badge.classList.add('warn');
  }
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
      renderOfflineBadge(payload.offlineOnly);
    } else if (type === 'agent_added' || type === 'agent_updated') {
      upsertAgent(payload);
    } else if (type === 'agent_removed') {
      removeAgentFromState(payload.id);
    } else if (type === 'agents_reset') {
      state.agents = payload;
    } else if (type === 'task_created' || type === 'task_updated') {
      upsertTask(payload);
      if (!state.activeTaskId) state.activeTaskId = payload.id;
    } else if (type === 'task_removed') {
      removeTaskFromState(payload.id);
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
  setupOffice();
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
