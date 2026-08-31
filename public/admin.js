const params = new URLSearchParams(location.search);
const TOKEN = params.get('token') || '';

const state = { agents: [], tasks: [], activeTaskId: null };

const STATUS_LABEL = {
  idle: 'Boşta',
  working: 'Çalışıyor',
  discussing: 'Tartışıyor',
  quota_low: 'Kota Doldu',
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

// ---- Ajanlar ----

function renderAgentTable() {
  const body = document.getElementById('agentTableBody');
  body.innerHTML = '';
  for (const agent of state.agents) {
    const ratio = agent.tokenBudget ? agent.tokensUsed / agent.tokenBudget : 0;
    const barClass = ratio > 0.9 ? 'danger' : ratio > 0.6 ? 'warn' : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="avatar-dot" style="background:${agent.avatarColor}"></span></td>
      <td>${escapeHtml(agent.name)}</td>
      <td>${escapeHtml(agent.role)}</td>
      <td>${escapeHtml(agent.provider)}</td>
      <td>${escapeHtml(agent.model)}</td>
      <td>${agent.capabilities.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join(' ')}</td>
      <td>
        <div class="token-bar"><div class="token-bar-fill ${barClass}" style="width:${Math.min(100, ratio * 100)}%"></div></div>
        <small>${agent.tokensUsed.toLocaleString('tr-TR')} / ${agent.tokenBudget.toLocaleString('tr-TR')}</small>
      </td>
      <td>${agent.hasApiKey ? '✅ Ayarlı' : '⚠️ Yok (.env kullanılır)'}</td>
      <td><span class="status-badge status-${agent.status}">${STATUS_LABEL[agent.status] || agent.status}</span></td>
      <td class="row-actions">
        <button class="secondary small" data-edit="${agent.id}">Düzenle</button>
        <button class="secondary small danger-text" data-delete="${agent.id}">Sil</button>
      </td>
    `;
    body.appendChild(row);
  }

  body.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => openAgentDialog(btn.dataset.edit)),
  );
  body.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', () => deleteAgent(btn.dataset.delete)),
  );
}

function openAgentDialog(agentId) {
  const dialog = document.getElementById('agentDialog');
  const form = document.getElementById('agentForm');
  form.reset();

  const agent = agentId ? state.agents.find((a) => a.id === agentId) : null;
  document.getElementById('agentDialogTitle').textContent = agent ? `Ajanı Düzenle: ${agent.name}` : 'Yeni Ajan';
  form.elements.id.value = agent ? agent.id : '';

  if (agent) {
    form.elements.name.value = agent.name;
    form.elements.role.value = agent.role;
    form.elements.provider.value = agent.provider;
    form.elements.model.value = agent.model;
    form.elements.capabilities.value = agent.capabilities.join(', ');
    form.elements.deskX.value = agent.deskPosition.x;
    form.elements.deskY.value = agent.deskPosition.y;
    form.elements.tokenBudget.value = agent.tokenBudget;
    form.elements.avatarColor.value = agent.avatarColor;
    form.elements.apiKey.placeholder = agent.hasApiKey
      ? 'Kayıtlı bir anahtar var (değiştirmek için yazın, silmek için boş bırakıp kaydedin)'
      : 'Boş bırakılırsa .env kullanılır';
  } else {
    form.elements.apiKey.placeholder = 'Boş bırakılırsa .env kullanılır';
  }

  dialog.showModal();
}

async function deleteAgent(id) {
  const agent = state.agents.find((a) => a.id === id);
  if (!confirm(`"${agent ? agent.name : id}" ajanını silmek istediğinize emin misiniz?`)) return;
  try {
    await api(`/api/agents/${id}`, { method: 'DELETE' });
    removeAgentFromState(id);
    renderAgentTable();
  } catch (err) {
    alert(err.message);
  }
}

function setupAgentDialog() {
  const dialog = document.getElementById('agentDialog');
  document.getElementById('newAgentBtn').addEventListener('click', () => openAgentDialog(null));
  document.getElementById('cancelAgentDialog').addEventListener('click', () => dialog.close());

  document.getElementById('agentForm').addEventListener('submit', async (e) => {
    const form = e.target;
    const data = new FormData(form);
    const id = data.get('id');
    const capabilities = (data.get('capabilities') || '')
      .toString()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: data.get('name'),
      role: data.get('role'),
      provider: data.get('provider'),
      model: data.get('model'),
      capabilities,
      deskPosition: { x: Number(data.get('deskX')) || 1, y: Number(data.get('deskY')) || 1 },
      tokenBudget: Number(data.get('tokenBudget')) || 100000,
      avatarColor: data.get('avatarColor'),
      apiKey: data.get('apiKey') || '',
    };
    // Yeni ajanda apiKey bos ise gondermeyelim ki "anahtar yok" gibi davransin,
    // duzenlemede ise bos deger = mevcut anahtari temizle anlamina gelir.
    if (!id && !payload.apiKey) delete payload.apiKey;

    try {
      if (id) {
        await api(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/agents', { method: 'POST', body: JSON.stringify(payload) });
      }
      document.getElementById('agentDialog').close();
    } catch (err) {
      alert(err.message);
    }
  });
}

// ---- Projeler ----

function renderTaskList() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  for (const task of state.tasks) {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.id === state.activeTaskId ? ' active' : '');
    item.innerHTML = `<div class="title">${escapeHtml(task.title)}</div><div class="status">${STATUS_LABEL[task.status] || task.status}</div>`;
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
      (m) => `<div class="msg ${m.authorType}"><span class="author">${escapeHtml(m.authorName)}</span>${escapeHtml(m.content)}</div>`,
    )
    .join('');

  const proposalHtml =
    task.status === 'proposal_ready' && task.proposal
      ? `<div class="proposal-box"><strong>Nihai öneri:</strong>\n${escapeHtml(task.proposal)}</div>
         <button id="approveBtn">Onayla</button>`
      : '';

  detail.innerHTML = `
    <h3>${escapeHtml(task.title)}</h3>
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

// ---- Genel ----

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
    } else if (type === 'task_created' || type === 'task_updated') {
      upsertTask(payload);
      if (!state.activeTaskId) state.activeTaskId = payload.id;
    }
    renderAgentTable();
    renderTaskList();
    renderTaskDetail();
  });

  ws.addEventListener('close', () => setTimeout(connectSocket, 2000));
}

async function init() {
  try {
    const [agents, tasks] = await Promise.all([api('/api/agents'), api('/api/tasks')]);
    state.agents = agents;
    state.tasks = tasks;
    renderAgentTable();
    renderTaskList();
    renderTaskDetail();
  } catch (err) {
    console.error(err);
  }
  setupAgentDialog();
  setupNewProjectDialog();
  connectSocket();
}

init();
