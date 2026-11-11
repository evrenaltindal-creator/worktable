/**
 * Balon Patlatma motoru (çizimden bağımsız, birim = balon yarıçapı r = 1).
 *
 * Izgara: altıgen dizilim. Çift satırlar COLS balon, tek satırlar COLS-1 balon ve yarım
 * balon içeriden başlar. Satır yüksekliği √3. Tahtanın genişliği 2*COLS.
 */
import { createRng, randInt } from '../kit/rng';

export const COLS = 9;
export const MAX_ROWS = 13; // bu satıra inen balon olursa oyun biter
export const ROW_H = Math.sqrt(3);
export const WIDTH = COLS * 2;
export const RAINBOW = 99; // her renkle eşleşen özel balon
export const COLORS = 6;

/** grid[row][col] = renk (0..5), RAINBOW ya da -1 (boş) */
export type Grid = number[][];

export const rowLen = (r: number) => (r % 2 === 0 ? COLS : COLS - 1);
export const center = (r: number, c: number) => ({ x: 1 + c * 2 + (r % 2 ? 1 : 0), y: 1 + r * ROW_H });

export function neighbors(r: number, c: number): [number, number][] {
  const odd = r % 2 === 1;
  const out: [number, number][] = [
    [r, c - 1],
    [r, c + 1],
    [r - 1, odd ? c : c - 1],
    [r - 1, odd ? c + 1 : c],
    [r + 1, odd ? c : c - 1],
    [r + 1, odd ? c + 1 : c],
  ];
  return out.filter(([rr, cc]) => rr >= 0 && cc >= 0 && cc < rowLen(rr));
}

const get = (g: Grid, r: number, c: number) => (g[r] && c >= 0 && c < rowLen(r) ? g[r][c] : -1);

export function emptyGrid(rows = MAX_ROWS + 1): Grid {
  return Array.from({ length: rows }, (_, r) => Array(rowLen(r)).fill(-1));
}

export function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice());
}

export interface LevelInfo {
  grid: Grid;
  colors: number;
}

/** Seviye: satır ve renk sayısı seviyeyle artar; aynı renkler küme oluşturur. */
export function buildLevel(level: number, variant = 0): LevelInfo {
  const rng = createRng(level * 2246822519 + 3 + variant * 7919);
  const rows = Math.min(9, 4 + Math.floor((level - 1) / 3));
  const colors = Math.min(COLORS, 3 + Math.floor((level - 1) / 4));
  const g = emptyGrid();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < rowLen(r); c++) {
      const nb = neighbors(r, c).filter(([rr, cc]) => rr <= r && get(g, rr, cc) >= 0);
      if (nb.length && rng() < 0.55) {
        const [nr, nc] = nb[randInt(rng, nb.length)];
        g[r][c] = g[nr][nc];
      } else g[r][c] = randInt(rng, colors);
    }
  }
  return { grid: g, colors };
}

/** Bir hücreden başlayıp aynı renk grubu (gökkuşağı her renge uyar) */
export function findGroup(g: Grid, r: number, c: number): [number, number][] {
  const color = g[r][c];
  const seen = new Set<string>([`${r},${c}`]);
  const out: [number, number][] = [[r, c]];
  // Gökkuşağı ise komşulardaki en kalabalık rengi alır
  const target =
    color === RAINBOW
      ? neighbors(r, c)
          .map(([rr, cc]) => get(g, rr, cc))
          .filter((v) => v >= 0 && v !== RAINBOW)
          .sort((a, b) => b - a)[0] ?? -1
      : color;
  for (let k = 0; k < out.length; k++) {
    const [cr, cc] = out[k];
    for (const [nr, nc] of neighbors(cr, cc)) {
      const v = get(g, nr, nc);
      const key = `${nr},${nc}`;
      if (seen.has(key) || v < 0) continue;
      if (v === target || v === RAINBOW) {
        seen.add(key);
        out.push([nr, nc]);
      }
    }
  }
  return out;
}

