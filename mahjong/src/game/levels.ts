import { LAYOUTS, Layout } from './layouts';

/**
 * Seviyeler: ilk seviyelerde her dizilim küçükten büyüğe bir kez gelir,
 * sonra orta ve büyük dizilimler farklı dağıtımlarla döner.
 */
export const LEVEL_COUNT = 200;

const BY_SIZE: Layout[] = LAYOUTS.slice().sort((a, b) => a.positions.length - b.positions.length);

export interface LevelInfo {
  level: number;
  layout: Layout;
  seed: number;
}

export function getLevel(level: number): LevelInfo {
  const n = Math.max(1, Math.min(LEVEL_COUNT, Math.floor(level)));
  let layout: Layout;
  if (n <= BY_SIZE.length) {
    layout = BY_SIZE[n - 1];
  } else {
    // Küçük ilk 3 dizilim hariç, diğerleri arasında dönüşümlü
    const pool = BY_SIZE.slice(3);
    const k = n - BY_SIZE.length - 1;
    // Her turda dizilim sırası karışsın diye adım 5 (pool uzunluğu ile aralarında asal olmalı)
    const step = gcd(5, pool.length) === 1 ? 5 : 1;
    layout = pool[(k * step) % pool.length];
  }
  return { level: n, layout, seed: n * 7919 + 104729 };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
