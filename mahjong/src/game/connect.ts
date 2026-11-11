/**
 * "Bağlantı": düz bir ızgarada aynı iki taş, en fazla iki kez dönen (en fazla
 * 3 düz parçalı) bir yolla birleştirilebiliyorsa kalkar. Yol boş hücrelerden ve
 * tahtanın dışından geçebilir.
 */
import { createRng, Rng, shuffleInPlace } from './rng';
import { FaceId, STANDARD_FACES } from './tiles';

export interface Cell {
  x: number;
  y: number;
}

export interface ConnectLevel {
  cols: number;
  rows: number;
  /** Satır satır hücreler; null = boş */
  cells: (FaceId | null)[];
}

export const CONNECT_LEVELS = 100;

const SIZES: [number, number][] = [
  [4, 5],
  [4, 6],
  [5, 6],
  [6, 6],
  [6, 7],
  [6, 8],
  [7, 8],
  [7, 10],
];

export function buildConnectLevel(level: number): ConnectLevel {
  const rng = createRng(level * 49979687 + 31);
  const [cols, rows] = SIZES[Math.min(SIZES.length - 1, Math.floor((level - 1) / 2))];
  const n = cols * rows;
  const kinds = shuffleInPlace(STANDARD_FACES.slice(), rng);
  const faces: FaceId[] = [];
  // Her tür 4 taş (2 çift); gerekirse son tür 2 taş
  for (let k = 0; faces.length < n; k++) {
    const take = Math.min(4, n - faces.length);
    for (let i = 0; i < take; i++) faces.push(kinds[k % kinds.length]);
  }
  const level0: ConnectLevel = { cols, rows, cells: faces };
  return { cols, rows, cells: shuffleUntilPlayable(level0, rng) };
}

const inside = (b: ConnectLevel, x: number, y: number) => x >= 0 && y >= 0 && x < b.cols && y < b.rows;
const emptyAt = (b: ConnectLevel, x: number, y: number) => !inside(b, x, y) || b.cells[y * b.cols + x] === null;

/** İki nokta arasındaki (uçlar hariç) hücreler boş mu? Sadece yatay ya da dikey çizgi. */
function clearBetween(b: ConnectLevel, p: Cell, q: Cell): boolean {
  if (p.x === q.x) {
    const [a, c] = p.y < q.y ? [p.y, q.y] : [q.y, p.y];
    for (let y = a + 1; y < c; y++) if (!emptyAt(b, p.x, y)) return false;
    return true;
  }
  if (p.y === q.y) {
    const [a, c] = p.x < q.x ? [p.x, q.x] : [q.x, p.x];
    for (let x = a + 1; x < c; x++) if (!emptyAt(b, x, p.y)) return false;
    return true;
  }
  return false;
}

const pathLength = (path: Cell[]) =>
  path.slice(1).reduce((sum, p, i) => sum + Math.abs(p.x - path[i].x) + Math.abs(p.y - path[i].y), 0);

/** a ile b'yi birleştiren yolun köşe noktaları (a ... b), yoksa null. En kısa yolu seçer. */
export function findPath(b: ConnectLevel, ia: number, ib: number): Cell[] | null {
  if (ia === ib) return null;
  const a = { x: ia % b.cols, y: Math.floor(ia / b.cols) };
  const c = { x: ib % b.cols, y: Math.floor(ib / b.cols) };
  // 0 dönüş
  if ((a.x === c.x || a.y === c.y) && clearBetween(b, a, c)) return [a, c];
  const candidates: Cell[][] = [];
  // 1 dönüş
  for (const k of [
    { x: a.x, y: c.y },
    { x: c.x, y: a.y },
  ]) {
    if (emptyAt(b, k.x, k.y) && clearBetween(b, a, k) && clearBetween(b, k, c)) candidates.push([a, k, c]);
  }
  if (candidates.length) return candidates.sort((p, q) => pathLength(p) - pathLength(q))[0];
  // 2 dönüş: dikey bir çizgi (x) ya da yatay bir çizgi (y) üzerinden; tahta dışı dahil
  for (let x = -1; x <= b.cols; x++) {
    const k1 = { x, y: a.y };
    const k2 = { x, y: c.y };
    if (x === a.x || x === c.x) continue;
    if (emptyAt(b, k1.x, k1.y) && emptyAt(b, k2.x, k2.y) && clearBetween(b, a, k1) && clearBetween(b, k1, k2) && clearBetween(b, k2, c)) {
      candidates.push([a, k1, k2, c]);
    }
  }
  for (let y = -1; y <= b.rows; y++) {
    const k1 = { x: a.x, y };
    const k2 = { x: c.x, y };
    if (y === a.y || y === c.y) continue;
    if (emptyAt(b, k1.x, k1.y) && emptyAt(b, k2.x, k2.y) && clearBetween(b, a, k1) && clearBetween(b, k1, k2) && clearBetween(b, k2, c)) {
      candidates.push([a, k1, k2, c]);
    }
  }
  if (!candidates.length) return null;
  return candidates.sort((p, q) => pathLength(p) - pathLength(q))[0];
}

/** Oynanabilir bir çift (ipucu için) */
export function findMove(b: ConnectLevel): [number, number] | null {
  const byFace = new Map<FaceId, number[]>();
  b.cells.forEach((f, i) => {
    if (!f) return;
    const list = byFace.get(f);
    if (list) list.push(i);
    else byFace.set(f, [i]);
  });
  for (const list of byFace.values()) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (findPath(b, list[i], list[j])) return [list[i], list[j]];
  }
  return null;
}

/** Kalan taşları dolu hücreler arasında karıştırır; hamle olana kadar dener. */
export function shuffleUntilPlayable(b: ConnectLevel, rng: Rng): (FaceId | null)[] {
  const idx = b.cells.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (idx.length === 0) return b.cells.slice();
  let cells = b.cells.slice();
  for (let attempt = 0; attempt < 200; attempt++) {
    const pool = shuffleInPlace(idx.map((i) => b.cells[i] as FaceId), rng);
    cells = b.cells.slice();
    idx.forEach((i, k) => (cells[i] = pool[k]));
    if (findMove({ ...b, cells })) return cells;
  }
  return cells;
}

export function reshuffleConnect(b: ConnectLevel, seed: number): (FaceId | null)[] {
  return shuffleUntilPlayable(b, createRng(seed));
}
