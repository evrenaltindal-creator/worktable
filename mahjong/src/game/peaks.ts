/**
 * "Zirve": iki tepe şeklinde dizilmiş sayılı taşlar. Elindeki taştan bir büyük
 * ya da bir küçük olan açık taşa dokun (9 ile 1 de komşudur). Hamle yoksa
 * desteden yeni taş çek. Tüm tepe taşlarını temizleyince kazanırsın.
 *
 * Seviye her zaman kazanılabilir üretilir: önce geçerli bir kaldırma sırası
 * seçilir, sayılar bu sıraya göre +1/-1 adımlarla atanır, kopan yerlere
 * desteden taş konur. Desteye ayrıca birkaç yedek taş eklenir.
 */
import { createRng, randInt, Rng } from './rng';
import { FaceId } from './tiles';

export interface PeakSlot {
  /** Taş genişliği biriminde yatay konum (yarım adımlar olabilir) */
  x: number;
  row: number;
}

export interface PeaksLevel {
  slots: PeakSlot[];
  /** Her taşın üstünü kapatan (alt sıradaki) taşlar */
  coveredBy: number[][];
  faces: FaceId[];
  /** Deste: ilk taş başlangıçta açılır */
  stock: FaceId[];
  /** Geçerli çözüm: taş dizini ya da -1 (desteden çek) */
  solution: number[];
}

export const PEAKS_LEVELS = 100;

const ROWS: number[][] = [
  [1.5, 5.5],
  [1, 2, 5, 6],
  [0.5, 1.5, 2.5, 4.5, 5.5, 6.5],
  [0, 1, 2, 3, 4, 5, 6, 7],
];

export const PEAK_SLOTS: PeakSlot[] = ROWS.flatMap((xs, row) => xs.map((x) => ({ x, row })));

export const PEAK_COVERS: number[][] = PEAK_SLOTS.map((s) =>
  PEAK_SLOTS.map((o, j) => (o.row === s.row + 1 && Math.abs(o.x - s.x) < 1 ? j : -1)).filter((j) => j >= 0),
);

export function peakValue(face: FaceId): number {
  return Number(face[1]);
}

/** a'dan sonra b oynanabilir mi: değer farkı 1 (9 ile 1 komşu) */
export function isNeighbor(a: number, b: number): boolean {
  const d = Math.abs(a - b);
  return d === 1 || d === 8;
}

export function isFreePeak(i: number, present: boolean[]): boolean {
  return present[i] && PEAK_COVERS[i].every((j) => !present[j]);
}

const SUITS = ['d', 'b', 'c'];
const face = (v: number, rng: Rng) => `${SUITS[randInt(rng, 3)]}${v}`;
const step = (v: number, dir: number) => ((v - 1 + dir + 9) % 9) + 1;

function generate(level: number, variant: number): PeaksLevel {
  const rng = createRng(level * 86028121 + 5 + variant * 7349);
  const n = PEAK_SLOTS.length;
  const present = PEAK_SLOTS.map(() => true);
  const faces: FaceId[] = PEAK_SLOTS.map(() => '');
  const stock: FaceId[] = [];
  const solution: number[] = [];

  let current = 1 + randInt(rng, 9);
  stock.push(face(current, rng));
  let run = 0;
  const maxRun = Math.max(3, 7 - Math.floor(level / 15));
  for (let removed = 0; removed < n; removed++) {
    if (run >= maxRun || (run >= 2 && rng() < 0.25)) {
      // zincir kopar: desteden yeni taş
      current = 1 + randInt(rng, 9);
      stock.push(face(current, rng));
      solution.push(-1);
      run = 0;
    }
    const free = present.map((_, i) => i).filter((i) => isFreePeak(i, present));
    const pick = free[randInt(rng, free.length)];
    current = step(current, rng() < 0.5 ? 1 : -1);
    faces[pick] = face(current, rng);
    present[pick] = false;
    solution.push(pick);
    run++;
  }
  // Yedek taşlar (seviye ilerledikçe azalır)
  const spare = Math.max(3, 9 - Math.floor(level / 8));
  for (let k = 0; k < spare; k++) stock.push(face(1 + randInt(rng, 9), rng));
  return { slots: PEAK_SLOTS, coveredBy: PEAK_COVERS, faces, stock, solution };
}

/** Rastgele oynayan basit bir oyuncunun kazanma oranı (zorluk ölçüsü) */
export function simulatedWinRate(lv: PeaksLevel, games: number, seed = 12345): number {
  const rng = createRng(seed);
  let wins = 0;
  for (let g = 0; g < games; g++) {
    const present = lv.faces.map(() => true);
    let cur = peakValue(lv.stock[0]);
    let next = 1;
    for (;;) {
      if (!present.some(Boolean)) {
        wins++;
        break;
      }
      const cand: number[] = [];
      for (let i = 0; i < present.length; i++) if (isFreePeak(i, present) && isNeighbor(cur, peakValue(lv.faces[i]))) cand.push(i);
      if (cand.length) {
        const i = cand[randInt(rng, cand.length)];
        present[i] = false;
        cur = peakValue(lv.faces[i]);
      } else if (next < lv.stock.length) cur = peakValue(lv.stock[next++]);
      else break;
    }
  }
  return wins / games;
}

/** Hedef zorluk: ilk seviyeler kolay (~%85), sonra yavaşça zorlaşır (~%45) */
export function targetWinRate(level: number): number {
  return Math.max(0.45, 0.85 - (level - 1) * 0.01);
}

/**
 * Seviye üretimi: birkaç aday üretilir, basit oyuncu ile denenir ve hedef
 * zorluğa en yakın olan seçilir. Böylece seviyeler arasında zorluk dengeli artar.
 */
export function buildPeaksLevel(level: number): PeaksLevel {
  const target = targetWinRate(level);
  let best: PeaksLevel | null = null;
  let bestDiff = Infinity;
  for (let variant = 0; variant < 24; variant++) {
    const lv = generate(level, variant);
    const diff = Math.abs(simulatedWinRate(lv, 60) - target);
    if (diff < bestDiff) {
      best = lv;
      bestDiff = diff;
    }
    if (diff <= 0.06) break;
  }
  return best as PeaksLevel;
}

/** Kalan deste sayısına göre yıldız */
export function peaksStars(stockLeft: number): number {
  if (stockLeft >= 4) return 3;
  if (stockLeft >= 2) return 2;
  return 1;
}
