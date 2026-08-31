export interface CompletionMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  systemPrompt: string;
  messages: CompletionMessage[];
}

export interface CompletionResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export interface Provider {
  complete(req: CompletionRequest, model: string): Promise<CompletionResult>;
}
