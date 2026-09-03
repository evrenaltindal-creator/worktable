import { Provider } from './Provider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { OllamaProvider } from './OllamaProvider';
import { MockProvider } from './MockProvider';
import { AgentState } from '../types';
import { offlineViolation } from '../offline';

const cache = new Map<string, Provider>();

/**
 * Her ajan icin bir saglayici ornegi olusturur/onbelleklenmis olani dondurur.
 * Ajana ozel `apiKey` varsa o kullanilir, yoksa saglayicinin genel .env
 * degiskenine (ANTHROPIC_API_KEY / OPENAI_API_KEY) dusulur. Anahtar/adres
 * bulunamayan bulut saglayicilari icin cevrimdisi demo yanitlari ureten
 * MockProvider kullanilir. `ollama` API anahtari gerektirmez, sadece adres.
 *
 * Cevrimdisi mod acikken (varsayilan) veriyi internete gonderecek her
 * saglayici burada - istek gonderilmeden once - engellenir.
 */
export function getProvider(agent: AgentState): Provider {
  const violation = offlineViolation(agent.provider, agent.baseUrl);
  if (violation) throw new Error(violation);

  const cached = cache.get(agent.id);
  if (cached) return cached;

  let provider: Provider;
  if (agent.provider === 'anthropic') {
    const key = agent.apiKey || process.env.ANTHROPIC_API_KEY;
    provider = key ? new AnthropicProvider(key) : new MockProvider();
  } else if (agent.provider === 'openai') {
    const key = agent.apiKey || process.env.OPENAI_API_KEY;
    provider = key ? new OpenAIProvider(key) : new MockProvider();
  } else if (agent.provider === 'ollama') {
    const baseUrl = agent.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    provider = new OllamaProvider(baseUrl);
  } else {
    provider = new MockProvider();
  }

  cache.set(agent.id, provider);
  return provider;
}

/** Ajanin anahtari/saglayicisi/adresi degistiginde onbellekten dusurmek icin. */
export function clearProviderCache(agentId: string) {
  cache.delete(agentId);
}
