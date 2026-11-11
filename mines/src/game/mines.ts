/**
 * Mayın Tarlası motoru.
 * - İlk dokunulan kare ve çevresi her zaman güvenlidir.
 * - Her tahta TAHMİN GEREKTİRMEDEN, sadece mantıkla çözülebilir üretilir
 *   (aşağıdaki çözücü ile denenir; çözülemeyen tahta atılır).
 */
import { createRng, randInt } from '../kit/rng';

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const SIZES: Record<Difficulty, { cols: number; rows: number; mines: number }> = {
  easy: { cols: 8, rows: 10, mines: 10 },
  medium: { cols: 9, rows: 12, mines: 20 },
  hard: { cols: 10, rows: 14, mines: 32 },
};

export interface Board {
  cols: number;
  rows: number;
  mines: boolean[];
  /** Her karenin çevresindeki mayın sayısı */
  counts: number[];
}

export function neighbors(cols: number, rows: number, i: number): number[] {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx);
    }
  return out;
}

function makeBoard(cols: number, rows: number, mineCount: number, safe: number, seed: number): Board {
  const rng = createRng(seed);
  const n = cols * rows;
  const forbidden = new Set([safe, ...neighbors(cols, rows, safe)]);
  const mines = Array(n).fill(false);
  let placed = 0;
  while (placed < mineCount) {
    const i = randInt(rng, n);
    if (mines[i] || forbidden.has(i)) continue;
    mines[i] = true;
    placed++;
  }
  const counts = mines.map((_, i) => neighbors(cols, rows, i).filter((j) => mines[j]).length);
  return { cols, rows, mines, counts };
}

/** Bir kareyi açar; boşsa (0) çevresine yayılır. Açılan karelerin listesini döner. */
export function reveal(b: Board, revealed: boolean[], flagged: boolean[], start: number): number[] {
  const opened: number[] = [];
  const stack = [start];
  while (stack.length) {
    const i = stack.pop() as number;
    if (revealed[i] || flagged[i]) continue;
    revealed[i] = true;
    opened.push(i);
    if (!b.mines[i] && b.counts[i] === 0) for (const j of neighbors(b.cols, b.rows, i)) if (!revealed[j]) stack.push(j);
  }
  return opened;
}

/**
 * Mantıkla güvenli olduğu kesin kareler ve kesin mayınlar.
 * Kurallar: (1) sayı - bayrak = 0 ise kalanlar güvenli; = kapalı sayısı ise hepsi mayın.
 * (2) Alt küme kuralı: A'nın kapalıları B'ninkilerin alt kümesiyse farkı çözülür.
 */
export function deduce(b: Board, revealed: boolean[], flagged: boolean[]): { safe: Set<number>; mines: Set<number> } {
  const safe = new Set<number>();
  const mines = new Set<number>();
  const cons: { cells: number[]; need: number }[] = [];
  for (let i = 0; i < b.mines.length; i++) {
    if (!revealed[i] || b.mines[i]) continue;
    const nb = neighbors(b.cols, b.rows, i);
    const unknown = nb.filter((j) => !revealed[j] && !flagged[j]);
    if (!unknown.length) continue;
    const need = b.counts[i] - nb.filter((j) => flagged[j]).length;
    if (need === 0) unknown.forEach((j) => safe.add(j));
    else if (need === unknown.length) unknown.forEach((j) => mines.add(j));
    else cons.push({ cells: unknown, need });
  }
  if (!safe.size && !mines.size) {
    for (const a of cons)
      for (const c of cons) {
        if (a === c || a.cells.length >= c.cells.length) continue;
        if (!a.cells.every((x) => c.cells.includes(x))) continue;
        const rest = c.cells.filter((x) => !a.cells.includes(x));
        const diff = c.need - a.need;
        if (diff === 0) rest.forEach((x) => safe.add(x));
        else if (diff === rest.length) rest.forEach((x) => mines.add(x));
      }
  }
  return { safe, mines };
}

/** İlk dokunuştan sonra sadece mantıkla sonuna kadar çözülebiliyor mu */
export function solvable(b: Board, first: number): boolean {
  const revealed = Array(b.mines.length).fill(false);
  const flagged = Array(b.mines.length).fill(false);
  reveal(b, revealed, flagged, first);
  for (let guard = 0; guard < 500; guard++) {
    const { safe, mines } = deduce(b, revealed, flagged);
    if (!safe.size && !mines.size) break;
    mines.forEach((i) => (flagged[i] = true));
    safe.forEach((i) => reveal(b, revealed, flagged, i));
  }
  return revealed.every((r, i) => r || b.mines[i]);
}

/** Zorluk + numara + ilk dokunuş -> her zaman aynı, tahminsiz çözülebilir tahta */
export function generate(d: Difficulty, number: number, first: number): Board {
  const { cols, rows, mines } = SIZES[d];
  for (let k = 0; k < 400; k++) {
    const b = makeBoard(cols, rows, mines, first, number * 7919 + k * 104729 + DIFFICULTIES.indexOf(d) * 31);
    if (solvable(b, first)) return b;
  }
  return makeBoard(cols, rows, mines, first, number);
}

export function isWon(b: Board, revealed: boolean[]): boolean {
  return revealed.every((r, i) => r || b.mines[i]);
}
