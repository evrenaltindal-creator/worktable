/**
 * Mahjong Küp motoru — çizimden bağımsız, saf TypeScript.
 *
 * Küpler bir taban ızgarasında sütunlar halinde üst üste durur (yükseklik haritası).
 * Bir küp serbesttir: üstünde küp yoksa VE dört yanından (±x, ±y) en az biri o yükseklikte boşsa.
 * Aynı sembollü iki serbest küp eşleşip kalkar. Görünüm 90° döndürülebilir; kural görünümden bağımsızdır.
 * Seviyeler, çözümü baştan bilinen "tersine kurma" ile üretilir: her seviyenin en az bir çözümü vardır.
 */
import { createRng, randInt, shuffleInPlace } from '../kit/rng';

export const SYMBOLS = 12;

export interface Cube {
  id: number;
  x: number;
  y: number;
  z: number;
  symbol: number;
}

/** Konumdan küp bulmak için anahtar */
export const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

export function indexCubes(cubes: Cube[]) {
  const m = new Map<string, Cube>();
  cubes.forEach((c) => m.set(key(c.x, c.y, c.z), c));
  return m;
}

export function isFree(c: Cube, at: Map<string, Cube>): boolean {
  if (at.has(key(c.x, c.y, c.z + 1))) return false;
  return !at.has(key(c.x + 1, c.y, c.z)) || !at.has(key(c.x - 1, c.y, c.z)) || !at.has(key(c.x, c.y + 1, c.z)) || !at.has(key(c.x, c.y - 1, c.z));
}

export function freeCubes(cubes: Cube[]): Cube[] {
  const at = indexCubes(cubes);
  return cubes.filter((c) => isFree(c, at));
}

/** Serbest ve aynı sembollü bir çift (ipucu); yoksa null */
export function findPair(cubes: Cube[]): [Cube, Cube] | null {
  const free = freeCubes(cubes);
  const by = new Map<number, Cube>();
  for (const c of free) {
    const other = by.get(c.symbol);
    if (other) return [other, c];
    by.set(c.symbol, c);
  }
  return null;
}

/**
 * Yerleri verilen küplere sembolleri tersine kurarak dağıtır: serbest iki yer seçilir, aynı sembol verilir,
 * kaldırılır; tahta boşalana kadar sürer. Böylece bu sıranın tersi bir çözümdür.
 */
export function assignSymbols(positions: { x: number; y: number; z: number }[], pairs: number[], rng: () => number): number[] | null {
  for (let attempt = 0; attempt < 60; attempt++) {
    const live: Cube[] = positions.map((p, i) => ({ id: i, ...p, symbol: -1 }));
    const symbols: number[] = Array(positions.length).fill(-1);
    const bag = shuffleInPlace(pairs.slice(), rng);
    let ok = true;
    for (const sym of bag) {
      const free = freeCubes(live);
      if (free.length < 2) {
        ok = false;
        break;
      }
      // üstteki (yüksek z) küpler önce: oyunda sona kalırlar, çözüm daha doğal olur
      const a = free.splice(randInt(rng, free.length), 1)[0];
      const b = free[randInt(rng, free.length)];
      symbols[a.id] = sym;
      symbols[b.id] = sym;
      live.splice(live.indexOf(a), 1);
      live.splice(live.indexOf(b), 1);
    }
    if (ok) return symbols;
  }
  return null;
}

export interface Level {
  number: number;
  cubes: Cube[];
  width: number;
  depth: number;
  kinds: number;
}