/** Tavana bağlı olmayan (düşecek) balonlar */
export function findFloating(g: Grid): [number, number][] {
  const seen = new Set<string>();
  const stack: [number, number][] = [];
  for (let c = 0; c < rowLen(0); c++) if (g[0][c] >= 0) stack.push([0, c]);
  stack.forEach(([r, c]) => seen.add(`${r},${c}`));
  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    for (const [nr, nc] of neighbors(r, c)) {
      const key = `${nr},${nc}`;
      if (!seen.has(key) && get(g, nr, nc) >= 0) {
        seen.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  const out: [number, number][] = [];
  g.forEach((row, r) => row.forEach((v, c) => v >= 0 && !seen.has(`${r},${c}`) && out.push([r, c])));
  return out;
}

export interface ShotResult {
  /** Yolun köşe noktaları (atış noktasından yapışma noktasına; duvar sekmeleri dahil) */
  path: { x: number; y: number }[];
  cell: [number, number] | null;
}

/**
 * Atışı adım adım ilerletir: duvarlardan seker, bir balona ya da tavana değince
 * en yakın boş hücreye yapışır.
 */
export function simulateShot(g: Grid, from: { x: number; y: number }, angle: number): ShotResult {
  let x = from.x;
  let y = from.y;
  let dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  const path = [{ x, y }];
  const step = 0.08;
  for (let i = 0; i < 20000; i++) {
    x += dx * step;
    y += dy * step;
    if (x < 1) {
      x = 1 + (1 - x);
      dx = -dx;
      path.push({ x: 1, y });
    } else if (x > WIDTH - 1) {
      x = WIDTH - 1 - (x - (WIDTH - 1));
      dx = -dx;
      path.push({ x: WIDTH - 1, y });
    }
    let hit = y <= 1;
    if (!hit) {
      const approxRow = Math.round((y - 1) / ROW_H);
      for (let r = Math.max(0, approxRow - 1); r <= approxRow + 1 && !hit; r++) {
        if (!g[r]) continue;
        for (let c = 0; c < rowLen(r); c++) {
          if (g[r][c] < 0) continue;
          const p = center(r, c);
          if ((p.x - x) ** 2 + (p.y - y) ** 2 < 1.7 ** 2) {
            hit = true;
            break;
          }
        }
      }
    }
    if (hit) {
      path.push({ x, y });
      return { path, cell: snap(g, x, y) };
    }
  }
  return { path, cell: null };
}

/** Bir noktaya en yakın boş ve "tutunabilen" hücre (tavan ya da dolu bir komşu) */
export function snap(g: Grid, x: number, y: number): [number, number] | null {
  let best: [number, number] | null = null;
  let bestD = Infinity;
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < rowLen(r); c++) {
      if (g[r][c] >= 0) continue;
      const attached = r === 0 || neighbors(r, c).some(([rr, cc]) => get(g, rr, cc) >= 0);
      if (!attached) continue;
      const p = center(r, c);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = [r, c];
      }
    }
  }
  return best;
}

/** Tavanı indirir: altıgen dizilim bozulmasın diye her şey iki satır kayar, en üste iki yeni satır gelir */
export function dropCeiling(g: Grid, colors: number[], seed: number): Grid {
  const rng = createRng(seed);
  const next = emptyGrid(g.length);
  // Satır kaydırma: tek/çift değiştiği için iki satır birden kaydırılır (dizilim bozulmasın)
  for (let r = g.length - 1; r >= 2; r--) next[r] = g[r - 2].slice(0, rowLen(r));
  for (let r = 0; r < 2; r++) for (let c = 0; c < rowLen(r); c++) next[r][c] = colors[randInt(rng, colors.length)];
  return next;
}

export function colorsOnBoard(g: Grid): number[] {
  const s = new Set<number>();
  g.forEach((row) => row.forEach((v) => v >= 0 && v !== RAINBOW && s.add(v)));
  return [...s];
}

export const isEmpty = (g: Grid) => g.every((row) => row.every((v) => v < 0));
export const reachedBottom = (g: Grid) => g.slice(MAX_ROWS).some((row) => row.some((v) => v >= 0));

/** Yerleştir + patlat + düşür: sonuç ızgara, patlayan ve düşen hücreler */
export function place(g0: Grid, cell: [number, number], color: number) {
  const g = cloneGrid(g0);
  g[cell[0]][cell[1]] = color;
  const group = findGroup(g, cell[0], cell[1]);
  let popped: [number, number][] = [];
  let dropped: [number, number][] = [];
  if (group.length >= 3) {
    popped = group;
    popped.forEach(([r, c]) => (g[r][c] = -1));
    dropped = findFloating(g);
    dropped.forEach(([r, c]) => (g[r][c] = -1));
  }
  const colorAt = (r: number, c: number) => (r === cell[0] && c === cell[1] ? color : g0[r][c]);
  return { grid: g, popped, dropped, colorsOf: (cells: [number, number][]) => cells.map(([r, c]) => colorAt(r, c)) };
}
