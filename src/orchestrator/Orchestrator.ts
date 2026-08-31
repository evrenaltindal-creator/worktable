import { randomUUID } from 'crypto';
import { AgentConfig, AgentState, Message, Task } from '../types';
import { getProvider, clearProviderCache } from '../providers';
import { AgentStore } from '../store/AgentStore';

const HANDOFF_THRESHOLD = 0.9;

type UpdateEvent = 'agent_added' | 'agent_updated' | 'agent_removed' | 'task_created' | 'task_updated';
type UpdateListener = (event: UpdateEvent, payload: unknown) => void;

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '') || randomUUID()
  );
}

export type NewAgentInput = Omit<AgentConfig, 'id'> & { id?: string };

export class Orchestrator {
  private agents = new Map<string, AgentState>();
  private tasks = new Map<string, Task>();
  private store = new AgentStore();
  onUpdate: UpdateListener = () => {};

  constructor() {
    for (const cfg of this.store.load()) {
      this.agents.set(cfg.id, { ...cfg, tokensUsed: 0, status: 'idle' });
    }
  }

  private persistAgents() {
    const configs: AgentConfig[] = [...this.agents.values()].map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      provider: a.provider,
      model: a.model,
      avatarColor: a.avatarColor,
      deskPosition: a.deskPosition,
      capabilities: a.capabilities,
      tokenBudget: a.tokenBudget,
      apiKey: a.apiKey,
    }));
    this.store.save(configs);
  }

  addAgent(input: NewAgentInput): AgentState {
    const id = input.id?.trim() || slugify(input.name);
    if (this.agents.has(id)) throw new Error(`"${id}" kimlikli bir ajan zaten var`);
    const agent: AgentState = { ...input, id, tokensUsed: 0, status: 'idle' };
    this.agents.set(id, agent);
    this.persistAgents();
    this.emit('agent_added', agent);
    return agent;
  }

  updateAgent(id: string, patch: Partial<AgentConfig>): AgentState {
    const agent = this.agents.get(id);
    if (!agent) throw new Error('Ajan bulunamadi');

    if (patch.apiKey === '') {
      agent.apiKey = undefined;
    } else if (typeof patch.apiKey === 'string') {
      agent.apiKey = patch.apiKey;
    }
    if (patch.provider !== undefined || patch.apiKey !== undefined) {
      clearProviderCache(agent.id);
    }

    const editableKeys: (keyof AgentConfig)[] = [
      'name',
      'role',
      'provider',
      'model',
      'avatarColor',
      'deskPosition',
      'capabilities',
      'tokenBudget',
    ];
    for (const key of editableKeys) {
      if (patch[key] !== undefined) {
        (agent as unknown as Record<string, unknown>)[key] = patch[key];
      }
    }

    this.persistAgents();
    this.emit('agent_updated', agent);
    return agent;
  }

  removeAgent(id: string) {
    const agent = this.agents.get(id);
    if (!agent) throw new Error('Ajan bulunamadi');
    this.agents.delete(id);
    clearProviderCache(id);
    this.persistAgents();
    this.emit('agent_removed', { id });
  }

  listAgents(): AgentState[] {
    return [...this.agents.values()];
  }

  listTasks(): Task[] {
    return [...this.tasks.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  private emit(event: UpdateEvent, payload: unknown) {
    this.onUpdate(event, payload);
  }

  private usageRatio(agent: AgentState): number {
    return agent.tokenBudget > 0 ? agent.tokensUsed / agent.tokenBudget : 0;
  }

  private pickAgent(requiredCapabilities: string[], excludeIds: string[] = []): AgentState | undefined {
    const candidates = [...this.agents.values()].filter(
      (a) =>
        !excludeIds.includes(a.id) &&
        this.usageRatio(a) < HANDOFF_THRESHOLD &&
        (requiredCapabilities.length === 0 || requiredCapabilities.some((c) => a.capabilities.includes(c))),
    );
    candidates.sort((a, b) => this.usageRatio(a) - this.usageRatio(b));
    return candidates[0];
  }

  private addSystemMessage(task: Task, content: string) {
    const msg: Message = {
      id: randomUUID(),
      taskId: task.id,
      authorType: 'system',
      authorName: 'Sistem',
      content,
      createdAt: Date.now(),
    };
    task.messages.push(msg);
    task.updatedAt = Date.now();
  }

  private addAgentMessage(task: Task, agent: AgentState, content: string) {
    const msg: Message = {
      id: randomUUID(),
      taskId: task.id,
      authorType: 'agent',
      authorId: agent.id,
      authorName: agent.name,
      content,
      createdAt: Date.now(),
    };
    task.messages.push(msg);
    task.updatedAt = Date.now();
  }

  createTask(title: string, description: string, requiredCapabilities: string[]): Task {
    const task: Task = {
      id: randomUUID(),
      title,
      description,
      requiredCapabilities,
      previousAgentIds: [],
      status: 'pending',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.tasks.set(task.id, task);
    this.addSystemMessage(task, `Yeni proje olusturuldu: "${title}"`);
    this.emit('task_created', task);

    this.runDiscussion(task).catch((err: Error) => {
      this.addSystemMessage(task, `Hata: ${err.message}`);
      this.emit('task_updated', task);
    });

    return task;
  }

  approveTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Gorev bulunamadi');
    task.status = 'completed';
    this.addSystemMessage(task, 'Kullanici oneriyi onayladi. Proje tamamlandi.');
    this.emit('task_updated', task);
    return task;
  }

  private async askAgent(agent: AgentState, task: Task, prompt: string): Promise<string> {
    agent.status = 'working';
    agent.currentTaskId = task.id;
    this.emit('agent_updated', agent);

    const provider = getProvider(agent);
    const history = task.messages
      .filter((m) => m.authorType !== 'system')
      .map((m) => ({
        role: (m.authorType === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `${m.authorName}: ${m.content}`,
      }));

    const systemPrompt = `Sen ${agent.name} adinda bir ${agent.role}sin. Yetkinliklerin: ${agent.capabilities.join(
      ', ',
    )}. Sanal bir ofiste diger yapay zeka calisma arkadaslarinla birlikte kullanicinin projeleri uzerinde calisiyorsun. Kisa, net ve uygulanabilir sekilde katki ver.`;

    const result = await provider.complete(
      { systemPrompt, messages: [...history, { role: 'user', content: prompt }] },
      agent.model,
    );

    agent.tokensUsed += result.inputTokens + result.outputTokens;
    this.addAgentMessage(task, agent, result.content);
    this.emit('task_updated', task);

    agent.status = this.usageRatio(agent) >= HANDOFF_THRESHOLD ? 'quota_low' : 'idle';
    agent.currentTaskId = undefined;
    this.emit('agent_updated', agent);

    return result.content;
  }

  private async runAgentTurnWithHandoff(task: Task, agent: AgentState, prompt: string): Promise<string> {
    if (this.usageRatio(agent) >= HANDOFF_THRESHOLD) {
      return this.handoff(task, agent, prompt);
    }
    try {
      return await this.askAgent(agent, task, prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/429|rate.?limit|quota|insufficient/i.test(message)) {
        agent.status = 'quota_low';
        this.emit('agent_updated', agent);
        return this.handoff(task, agent, prompt);
      }
      throw err;
    }
  }

  private async handoff(task: Task, fromAgent: AgentState, prompt: string): Promise<string> {
    task.status = 'handed_off';
    const next = this.pickAgent(task.requiredCapabilities, [...task.previousAgentIds]);
    if (!next) {
      this.addSystemMessage(
        task,
        `${fromAgent.name}'in token kotasi bitti ve devredilecek uygun ajan bulunamadi.`,
      );
      this.emit('task_updated', task);
      throw new Error('Devredilecek uygun ajan yok');
    }
    this.addSystemMessage(task, `${fromAgent.name}'in token kotasi azaldigi icin gorev ${next.name}'e devredildi.`);
    task.previousAgentIds.push(next.id);
    this.emit('task_updated', task);
    return this.askAgent(next, task, prompt);
  }

  private async runDiscussion(task: Task) {
    task.status = 'discussing';
    this.emit('task_updated', task);

    const caps = task.requiredCapabilities.length ? task.requiredCapabilities : ['planlama'];
    const participants: AgentState[] = [];
    const seen = new Set<string>();

    for (const cap of caps) {
      const agent = this.pickAgent([cap], [...seen]);
      if (agent && !seen.has(agent.id)) {
        participants.push(agent);
        seen.add(agent.id);
      }
    }
    if (participants.length === 0) {
      const fallback = this.pickAgent([]);
      if (fallback) participants.push(fallback);
    }
    if (participants.length === 0) {
      this.addSystemMessage(task, 'Uygun/bosta ajan bulunamadi (tum ajanlarin token kotasi dolu olabilir).');
      task.status = 'pending';
      this.emit('task_updated', task);
      return;
    }

    for (const agent of participants) {
      task.previousAgentIds.push(agent.id);
      await this.runAgentTurnWithHandoff(
        task,
        agent,
        `Proje: "${task.title}"\nAciklama: ${task.description}\nDiger ekip arkadaslarinin onceki katkilarini da dikkate alarak kendi uzmanlik alanindan kisa bir gorus ve oneri sun.`,
      );
    }

    task.assignedAgentId = participants[participants.length - 1].id;
    task.status = 'in_progress';
    this.emit('task_updated', task);

    const lead = this.pickAgent(['planlama'], []) ?? participants[0];
    const synthesis = await this.runAgentTurnWithHandoff(
      task,
      lead,
      'Ekip arkadaslarinin yukaridaki goruslerini birlestirerek kullaniciya sunulacak TEK bir nihai oneri/karar metni yaz. Net ve maddeler halinde olsun.',
    );

    task.proposal = synthesis;
    task.status = 'proposal_ready';
    this.addSystemMessage(task, 'Ekip bir oneride uzlasti. Onayinizi bekliyor.');
    this.emit('task_updated', task);
  }

  async userMessage(taskId: string, content: string) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Gorev bulunamadi');

    const msg: Message = {
      id: randomUUID(),
      taskId,
      authorType: 'user',
      authorName: 'Sen',
      content,
      createdAt: Date.now(),
    };
    task.messages.push(msg);
    task.updatedAt = Date.now();
    this.emit('task_updated', task);

    let agent = task.assignedAgentId ? this.agents.get(task.assignedAgentId) : undefined;
    if (!agent || this.usageRatio(agent) >= HANDOFF_THRESHOLD) {
      agent = this.pickAgent(task.requiredCapabilities, task.previousAgentIds.slice(0, -1));
    }
    if (!agent) throw new Error('Uygun ajan yok (tum ajanlarin token kotasi dolu olabilir)');

    task.assignedAgentId = agent.id;
    if (!task.previousAgentIds.includes(agent.id)) task.previousAgentIds.push(agent.id);
    await this.runAgentTurnWithHandoff(task, agent, content);
  }
}
