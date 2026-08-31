import Anthropic from '@anthropic-ai/sdk';
import { CompletionRequest, CompletionResult, Provider } from './Provider';

export class AnthropicProvider implements Provider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: req.systemPrompt,
      messages: req.messages,
    });

    const content = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    return {
      content,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}
