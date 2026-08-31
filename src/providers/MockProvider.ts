import { CompletionRequest, CompletionResult, Provider } from './Provider';

/**
 * API anahtari tanimlanmamis saglayicilar icin cevrimdisi demo saglayicisi.
 * Boylece proje anahtar girilmeden de ucdan uca calisir sekilde denenebilir.
 */
export class MockProvider implements Provider {
  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const lastUser = [...req.messages].reverse().find((m) => m.role === 'user');
    const excerpt = (lastUser?.content ?? '').slice(0, 100);
    const content = `(demo yaniti - ${model}) "${excerpt}" konusunda gorusum: net bir plan cikarip adim adim ilerlemeyi oneririm. (Gercek yanit icin .env dosyasina API anahtari ekleyin.)`;

    return {
      content,
      inputTokens: 40,
      outputTokens: Math.ceil(content.length / 4),
    };
  }
}
