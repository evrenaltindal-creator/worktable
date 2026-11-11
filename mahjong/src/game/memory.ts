/** "Hafıza": kapalı taşları ikişer ikişer çevirip eşlerini bul. */
import { createRng, shuffleInPlace } from './rng';
import { FaceId, STANDARD_FACES } from './tiles';

export interface MemoryLevel {
  cols: number;
  rows: number;
  faces: FaceId[];
}

export const MEMORY_LEVELS = 100;

const SIZES: [number, number][] = [
  [3, 4],
  [4, 4],
  [4, 5],
  [4, 6],
  [5, 6],
  [6, 6],
];

export function buildMemoryLevel(level: number): MemoryLevel {
  const rng = createRng(level * 32452843 + 11);
  const [cols, rows] = SIZES[Math.min(SIZES.length - 1, Math.floor((level - 1) / 2))];
  const pairs = (cols * rows) / 2;
  const kinds = shuffleInPlace(STANDARD_FACES.slice(), rng).slice(0, pairs);
  const faces = shuffleInPlace([...kinds, ...kinds], rng);
  return { cols, rows, faces };
}

/** Hamle sayısına göre yıldız: her çift için ~1,5 hamle çok iyi */
export function memoryStars(moves: number, pairs: number): number {
  if (moves <= Math.ceil(pairs * 1.6)) return 3;
  if (moves <= Math.ceil(pairs * 2.3)) return 2;
  return 1;
}
