/**
 * Oyun kuralları ve dağıtım.
 *
 * Kural: bir taş "serbest" ise seçilebilir. Serbest olmak için
 *   1) üstünde (onunla çakışan daha yüksek katta) taş olmamalı ve
 *   2) sol VEYA sağ yanı boş olmalı.
 * Aynı türden iki serbest taş seçilince kalkar.
 *
 * Dağıtım her zaman ÇÖZÜLEBİLİR üretilir: dolu tahtadan geriye doğru, her
 * adımda o an serbest olan iki taşa aynı tür atanarak "kaldırılır". Bu
 * kaldırma sırası, geçerli bir çözümün kendisidir.
 */
import { Pos } from './layouts';
import { Rng, createRng, randInt, shuffleInPlace } from './rng';
import { FaceId, FLOWER_FACES, SEASON_FACES, STANDARD_FACES, matchGroup } from './tiles';

export interface Relations {
  /** i'nin üstünde duran (onu kapatan) taşlar */
  above: number[][];
  left: number[][];
  right: number[][];
}

export function computeRelations(positions: Pos[]): Relations {
  const n = positions.length;
  const above: number[][] = Array.from({ length: n }, () => []);
  const left: number[][] = Array.from({ length: n }, () => []);
  const right: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const a = positions[i];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const b = positions[j];
      const overlapY = Math.abs(a.y - b.y) < 2;
      if (b.z > a.z && Math.abs(a.x - b.x) < 2 && overlapY) above[i].push(j);
      if (b.z === a.z && overlapY) {
        if (b.x === a.x - 2) left[i].push(j);
        if (b.x === a.x + 2) right[i].push(j);
      }
    }
  }
  return { above, left, right };
}

const anyPresent = (list: number[], present: boolean[]) => {
  for (const j of list) if (present[j]) return true;
  return false;
};

export function isFree(i: number, present: boolean[], rel: Relations): boolean {
  if (!present[i]) return false;
  if (anyPresent(rel.above[i], present)) return false;
  return !anyPresent(rel.left[i], present) || !anyPresent(rel.right[i], present);
}

export function freeTiles(present: boolean[], rel: Relations): number[] {
  const out: number[] = [];
  for (let i = 0; i < present.length; i++) if (isFree(i, present, rel)) out.push(i);
  return out;
}

/**
 * Eşleşme kuralı. Klasik oyunda aynı taşlar eşleşir; "Toplam 10" gibi
 * modlarda başka bir kural kullanılır.
 */
export interface MatchRule {
  canMatch(a: FaceId, b: FaceId): boolean;
  /** Kalan taşları birbiriyle eşleşebilen çiftlere ayırır (karıştırma için) */
  pairUp(faces: FaceId[]): [FaceId, FaceId][];
  /** n taşlık tahta için dağıtılacak çiftler */
  choosePairs(tileCount: number, rng: Rng): [FaceId, FaceId][];
}

function pairByGroup(faces: FaceId[]): [FaceId, FaceId][] {
  const byGroup = new Map<string, FaceId[]>();
  for (const f of faces) {
    const g = matchGroup(f);
    const list = byGroup.get(g);
    if (list) list.push(f);
    else byGroup.set(g, [f]);
  }
  const pairs: [FaceId, FaceId][] = [];
  for (const list of byGroup.values()) {
    for (let k = 0; k + 1 < list.length; k += 2) pairs.push([list[k], list[k + 1]]);
  }
  return pairs;
}

export const CLASSIC_RULE: MatchRule = {
  canMatch: (a, b) => matchGroup(a) === matchGroup(b),
  pairUp: pairByGroup,
  choosePairs: (n, rng) => choosePairs(n, rng),
};

/** Oynanabilir tüm eşleşmeler (çiftler). */
export function availablePairs(
  faces: FaceId[],
  present: boolean[],
  rel: Relations,
  rule: MatchRule = CLASSIC_RULE,
): [number, number][] {
  const free = freeTiles(present, rel);
  const pairs: [number, number][] = [];
  for (let a = 0; a < free.length; a++) {
    for (let b = a + 1; b < free.length; b++) {
      if (rule.canMatch(faces[free[a]], faces[free[b]])) pairs.push([free[a], free[b]]);
    }
  }
  return pairs;
}

/**
 * Verilen konumlara (sadece active=true olanlara) çiftleri, çözülebilir olacak
 * şekilde yerleştirir. Başarısız olursa null döner.
 */
interface Placement {
  faces: (FaceId | null)[];
  /** Taşların kaldırılma sırası: geçerli bir çözüm */
  solution: [number, number][];
}

