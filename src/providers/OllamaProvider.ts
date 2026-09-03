import { CompletionRequest, CompletionResult, Provider } from './Provider';

/**
 * Yerel olarak calisan Ollama sunucusu (varsayilan http://localhost:11434)
 * icin saglayici. API anahtari gerektirmez; `ollama serve` calisiyor ve
 * ilgili model `ollama pull <model>` ile indirilmis olmalidir.
 */
export class OllamaProvider implements Provider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: 'system', content: req.systemPrompt }, ...req.messages],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Ollama istegi basarisiz (${response.status}): ${text || response.statusText}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };

    return {
      content: data.message?.content ?? '',
      inputTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
    };
  }
}
