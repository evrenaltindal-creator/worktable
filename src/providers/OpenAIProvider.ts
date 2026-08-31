import OpenAI from 'openai';
import { CompletionRequest, CompletionResult, Provider } from './Provider';

export class OpenAIProvider implements Provider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: req.systemPrompt }, ...req.messages],
    });

    const content = response.choices[0]?.message?.content ?? '';

    return {
      content,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    };
  }
}
