import fs from 'fs';
import path from 'path';
import { CompletionRequest, CompletionResult, Provider } from './Provider';

interface ComfyImageRef {
  filename: string;
  subfolder: string;
  type: string;
}

interface ComfyHistoryEntry {
  outputs?: Record<string, { images?: ComfyImageRef[] }>;
  status?: { completed?: boolean; status_str?: string; messages?: unknown[] };
}

const CUSTOM_WORKFLOW_FILE = path.join(process.cwd(), 'data', 'comfy-workflow.json');
const DEFAULT_NEGATIVE = 'text, watermark, blurry, lowres, deformed, extra limbs';

/**
 * Kullanicinin kendi bilgisayarinda calisan ComfyUI (varsayilan
 * http://127.0.0.1:8188) uzerinden gorsel uretir. API anahtari gerekmez,
 * hicbir veri internete cikmaz.
 *
 * Ajanin `model` alani kullanilacak checkpoint dosyasini belirtir
 * (orn. "sd_xl_base_1.0.safetensors"); bos veya "auto" ise ComfyUI'da
 * yuklu ilk checkpoint otomatik secilir.
 */
export class ComfyUIProvider implements Provider {
  readonly kind = 'image' as const;

  constructor(
    private baseUrl: string,
    private timeoutMs = Number(process.env.COMFYUI_TIMEOUT_MS) || 300000,
  ) {}

  private url(pathname: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}${pathname}`;
  }

  async complete(req: CompletionRequest, model: string): Promise<CompletionResult> {
    const startedAt = Date.now();
    const promptText = [...req.messages].reverse().find((m) => m.role === 'user')?.content?.trim() || 'a design concept';
    const checkpoint = await this.resolveCheckpoint(model);
    const workflow = this.buildWorkflow(promptText, checkpoint);

    const promptId = await this.queuePrompt(workflow);
    const images = await this.waitForImages(promptId);

    if (images.length === 0) {
      throw new Error('ComfyUI gorsel uretmedi (is kuyrugu bos dondu).');
    }

    const seconds = (Date.now() - startedAt) / 1000;
    const duration = seconds < 60 ? `${seconds.toFixed(1)} sn` : `${Math.floor(seconds / 60)} dk ${Math.round(seconds % 60)} sn`;
    const size = `${Number(process.env.COMFYUI_WIDTH) || 512}x${Number(process.env.COMFYUI_HEIGHT) || 512}`;

    return {
      content:
        `"${promptText}" brief'i icin ${images.length} gorsel tasarim uretildi.\n` +
        `Sure: ${duration} · Model: ${checkpoint} · Boyut: ${size} · Adim: ${Number(process.env.COMFYUI_STEPS) || 20}`,
      images,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  /** Ajanin model alani bossa ComfyUI'daki ilk checkpoint'i secer. */
  private async resolveCheckpoint(model: string): Promise<string> {
    const wanted = (model || '').trim();
    if (wanted && wanted.toLowerCase() !== 'auto') return wanted;

    const res = await fetch(this.url('/object_info/CheckpointLoaderSimple'));
    if (!res.ok) {
      throw new Error(`ComfyUI'a ulasilamadi (${res.status}). ComfyUI calisiyor mu?`);
    }
    const info = (await res.json()) as Record<string, { input?: { required?: { ckpt_name?: unknown[] } } }>;
    const options = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0];
    const first = Array.isArray(options) ? options[0] : undefined;

    if (typeof first !== 'string') {
      throw new Error(
        'ComfyUI\'da hicbir model (checkpoint) bulunamadi. ComfyUI/models/checkpoints klasorune bir model dosyasi ekleyin.',
      );
    }
    return first;
  }

  /**
   * Varsayilan metin-den-gorsele is akisi. `data/comfy-workflow.json` varsa
   * onun icindeki `%prompt%` / `%negative%` yer tutuculari doldurularak
   * kullanicinin kendi is akisi kullanilir.
   */
  private buildWorkflow(prompt: string, checkpoint: string): Record<string, unknown> {
    if (fs.existsSync(CUSTOM_WORKFLOW_FILE)) {
      const raw = fs.readFileSync(CUSTOM_WORKFLOW_FILE, 'utf-8');
      const filled = raw
        .replace(/%prompt%/g, JSON.stringify(prompt).slice(1, -1))
        .replace(/%negative%/g, DEFAULT_NEGATIVE);
      return JSON.parse(filled);
    }

    const width = Number(process.env.COMFYUI_WIDTH) || 512;
    const height = Number(process.env.COMFYUI_HEIGHT) || 512;
    const steps = Number(process.env.COMFYUI_STEPS) || 20;

    return {
      '3': {
        class_type: 'KSampler',
        inputs: {
          seed: Math.floor(Math.random() * 1_000_000_000),
          steps,
          cfg: 7,
          sampler_name: 'euler',
          scheduler: 'normal',
          denoise: 1,
          model: ['4', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
      },
      '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: checkpoint } },
      '5': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
      '6': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
      '7': { class_type: 'CLIPTextEncode', inputs: { text: DEFAULT_NEGATIVE, clip: ['4', 1] } },
      '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
      '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'AIOfis', images: ['8', 0] } },
    };
  }

  private async queuePrompt(workflow: Record<string, unknown>): Promise<string> {
    const res = await fetch(this.url('/prompt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: 'ai-ofis' }),
    });

    if (!res.ok) {
      throw new Error(`ComfyUI is kuyruguna eklenemedi (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { prompt_id?: string };
    if (!data.prompt_id) throw new Error('ComfyUI bir is numarasi (prompt_id) dondurmedi.');
    return data.prompt_id;
  }

  /** Gorsel hazir olana kadar bekler; sonucu arayuzun gosterebilecegi adreslere cevirir. */
  private async waitForImages(promptId: string): Promise<string[]> {
    const deadline = Date.now() + this.timeoutMs;

    while (Date.now() < deadline) {
      const res = await fetch(this.url(`/history/${promptId}`));
      if (res.ok) {
        const history = (await res.json()) as Record<string, ComfyHistoryEntry>;
        const entry = history[promptId];
        if (entry?.outputs) {
          const refs = Object.values(entry.outputs).flatMap((o) => o.images ?? []);
          if (refs.length > 0) {
            return refs.map(
              (img) =>
                `/api/comfy-image?filename=${encodeURIComponent(img.filename)}` +
                `&subfolder=${encodeURIComponent(img.subfolder ?? '')}` +
                `&type=${encodeURIComponent(img.type ?? 'output')}`,
            );
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(
      `ComfyUI ${Math.round(this.timeoutMs / 1000)} saniye icinde gorsel uretmedi. Daha kucuk bir gorsel boyutu deneyin (COMFYUI_WIDTH/HEIGHT).`,
    );
  }
}
