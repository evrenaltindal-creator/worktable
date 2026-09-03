import { CompletionRequest, CompletionResult, Provider } from './Provider';

interface OllamaChatResponse {
  message?: { role: string; content: string };
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Kullanicinin kendi bilgisayarinda `ollama serve` ile calisan yerel
 * modeller icin saglayici (orn. qwen2.5-coder:7b). API anahtari gerekmez;
 * sadece Ollama'nin adresi (varsayilan http://localhost:11434) gerekir.
 */
export class OllamaProvider implements Provider {
  constructor(private baseUrl: string) {}

  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: 'system', content: req.systemPrompt }, ...req.messages],
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama hatasi (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaChatResponse;
    return {
      content: data.message?.content ?? '',
      inputTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
    };
  }
}
