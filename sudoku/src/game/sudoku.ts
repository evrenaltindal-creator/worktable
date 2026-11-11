/**
 * Sudoku motoru: bulmaca üretimi, çözüm sayma, mantıkla çözme.
 *
 * Tahta 81 hücrelik dizi (satır satır), 0 = boş.
 * Her bulmacanın TEK çözümü vardır. Kolay ve Orta bulmacalar sadece temel
 * mantıkla (tek aday / tek yer) çözülebilir; tahmin gerektirmez.
 */
import { createRng, Rng, shuffleInPlace } from './rng';

export type Grid = number[];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

/** Hedef ipucu (dolu hücre) sayısı */
const TARGET_CLUES: Record<Difficulty, number> = { easy: 40, medium: 33, hard: 28, expert: 24 };

export const row = (i: number) => Math.floor(i / 9);
export const col = (i: number) => i % 9;
export const box = (i: number) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3);

/** Her hücrenin "akrabaları": aynı satır, sütun veya kutudaki diğer 20 hücre */
export const PEERS: number[][] = Array.from({ length: 81 }, (_, i) =>
  Array.from({ length: 81 }, (_, j) => j).filter((j) => j !== i && (row(j) === row(i) || col(j) === col(i) || box(j) === box(i))),
);

/** 27 birim: 9 satır, 9 sütun, 9 kutu */
export const UNITS: number[][] = [
  ...Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c)),
  ...Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, r) => r * 9 + c)),
  ...Array.from({ length: 9 }, (_, b) =>
    Array.from({ length: 9 }, (_, k) => (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * 9 + (b % 3) * 3 + (k % 3)),
  ),
];

const ALL = 0x3fe; // 1..9 bitleri
const bit = (d: number) => 1 << d;
const popcount = (m: number) => {
  let c = 0;
  while (m) {
    m &= m - 1;
    c++;
  }
  return c;
};

/** Bir hücreye yazılabilecek rakamlar (bit maskesi) */
export function candidates(grid: Grid, i: number): number {
  let used = 0;
  for (const j of PEERS[i]) used |= bit(grid[j]);
  return ALL & ~used;
}

/** Çözüm sayısı (limit'e ulaşınca durur). En az adayı olan hücreden dallanır. */
export function countSolutions(input: Grid, limit = 2): number {
  const grid = input.slice();
  let count = 0;
  const search = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (grid[i]) continue;
      const m = candidates(grid, i);
      const c = popcount(m);
      if (c === 0) return false;
      if (c < bestCount) {
        best = i;
        bestMask = m;
        bestCount = c;
        if (c === 1) break;
      }
    }
    if (best === -1) {
      count++;
      return count >= limit;
    }
    for (let d = 1; d <= 9; d++) {
      if (!(bestMask & bit(d))) continue;
      grid[best] = d;
      if (search()) return true;
    }
    grid[best] = 0;
    return false;
  };
  search();
  return count;
}

/** Rastgele, tamamen dolu geçerli bir tahta */
function solvedGrid(rng: Rng): Grid {
  const grid: Grid = Array(81).fill(0);
  const fill = (i: number): boolean => {
    if (i === 81) return true;
    const digits = shuffleInPlace([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
    const m = candidates(grid, i);
    for (const d of digits) {
      if (!(m & bit(d))) continue;
      grid[i] = d;
      if (fill(i + 1)) return true;
    }
    grid[i] = 0;
    return false;
  };
  fill(0);
  return grid;
}

/**
 * Sadece temel mantıkla çözmeyi dener: tek aday (hücreye tek rakam uyar) ve
 * tek yer (rakam birimde tek hücreye sığar). Çözebiliyorsa true.
 */
export function solvableBySingles(input: Grid): boolean {
  const grid = input.slice();
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < 81; i++) {
      if (grid[i]) continue;
      const m = candidates(grid, i);
      if (m === 0) return false;
      if (popcount(m) === 1) {
        grid[i] = Math.log2(m);
        progress = true;
      }
    }
    for (const unit of UNITS) {
      for (let d = 1; d <= 9; d++) {
        if (unit.some((i) => grid[i] === d)) continue;
        const spots = unit.filter((i) => !grid[i] && candidates(grid, i) & bit(d));
        if (spots.length === 1) {
          grid[spots[0]] = d;
          progress = true;
        }
      }
    }
  }
  return grid.every((v) => v !== 0);
}

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
}

/** Zorluk ve numaraya göre her zaman aynı bulmacayı üretir. */
export function makePuzzle(difficulty: Difficulty, seed: number): Puzzle {
  const rng = createRng(seed * 2654435761 + DIFFICULTIES.indexOf(difficulty) * 97 + 1);
  const solution = solvedGrid(rng);
  const puzzle = solution.slice();
  const target = TARGET_CLUES[difficulty];
  const needsSingles = difficulty === 'easy' || difficulty === 'medium';
  // Simetrik çiftler halinde boşalt (görünüş dengeli olsun)
  const order = shuffleInPlace(Array.from({ length: 41 }, (_, i) => i), rng);
  let clues = 81;
  for (const i of order) {
    if (clues <= target) break;
    const j = 80 - i;
    const a = puzzle[i];
    const b = puzzle[j];
    puzzle[i] = 0;
    puzzle[j] = 0;
    const removed = i === j ? 1 : 2;
    const ok = countSolutions(puzzle, 2) === 1 && (!needsSingles || solvableBySingles(puzzle));
    if (ok) clues -= removed;
    else {
      puzzle[i] = a;
      puzzle[j] = b;
    }
  }
  // Zor ve Uzman: hedefe ulaşmak için tek tek hücre de boşalt
  if (!needsSingles && clues > target) {
    for (const i of shuffleInPlace(Array.from({ length: 81 }, (_, k) => k), rng)) {
      if (clues <= target) break;
      if (!puzzle[i]) continue;
      const a = puzzle[i];
      puzzle[i] = 0;
      if (countSolutions(puzzle, 2) === 1) clues--;
      else puzzle[i] = a;
    }
  }
  return { puzzle, solution, difficulty };
}

/** Bir birim (satır/sütun/kutu) tamamen ve doğru dolu mu */
export function unitComplete(values: Grid, solution: Grid, unit: number[]): boolean {
  return unit.every((i) => values[i] === solution[i]);
}

/** Günün bulmacası için tarih anahtarından sayı */
export function dateSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

export function countClues(g: Grid): number {
  return g.filter(Boolean).length;
}

export { createRng };
