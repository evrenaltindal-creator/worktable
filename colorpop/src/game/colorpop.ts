/**
 * Renk Patlatma motoru — çizimden bağımsız, saf TypeScript.
 *
 * COLS x ROWS tahta. Aynı renkten en az 2 komşu karodan oluşan bir gruba dokununca grup patlar.
 * Üstteki karolar aşağı düşer; tamamen boşalan sütunlar ortaya doğru kayar (tahta dengeli kalsın).
 * Patlatılacak grup kalmayınca oyun biter. Seviye hedefi: en fazla şu kadar karo bırakmak.
 * Hedef, yerleşik bir çözücünün bulduğu sonuca göre konur; yani her seviye kazanılabilir.
 */
import { createRng, randInt } from '../kit/rng';

export const COLS = 8;
export const ROWS = 10;

export interface Tile {
  id: number;
  color: number;
}
/** board[c][r]: sütun c, satır r (0 = en alt). null = boş */
export type Board = (Tile | null)[][];

export const cloneBoard = (b: Board): Board => b.map((col) => col.slice());

export function groupAt(b: Board, c: number, r: number): [number, number][] {
  const t = b[c]?.[r];
  if (!t) return [];
  const seen = new Set<string>([`${c},${r}`]);
  const out: [number, number][] = [[c, r]];
  for (let k = 0; k < out.length; k++) {
    const [x, y] = out[k];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const n = b[nx]?.[ny];
      if (!n || n.color !== t.color || seen.has(`${nx},${ny}`)) continue;
      seen.add(`${nx},${ny}`);
      out.push([nx, ny]);
    }
  }
  return out;
}

/** Tüm gruplar (2 ve üzeri), her grup bir kez */
export function groups(b: Board): [number, number][][] {
  const seen = new Set<string>();
  const out: [number, number][][] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (!b[c][r] || seen.has(`${c},${r}`)) continue;
      const g = groupAt(b, c, r);
      g.forEach(([x, y]) => seen.add(`${x},${y}`));
      if (g.length >= 2) out.push(g);
    }
  }
  return out;
}

export const tilesLeft = (b: Board) => b.reduce((s, col) => s + col.filter(Boolean).length, 0);
export const hasMoves = (b: Board) => groups(b).length > 0;

/** Yerçekimi ve sütun kaydırma: boş sütunlar kenarlara itilir, dolu sütunlar ortada toplanır */
export function settle(b: Board): Board {
  const cols = b.map((col) => {
    const tiles = col.filter((t): t is Tile => !!t);
    return [...tiles, ...Array(ROWS - tiles.length).fill(null)] as (Tile | null)[];
  });
  const full = cols.filter((col) => col[0]);
  const empty = COLS - full.length;
  const leftPad = Math.floor(empty / 2);
  const blank = () => Array(ROWS).fill(null) as (Tile | null)[];
  return [...Array.from({ length: leftPad }, blank), ...full, ...Array.from({ length: empty - leftPad }, blank)];
}

export const points = (n: number) => (n - 1) * (n - 1) * 5 + 10;

/** Gruba dokun: patlatır ve tahtayı yerleştirir. Grup 2'den küçükse null. */
export function pop(b: Board, c: number, r: number): { board: Board; removed: { c: number; r: number; tile: Tile }[]; points: number } | null {
  const g = groupAt(b, c, r);
  if (g.length < 2) return null;
  const next = cloneBoard(b);
  const removed = g.map(([x, y]) => ({ c: x, r: y, tile: b[x][y] as Tile }));
  g.forEach(([x, y]) => (next[x][y] = null));
  return { board: settle(next), removed, points: points(g.length) };
}

/** Çekiç: tek bir karoyu kaldırır */
export function smash(b: Board, c: number, r: number) {
  if (!b[c]?.[r]) return null;
  const next = cloneBoard(b);
  const tile = next[c][r] as Tile;
  next[c][r] = null;
  return { board: settle(next), removed: [{ c, r, tile }], points: 0 };
}

/** Sonuna kadar oynayan rastgele/açgözlü oyuncu: kalan karo sayısını döner */
function rollout(b0: Board, rng: () => number, greedyBias: number): number {
  let b = b0;
  for (let k = 0; k < 200; k++) {
    const gs = groups(b);
    if (!gs.length) break;
    let g: [number, number][];
    if (rng() < greedyBias) {
      // en az kalan renkten olan küçük grupları önce temizleme eğilimi: en büyük grubu sakla
      gs.sort((a, z) => a.length - z.length);
      g = gs[Math.floor(rng() * Math.min(3, gs.length))];
    } else g = gs[randInt(rng, gs.length)];
    b = (pop(b, g[0][0], g[0][1]) as { board: Board }).board;
  }
  return tilesLeft(b);
}

/** İpucu: her grubu dener, ardından birkaç kısa oyun oynayıp en az karo bırakan hamleyi seçer */
export function bestMove(b: Board, seed = 1, tries = 6): [number, number] | null {
  const gs = groups(b);
  if (!gs.length) return null;
  const rng = createRng(seed);
  let best: [number, number] | null = null;
  let bestLeft = Infinity;
  for (const g of gs) {
    const after = (pop(b, g[0][0], g[0][1]) as { board: Board }).board;
    let left = Infinity;
    for (let k = 0; k < tries; k++) left = Math.min(left, rollout(after, rng, 0.7));
    // eşitlikte büyük grubu tercih et (daha çok puan)
    if (left < bestLeft || (left === bestLeft && best && g.length > groupAt(b, best[0], best[1]).length)) {
      bestLeft = left;
      best = g[0];
    }
  }
  return best;
}

export interface Level {
  number: number;
  colors: number;
  board: Board;
  /** en fazla bu kadar karo kalırsa seviye kazanılır */
  allowed: number;
}

export function makeBoard(colors: number, seed: number): Board {
  const rng = createRng(seed);
  let id = 1;
  const b: Board = [];
  for (let c = 0; c < COLS; c++) {
    const col: (Tile | null)[] = [];
    for (let r = 0; r < ROWS; r++) {
      // hafif kümelenme: bazen alttaki ya da soldaki rengi tekrar et
      let color = randInt(rng, colors);
      const roll = rng();
      if (roll < 0.22 && r > 0) color = (col[r - 1] as Tile).color;
      else if (roll < 0.38 && c > 0) color = (b[c - 1][r] as Tile).color;
      col.push({ id: id++, color });
    }
    b.push(col);
  }
  return b;
}

/** Seviye: renk sayısı artar; hedef, çözücünün sonucuna seviyeyle azalan bir pay eklenerek bulunur */
export function makeLevel(n: number, variant = 0): Level {
  const colors = n <= 3 ? 3 : n <= 20 ? 4 : 5;
  const seed = n * 7907 + variant * 3301 + 17;
  const board = makeBoard(colors, seed);
  const rng = createRng(seed + 1);
  let solved = Infinity;
  for (let k = 0; k < 60; k++) solved = Math.min(solved, rollout(board, rng, k % 2 ? 0.8 : 0.4));
  const slack = Math.max(2, 12 - Math.floor(n / 3));
  return { number: n, colors, board, allowed: solved + slack };
}
