/*
 * Oyunun ses efektlerini matematiksel olarak sentezler (dışarıdan ses kullanılmaz).
 * Çıktı: assets/sounds/*.wav   —   npm run gen:sounds
 */
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(file, samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

const buf = (sec) => new Float32Array(Math.ceil(sec * RATE));

/** Sönümlenen tını (birkaç harmonik ile yumuşak "çan/ahşap" sesi). */
function tone(out, start, freq, dur, vol, decay, harmonics = [1, 0.35, 0.12]) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / RATE;
    const attack = Math.min(1, t / 0.004);
    const env = attack * Math.exp(-t * decay);
    let v = 0;
    harmonics.forEach((a, k) => (v += a * Math.sin(2 * Math.PI * freq * (k + 1) * t)));
    out[s0 + i] += v * env * vol;
  }
}

/** Kısa ahşap tıkırtısı (taşların birbirine değmesi). */
function click(out, start, vol = 0.5, pitch = 1800) {
  const s0 = Math.floor(start * RATE);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  let lp = 0;
  for (let i = 0; i < 0.05 * RATE && s0 + i < out.length; i++) {
    const t = i / RATE;
    lp = lp * 0.6 + rnd() * 0.4;
    const env = Math.exp(-t * 90);
    out[s0 + i] += (lp * 0.6 + Math.sin(2 * Math.PI * pitch * t) * 0.5 + Math.sin(2 * Math.PI * pitch * 0.53 * t) * 0.3) * env * vol;
  }
}

function normalize(a, peak = 0.8) {
  let m = 0;
  for (const v of a) m = Math.max(m, Math.abs(v));
  return Array.from(a, (v) => (v / (m || 1)) * peak);
}

fs.mkdirSync(OUT, { recursive: true });

// Taş seçme
let a = buf(0.08);
click(a, 0, 0.6, 1700);
writeWav(path.join(OUT, 'tap.wav'), normalize(a, 0.55));

// Eşleşme: iki yumuşak nota (Mi - Si)
a = buf(0.55);
click(a, 0, 0.35, 2000);
tone(a, 0.0, 659.25, 0.45, 0.5, 9);
tone(a, 0.09, 987.77, 0.45, 0.45, 8);
writeWav(path.join(OUT, 'match.wav'), normalize(a, 0.6));

// Hatalı seçim: alçak, yumuşak "tok"
a = buf(0.25);
tone(a, 0, 196, 0.25, 0.6, 22, [1, 0.2]);
tone(a, 0.06, 174.61, 0.2, 0.4, 24, [1, 0.2]);
writeWav(path.join(OUT, 'wrong.wav'), normalize(a, 0.5));

// Karıştırma: art arda tıkırtılar
a = buf(0.5);
for (let k = 0; k < 9; k++) click(a, k * 0.045 + (k % 2) * 0.01, 0.4 + (k % 3) * 0.1, 1400 + (k % 4) * 180);
writeWav(path.join(OUT, 'shuffle.wav'), normalize(a, 0.55));

// İpucu: hafif parıltı
a = buf(0.5);
tone(a, 0, 1318.5, 0.4, 0.4, 10);
tone(a, 0.07, 1567.98, 0.4, 0.35, 10);
writeWav(path.join(OUT, 'hint.wav'), normalize(a, 0.45));

// Kazanma: yükselen arpej (Do - Mi - Sol - Do)
a = buf(1.6);
[523.25, 659.25, 783.99, 1046.5].forEach((f, k) => tone(a, k * 0.13, f, 1.2, 0.5, 3.2));
tone(a, 0.52, 1318.5, 1.0, 0.25, 3);
writeWav(path.join(OUT, 'win.wav'), normalize(a, 0.65));

console.log('Sesler üretildi:', fs.readdirSync(OUT).join(', '));
