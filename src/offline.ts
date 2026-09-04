/**
 * Cevrimdisi (offline) mod: acikken hicbir veri bilgisayardan disari
 * cikmaz - bulut saglayicilari (Anthropic/OpenAI) ve yerel olmayan
 * adresler tamamen engellenir. Varsayilan olarak ACIKTIR; kapatmak icin
 * .env dosyasina `OFFLINE_ONLY=false` yazin.
 */
export function isOfflineOnly(): boolean {
  return process.env.OFFLINE_ONLY !== 'false';
}

/** Bulut uzerinden calisan, veriyi internete gonderen saglayicilar. */
const CLOUD_PROVIDERS = ['anthropic', 'openai'];

export function isCloudProvider(provider: string): boolean {
  return CLOUD_PROVIDERS.includes(provider);
}

/**
 * Adresin bu bilgisayarda veya yerel agda olup olmadigini dogrular.
 * Cevrimdisi modda yalnizca bu adreslere baglanmaya izin verilir.
 */
export function isLocalAddress(rawUrl: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return false;
  }

  // IPv6 adresleri new URL() tarafindan koseli parantezsiz dondurulur.
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
  if (hostname.endsWith('.local') || hostname.endsWith('.localhost')) return true;

  // Ozel (yerel ag) IPv4 araliklari: 10.x, 192.168.x, 172.16-31.x
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;

  return false;
}

/**
 * Bir ajanin cevrimdisi modda kullanilabilir olup olmadigini denetler.
 * Kullanilamiyorsa nedenini aciklayan bir mesaj, kullanilabiliyorsa null doner.
 */
export function offlineViolation(provider: string, baseUrl: string | undefined): string | null {
  if (!isOfflineOnly()) return null;

  if (isCloudProvider(provider)) {
    return `Cevrimdisi mod acik: "${provider}" bulut saglayicisi verilerinizi internete gonderecegi icin engellendi. Yerel bir model (ollama) kullanin veya .env dosyasina OFFLINE_ONLY=false yazin.`;
  }

  if (provider === 'ollama' || provider === 'comfyui') {
    const fallback =
      provider === 'ollama'
        ? process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        : process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188';
    const url = baseUrl || fallback;
    if (!isLocalAddress(url)) {
      return `Cevrimdisi mod acik: "${url}" adresi bu bilgisayarda veya yerel aginizda degil, bu yuzden engellendi.`;
    }
  }

  return null;
}
