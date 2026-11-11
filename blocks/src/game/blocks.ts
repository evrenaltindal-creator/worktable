/**
 * Blok Bulmaca motoru — çizimden bağımsız, saf TypeScript.
 *
 * 9x9 tahta. Oyuncuya her seferinde 3 parça verilir; parçalar döndürülmeden tahtaya konur.
 * Dolan her satır, sütun ve 3x3 kutu temizlenir. Hiçbir parça sığmazsa oyun biter.
 * Parça üreteci adil davranır: verilen üçlüden en az biri her zaman tahtaya sığar.
 */
import { createRng, randInt } from '../kit/rng';

export const N = 9;

/** Parça: hücre koordinatları [satır, sütun], sol üst 0,0 */
export type Shape = [number, number][];
export interface Piece {
  id: number;
  shape: number; // SHAPES dizinindeki yeri
  color: number; // 0..5
}

const parse = (rows: string[]): Shape => {
  const out: Shape = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => ch === '#' && out.push([r, c])));
  return out;
};

/** Tüm parçalar; ağırlık = ne sıklıkla geldiği (küçük parçalar biraz daha sık) */
export const SHAPES: { cells: Shape; weight: number }[] = [
  { cells: parse(['#']), weight: 2 },
  { cells: parse(['##']), weight: 3 },
  { cells: parse(['#', '#']), weight: 3 },
  { cells: parse(['###']), weight: 3 },
  { cells: parse(['#', '#', '#']), weight: 3 },
  { cells: parse(['####']), weight: 2 },
  { cells: parse(['#', '#', '#', '#']), weight: 2 },
  { cells: parse(['#####']), weight: 1 },
  { cells: parse(['#', '#', '#', '#', '#']), weight: 1 },
  { cells: parse(['##', '##']), weight: 3 },
  { cells: parse(['###', '###', '###']), weight: 1 },
  { cells: parse(['#.', '##']), weight: 2 },
  { cells: parse(['.#', '##']), weight: 2 },
  { cells: parse(['##', '#.']), weight: 2 },
  { cells: parse(['##', '.#']), weight: 2 },
  { cells: parse(['#..', '###']), weight: 2 },
  { cells: parse(['..#', '###']), weight: 2 },
  { cells: parse(['###', '#..']), weight: 2 },
  { cells: parse(['###', '..#']), weight: 2 },
  { cells: parse(['###', '.#.']), weight: 2 },
  { cells: parse(['.#.', '###']), weight: 2 },
  { cells: parse(['#.', '##', '#.']), weight: 2 },
  { cells: parse(['.#', '##', '.#']), weight: 2 },
  { cells: parse(['##.', '.##']), weight: 2 },
  { cells: parse(['.##', '##.']), weight: 2 },
  { cells: parse(['#.', '##', '.#']), weight: 2 },
  { cells: parse(['.#', '##', '#.']), weight: 2 },
  { cells: parse(['#..', '#..', '###']), weight: 1 },
  { cells: parse(['###', '..#', '..#']), weight: 1 },
];

export const shapeSize = (s: number) => {
  const cells = SHAPES[s].cells;
  return { rows: Math.max(...cells.map(([r]) => r)) + 1, cols: Math.max(...cells.map(([, c]) => c)) + 1 };
};

/** board[i] = renk (0..5) ya da -1 */
export type Board = number[];
export const emptyBoard = (): Board => Array(N * N).fill(-1);

export function fits(b: Board, s: number, r: number, c: number): boolean {
  return SHAPES[s].cells.every(([dr, dc]) => {
    const rr = r + dr;
    const cc = c + dc;
    return rr >= 0 && cc >= 0 && rr < N && cc < N && b[rr * N + cc] < 0;
  });
}

export function fitsAnywhere(b: Board, s: number): boolean {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (fits(b, s, r, c)) return true;
  return false;
}

/** Dolan satır, sütun ve kutuların hücreleri */
export function fullCells(b: Board): { cells: Set<number>; lines: number } {
  const cells = new Set<number>();
  let lines = 0;
  const groups: number[][] = [];
  for (let i = 0; i < N; i++) {
    groups.push(Array.from({ length: N }, (_, k) => i * N + k)); // satır
    groups.push(Array.from({ length: N }, (_, k) => k * N + i)); // sütun
    const br = Math.floor(i / 3) * 3;
    const bc = (i % 3) * 3;
    groups.push(Array.from({ length: N }, (_, k) => (br + Math.floor(k / 3)) * N + bc + (k % 3))); // kutu
  }
  for (const g of groups) {
    if (g.every((x) => b[x] >= 0)) {
      lines++;
      g.forEach((x) => cells.add(x));
    }
  }
  return { cells, lines };
}

