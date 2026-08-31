import { Provider } from './Provider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockProvider } from './MockProvider';
import { ProviderName } from '../types';

const cache = new Map<ProviderName, Provider>();

export function getProvider(providerName: ProviderName): Provider {
  const cached = cache.get(providerName);
  if (cached) return cached;

  let provider: Provider;
  if (providerName === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    provider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
  } else if (providerName === 'openai' && process.env.OPENAI_API_KEY) {
    provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
  } else {
    provider = new MockProvider();
  }

  cache.set(providerName, provider);
  return provider;
}
