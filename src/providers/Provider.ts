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
  /** Gorsel ureten saglayicilarin dondugu resim adresleri (arayuzde gosterilir). */
  images?: string[];
}

export interface Provider {
  /**
   * 'text' (varsayilan) saglayicilar sohbet gecmisiyle calisir; 'image'
   * saglayicilar (orn. ComfyUI) gecmis yerine sadece gorsel brief'i alir.
   */
  readonly kind?: 'text' | 'image';
  complete(req: CompletionRequest, model: string): Promise<CompletionResult>;
}