export interface PlaceResult {
  board: Board;
  placed: number[];
  cleared: number[];
  lines: number;
  points: number;
}

/** Parçayı koyar, dolan bölgeleri temizler. combo: üst üste temizleme sayısı (puan çarpanı) */
export function place(b0: Board, piece: Piece, r: number, c: number, combo: number): PlaceResult | null {
  if (!fits(b0, piece.shape, r, c)) return null;
  const b = b0.slice();
  const placed = SHAPES[piece.shape].cells.map(([dr, dc]) => (r + dr) * N + c + dc);
  placed.forEach((i) => (b[i] = piece.color));
  const { cells, lines } = fullCells(b);
  cells.forEach((i) => (b[i] = -1));
  const points = placed.length + (lines ? lines * lines * 10 * (1 + combo) : 0);
  return { board: b, placed, cleared: [...cells], lines, points };
}

export class Dealer {
  private rng: () => number;
  private next = 1;
  constructor(seed: number) {
    this.rng = createRng(seed);
  }
  private pick(): number {
    const total = SHAPES.reduce((s, x) => s + x.weight, 0);
    let v = this.rng() * total;
    for (let i = 0; i < SHAPES.length; i++) {
      v -= SHAPES[i].weight;
      if (v < 0) return i;
    }
    return 0;
  }
  /** Üç yeni parça; en az biri tahtaya sığar (sığmazsa küçük bir parça eklenir) */
  deal(b: Board): Piece[] {
    const out: Piece[] = [];
    for (let k = 0; k < 3; k++) out.push({ id: this.next++, shape: this.pick(), color: randInt(this.rng, 6) });
    if (!out.some((p) => fitsAnywhere(b, p.shape))) {
      const small = [0, 1, 2, 3, 4, 9].find((s) => fitsAnywhere(b, s));
      if (small !== undefined) out[randInt(this.rng, 3)] = { id: this.next++, shape: small, color: randInt(this.rng, 6) };
    }
    return out;
  }
}

/** Oyun bitti mi: kalan parçaların hiçbiri sığmıyor */
export const isStuck = (b: Board, pieces: (Piece | null)[]) => pieces.every((p) => !p || !fitsAnywhere(b, p.shape));

/** İpucu: en çok temizleyen, sonra en çok komşuya yaslanan yerleşim */
export function bestMove(b: Board, pieces: (Piece | null)[]): { slot: number; r: number; c: number } | null {
  let best: { slot: number; r: number; c: number; score: number } | null = null;
  pieces.forEach((p, slot) => {
    if (!p) return;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const res = place(b, p, r, c, 0);
        if (!res) continue;
        // komşu dolu hücre / kenar sayısı: boşlukları azaltan yerleşimleri sever
        let touch = 0;
        for (const i of res.placed) {
          const rr = Math.floor(i / N);
          const cc = i % N;
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const y = rr + dr;
            const x = cc + dc;
            if (y < 0 || x < 0 || y >= N || x >= N || (b[y * N + x] >= 0 && !res.placed.includes(y * N + x))) touch++;
          }
        }
        const score = res.lines * 100 + touch * 2 + res.placed.length;
        if (!best || score > best.score) best = { slot, r, c, score };
      }
    }
  });
  return best ? { slot: (best as { slot: number }).slot, r: (best as { r: number }).r, c: (best as { c: number }).c } : null;
}

/** Taş rengi: seviye başında tahtada duran gri bloklar */
export const STONE = 6;

export interface Level {
  number: number;
  target: number;
  board: Board;
  seed: number;
}

/** Seviye: hedef puan ve başlangıçtaki taş sayısı seviyeyle yavaşça artar */
export function makeLevel(n: number, variant = 0): Level {
  const rng = createRng(n * 48271 + 11 + variant * 6151);
  const b = emptyBoard();
  const stones = Math.min(18, Math.floor(n * 1.1));
  for (let k = 0; k < stones; k++) {
    const i = randInt(rng, N * N);
    b[i] = STONE;
  }
  // başlangıçta dolu bölge kalmasın
  fullCells(b).cells.forEach((i) => (b[i] = -1));
  return { number: n, target: Math.min(1800, 200 + n * 40), board: b, seed: n * 977 + variant * 131 + 5 };
}
