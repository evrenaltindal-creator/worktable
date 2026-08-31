import { Provider } from './Provider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockProvider } from './MockProvider';
import { AgentState } from '../types';

const cache = new Map<string, Provider>();

/**
 * Her ajan icin bir saglayici ornegi olusturur/onbelleklenmis olani dondurur.
 * Ajana ozel `apiKey` varsa o kullanilir, yoksa saglayicinin genel .env
 * degiskenine (ANTHROPIC_API_KEY / OPENAI_API_KEY) dusulur. Hicbiri yoksa
 * cevrimdisi demo yanitlari ureten MockProvider kullanilir.
 */
export function getProvider(agent: AgentState): Provider {
  const cached = cache.get(agent.id);
  if (cached) return cached;

  const key =
    agent.apiKey ||
    (agent.provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : agent.provider === 'openai'
        ? process.env.OPENAI_API_KEY
        : undefined);

  let provider: Provider;
  if (agent.provider === 'anthropic' && key) {
    provider = new AnthropicProvider(key);
  } else if (agent.provider === 'openai' && key) {
    provider = new OpenAIProvider(key);
  } else {
    provider = new MockProvider();
  }

  cache.set(agent.id, provider);
  return provider;
}

/** Ajanin anahtari/saglayicisi degistiginde onbellekten dusurmek icin. */
export function clearProviderCache(agentId: string) {
  cache.delete(agentId);
}
