export type AgentStatus = 'idle' | 'working' | 'discussing' | 'quota_low';

export type ProviderName = 'anthropic' | 'openai' | 'ollama' | 'mock';

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  provider: ProviderName;
  model: string;
  avatarColor: string;
  deskPosition: { x: number; y: number };
  capabilities: string[];
  tokenBudget: number;
  /** Bu ajana ozel API anahtari. Bos ise saglayicinin genel .env anahtari kullanilir. */
  apiKey?: string;
}

export interface AgentState extends AgentConfig {
  tokensUsed: number;
  status: AgentStatus;
  currentTaskId?: string;
}

export type MessageAuthorType = 'user' | 'agent' | 'system';

export interface Message {
  id: string;
  taskId: string;
  authorType: MessageAuthorType;
  authorId?: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export type TaskStatus =
  | 'pending'
  | 'discussing'
  | 'in_progress'
  | 'handed_off'
  | 'proposal_ready'
  | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  requiredCapabilities: string[];
  assignedAgentId?: string;
  previousAgentIds: string[];
  status: TaskStatus;
  messages: Message[];
  proposal?: string;
  createdAt: number;
  updatedAt: number;
}