function placePairs(
  rel: Relations,
  active: boolean[],
  pairs: [FaceId, FaceId][],
  rng: Rng,
  positions: Pos[],
): Placement | null {
  const solution: [number, number][] = [];
  const present = active.slice();
  const faces: (FaceId | null)[] = active.map(() => null);
  let remaining = present.filter(Boolean).length;
  const order = shuffleInPlace(pairs.slice(), rng);

  for (const [fa, fb] of order) {
    const free = freeTiles(present, rel);
    if (free.length < 2) return null;

    // Yüksek katlardaki taşları önce kaldırmak çıkmaza girmeyi azaltır.
    const weight = (i: number) => 1 + positions[i].z * 3 + rel.above[i].length;
    let chosen: [number, number] | null = null;
    for (let tries = 0; tries < 12 && !chosen; tries++) {
      const a = weightedPick(free, weight, rng);
      let b = weightedPick(free, weight, rng);
      if (a === b) b = free[(free.indexOf(a) + 1 + randInt(rng, free.length - 1)) % free.length];
      present[a] = false;
      present[b] = false;
      const ok = remaining - 2 === 0 || freeTiles(present, rel).length >= 2;
      if (ok) chosen = [a, b];
      else {
        present[a] = true;
        present[b] = true;
      }
    }
    if (!chosen) return null;
    faces[chosen[0]] = fa;
    faces[chosen[1]] = fb;
    solution.push(chosen);
    remaining -= 2;
  }
  return { faces, solution };
}

function weightedPick(list: number[], weight: (i: number) => number, rng: Rng): number {
  let total = 0;
  for (const i of list) total += weight(i);
  let r = rng() * total;
  for (const i of list) {
    r -= weight(i);
    if (r <= 0) return i;
  }
  return list[list.length - 1];
}

/** n taşlık bir tahta için taş çiftlerini seçer. */
export function choosePairs(tileCount: number, rng: Rng): [FaceId, FaceId][] {
  const pairCount = tileCount / 2;
  // Her tür normalde 4 taş (2 çift) olarak kullanılır.
  const kindsNeeded = Math.ceil(pairCount / 2);
  const kinds: string[] = shuffleInPlace(STANDARD_FACES.slice(), rng);
  if (kindsNeeded > kinds.length) kinds.push('F', 'S');
  const pairs: [FaceId, FaceId][] = [];
  for (let k = 0; pairs.length < pairCount; k++) {
    const kind = kinds[k % kinds.length];
    const take = Math.min(2, pairCount - pairs.length);
    if (kind === 'F' || kind === 'S') {
      const set = shuffleInPlace((kind === 'F' ? FLOWER_FACES : SEASON_FACES).slice(), rng);
      for (let p = 0; p < take; p++) pairs.push([set[p * 2], set[p * 2 + 1]]);
    } else {
      for (let p = 0; p < take; p++) pairs.push([kind, kind]);
    }
  }
  return pairs;
}

export function dealWithSolution(positions: Pos[], rel: Relations, seed: number, rule: MatchRule = CLASSIC_RULE) {
  if (positions.length % 2 !== 0) throw new Error('Taş sayısı çift olmalı');
  const rng = createRng(seed);
  const pairs = rule.choosePairs(positions.length, rng);
  const active = positions.map(() => true);
  for (let attempt = 0; attempt < 500; attempt++) {
    const placed = placePairs(rel, active, pairs, rng, positions);
    if (placed) return { faces: placed.faces as FaceId[], solution: placed.solution };
  }
  throw new Error('Çözülebilir dağıtım üretilemedi');
}

export function dealSolvable(positions: Pos[], rel: Relations, seed: number, rule: MatchRule = CLASSIC_RULE): FaceId[] {
  return dealWithSolution(positions, rel, seed, rule).faces;
}

/**
 * Kalan taşları karıştırır; sonuç yine çözülebilir olur.
 * Başarısız olursa (çok nadir) basit karıştırma yapar.
 */
export function reshuffle(
  positions: Pos[],
  rel: Relations,
  faces: FaceId[],
  present: boolean[],
  seed: number,
  rule: MatchRule = CLASSIC_RULE,
): FaceId[] {
  return reshuffleWithSolution(positions, rel, faces, present, seed, rule).faces;
}

export function reshuffleWithSolution(
  positions: Pos[],
  rel: Relations,
  faces: FaceId[],
  present: boolean[],
  seed: number,
  rule: MatchRule = CLASSIC_RULE,
): { faces: FaceId[]; solution: [number, number][] | null } {
  const rng = createRng(seed);
  const pairs = rule.pairUp(faces.filter((_, i) => present[i]));

  const next = faces.slice();
  for (let attempt = 0; attempt < 300; attempt++) {
    const placed = placePairs(rel, present, pairs, rng, positions);
    if (placed) {
      placed.faces.forEach((f, i) => {
        if (present[i] && f) next[i] = f;
      });
      return { faces: next, solution: placed.solution };
    }
  }
  const idx = present.map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
  const pool = shuffleInPlace(idx.map((i) => faces[i]), rng);
  idx.forEach((i, k) => (next[i] = pool[k]));
  return { faces: next, solution: null };
}

/** İpucu: oynanabilir bir çift. Varsa üst katları açan çifti tercih eder. */
export function findHint(
  positions: Pos[],
  faces: FaceId[],
  present: boolean[],
  rel: Relations,
  rule: MatchRule = CLASSIC_RULE,
): [number, number] | null {
  const pairs = availablePairs(faces, present, rel, rule);
  if (pairs.length === 0) return null;
  let best = pairs[0];
  let bestScore = -Infinity;
  for (const [a, b] of pairs) {
    const score = positions[a].z + positions[b].z;
    if (score > bestScore) {
      best = [a, b];
      bestScore = score;
    }
  }
  return best;
}
