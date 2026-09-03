import { Provider } from './Provider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { OllamaProvider } from './OllamaProvider';
import { MockProvider } from './MockProvider';
import { AgentState } from '../types';

const cache = new Map<string, Provider>();

/**
 * Her ajan icin bir saglayici ornegi olusturur/onbelleklenmis olani dondurur.
 * Ajana ozel `apiKey` varsa o kullanilir, yoksa saglayicinin genel .env
 * degiskenine (ANTHROPIC_API_KEY / OPENAI_API_KEY) dusulur. Hicbiri yoksa
 * cevrimdisi demo yanitlari ureten MockProvider kullanilir. Ollama yerel
 * calistigi ve anahtar gerektirmedigi icin ayri ele alinir: adres olarak
 * ajana ozel `apiKey` alani (doldurulmussa) veya `OLLAMA_BASE_URL` .env
 * degiskeni (yoksa http://localhost:11434) kullanilir.
 */
export function getProvider(agent: AgentState): Provider {
  const cached = cache.get(agent.id);
  if (cached) return cached;

  let provider: Provider;
  if (agent.provider === 'ollama') {
    const baseUrl = agent.apiKey || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    provider = new OllamaProvider(baseUrl);
  } else {
    const key =
      agent.apiKey ||
      (agent.provider === 'anthropic'
        ? process.env.ANTHROPIC_API_KEY
        : agent.provider === 'openai'
          ? process.env.OPENAI_API_KEY
          : undefined);

    if (agent.provider === 'anthropic' && key) {
      provider = new AnthropicProvider(key);
    } else if (agent.provider === 'openai' && key) {
      provider = new OpenAIProvider(key);
    } else {
      provider = new MockProvider();
    }
  }

  cache.set(agent.id, provider);
  return provider;
}

/** Ajanin anahtari/saglayicisi degistiginde onbellekten dusurmek icin. */
export function clearProviderCache(agentId: string) {
  cache.delete(agentId);
}