/** Seviye: taban ve yükseklik yavaşça büyür, ortası yüksek bir tepe; küp sayısı her zaman çift */
export function makeLevel(n: number, variant = 0): Level {
  const seed = n * 6151 + variant * 2749 + 7;
  const rng = createRng(seed);
  const width = Math.min(6, 3 + Math.floor((n - 1) / 4));
  const depth = Math.min(5, 3 + Math.floor((n - 1) / 6));
  const H = Math.min(4, 1 + Math.floor((n + 1) / 3));
  const kinds = Math.min(SYMBOLS, 4 + Math.floor(n / 2));
  for (let attempt = 0; attempt < 50; attempt++) {
    const positions: { x: number; y: number; z: number }[] = [];
    const cx = (width - 1) / 2;
    const cy = (depth - 1) / 2;
    const heights: number[] = [];
    for (let y = 0; y < depth; y++)
      for (let x = 0; x < width; x++) {
        const d = Math.max(Math.abs(x - cx) / Math.max(1, cx), Math.abs(y - cy) / Math.max(1, cy));
        let h = Math.round(H * (1 - d * 0.7) + (rng() - 0.5) * 1.2);
        h = Math.max(n <= 2 ? 1 : 0, Math.min(H, h));
        heights.push(h);
      }
    // çift sayıya getir: bir köşeyi bir kat alçalt (ya da yükselt)
    let total = heights.reduce((a, b) => a + b, 0);
    if (total % 2) {
      const i = heights.findIndex((h) => h > 1);
      if (i >= 0) heights[i]--;
      else heights[0]++;
      total = heights.reduce((a, b) => a + b, 0);
    }
    if (total < 8) continue;
    heights.forEach((h, i) => {
      for (let z = 0; z < h; z++) positions.push({ x: i % width, y: Math.floor(i / width), z });
    });
    // her çift bir sembol; türler sırayla dağıtılır
    const pairs = Array.from({ length: positions.length / 2 }, (_, k) => k % kinds);
    const symbols = assignSymbols(positions, pairs, rng);
    if (!symbols) continue;
    return { number: n, width, depth, kinds, cubes: positions.map((p, i) => ({ id: i + 1, ...p, symbol: symbols[i] })) };
  }
  throw new Error(`Küp seviyesi üretilemedi: ${n}`);
}

/** Takılınca: kalan küplerin sembollerini (aynı türler, aynı sayıda) çözülebilir biçimde yeniden dağıt */
export function reshuffle(cubes: Cube[], seed: number): Cube[] {
  const rng = createRng(seed);
  const sorted = cubes.map((c) => c.symbol).sort((x, y) => x - y);
  const pairs: number[] = [];
  for (let i = 0; i < sorted.length; i += 2) pairs.push(sorted[i]);
  const symbols = assignSymbols(cubes.map(({ x, y, z }) => ({ x, y, z })), pairs, rng);
  return symbols ? cubes.map((c, i) => ({ ...c, symbol: symbols[i] })) : cubes;
}

/** Görünüm döndürme: (x, y) noktasını taban merkezine göre r*90° çevirir */
export function rotate(x: number, y: number, r: number, width: number, depth: number) {
  const cx = (width - 1) / 2;
  const cy = (depth - 1) / 2;
  let dx = x - cx;
  let dy = y - cy;
  for (let k = 0; k < ((r % 4) + 4) % 4; k++) [dx, dy] = [-dy, dx];
  return { x: dx, y: dy };
}

/** Kalan küplerle oyun çözülebilir mi (açgözlü + geri izleme, küçük tahtalar için) */
export function solvable(cubes: Cube[], budget = 20000): boolean {
  let steps = 0;
  const seen = new Set<string>();
  const go = (cs: Cube[]): boolean => {
    if (!cs.length) return true;
    if (++steps > budget) return false;
    const sig = cs.map((c) => c.id).sort((a, b) => a - b).join(',');
    if (seen.has(sig)) return false;
    seen.add(sig);
    const free = freeCubes(cs);
    for (let i = 0; i < free.length; i++)
      for (let j = i + 1; j < free.length; j++) {
        if (free[i].symbol !== free[j].symbol) continue;
        if (go(cs.filter((c) => c !== free[i] && c !== free[j]))) return true;
      }
    return false;
  };
  return go(cubes);
}
