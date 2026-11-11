/**
 * Yapboz motoru — çizimden bağımsız, saf TypeScript.
 *
 * Resim cols x rows parçaya bölünür. İç kenarlarda her parça ya çıkıntı (+1) ya girinti (-1) taşır;
 * komşu parçada aynı kenar ters işaretlidir. Dış kenarlar düzdür (0).
 * piecePath, birim kare (0..1) içinde, kenar payı TAB kadar taşan bir SVG yolu üretir.
 */
import { createRng, shuffleInPlace } from '../kit/rng';

export interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Puzzle {
  cols: number;
  rows: number;
  edges: Edges[]; // index = r * cols + c
  /** tepside parçaların sırası (karışık) */
  order: number[];
}

export function makePuzzle(cols: number, rows: number, seed: number): Puzzle {
  const rng = createRng(seed);
  const sign = () => (rng() < 0.5 ? 1 : -1);
  // yatay kenarlar: (r, c) parçasının sağ kenarı; dikey: alt kenarı
  const right: number[] = Array(cols * rows).fill(0);
  const bottom: number[] = Array(cols * rows).fill(0);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) right[r * cols + c] = sign();
      if (r < rows - 1) bottom[r * cols + c] = sign();
    }
  const edges: Edges[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      edges.push({
        top: r > 0 ? -bottom[i - cols] : 0,
        right: right[i],
        bottom: bottom[i],
        left: c > 0 ? -right[i - 1] : 0,
      });
    }
  const order = Array.from({ length: cols * rows }, (_, i) => i);
  shuffleInPlace(order, rng);
  return { cols, rows, edges, order };
}

/** Çıkıntının parça kenarına oranı */
export const TAB = 0.22;

/**
 * Bir kenar boyunca çıkıntı/girinti çizen yol parçası.
 * (x0,y0)'dan (x1,y1)'e gider; dışa doğru normal (nx,ny). sign: +1 dışarı, -1 içeri, 0 düz.
 */
function edge(x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, sign: number): string {
  if (!sign) return `L ${x1} ${y1}`;
  const p = (t: number, h: number) => {
    const x = x0 + (x1 - x0) * t + nx * h * sign;
    const y = y0 + (y1 - y0) * t + ny * h * sign;
    return `${x.toFixed(4)} ${y.toFixed(4)}`;
  };
  // klasik yapboz çıkıntısı: boyun daralır, baş yuvarlak
  return [
    `L ${p(0.36, 0)}`,
    `C ${p(0.4, 0.02)} ${p(0.42, 0.08)} ${p(0.38, 0.12)}`,
    `C ${p(0.32, 0.2)} ${p(0.4, TAB)} ${p(0.5, TAB)}`,
    `C ${p(0.6, TAB)} ${p(0.68, 0.2)} ${p(0.62, 0.12)}`,
    `C ${p(0.58, 0.08)} ${p(0.6, 0.02)} ${p(0.64, 0)}`,
    `L ${x1} ${y1}`,
  ].join(' ');
}

/** Birim kare (0..1) için parça yolu; çıkıntılar karenin dışına TAB kadar taşar */
export function pieceUnitPath(e: Edges): string {
  return [
    'M 0 0',
    edge(0, 0, 1, 0, 0, -1, e.top),
    edge(1, 0, 1, 1, 1, 0, e.right),
    edge(1, 1, 0, 1, 0, 1, e.bottom),
    edge(0, 1, 0, 0, -1, 0, e.left),
    'Z',
  ].join(' ');
}

/** Parça doğru yere yeterince yakın mı (kare boyunun oranı olarak) */
export const SNAP = 0.38;
export function near(dx: number, dy: number, size: number) {
  return Math.hypot(dx, dy) <= size * SNAP;
}

/** Zorluk: parça sayısı */
export const SIZES = [
  { cols: 3, rows: 3 },
  { cols: 4, rows: 4 },
  { cols: 5, rows: 5 },
  { cols: 6, rows: 6 },
] as const;

export const PICTURES = 12;

/** Seviye: resim sırayla döner, parça sayısı yavaşça artar */
export function levelInfo(n: number, variant = 0) {
  const size = n <= 3 ? SIZES[0] : n <= 8 ? SIZES[1] : n <= 16 ? SIZES[2] : SIZES[3];
  const picture = variant ? variant % PICTURES : (n - 1) % PICTURES;
  return { ...size, picture, seed: n * 4099 + variant * 13 + 3 };
}
