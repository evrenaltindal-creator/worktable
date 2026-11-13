/**
 * Oyun dizilimleri (bu oyuna özgü tasarımlar).
 *
 * Koordinatlar "yarım taş" birimindedir: bir taş 2 birim genişlik, 2 birim
 * yükseklik kaplar. Böylece üst katlar yarım taş kaydırılarak iki taşın
 * arasına oturtulabilir. z = kat (0 en alt).
 *
 * Diziler telefonda dik tutuşta büyük taşlar görünsün diye en fazla 8 sütun
 * genişliğinde tasarlandı.
 */
export interface Pos {
  x: number;
  y: number;
  z: number;
}

export interface Layout {
  id: string;
  positions: Pos[];
}

interface LayerDef {
  rows: string[];
  /** Yarım taş birimi cinsinden yatay kaydırma */
  dx: number;
  /** Yarım taş birimi cinsinden dikey kaydırma */
  dy: number;
  z: number;
}

const L = (z: number, rows: string[], dx = 0, dy = 0): LayerDef => ({ rows, dx, dy, z });

/** Her satırı ayrı ortalanmış "baklava" biçimli katmanlar için yardımcı. */
function centeredRows(z: number, counts: number[], maxCount: number, dy = 0, extraDx = 0): LayerDef[] {
  return counts.map((k, r) => L(z, ['#'.repeat(k)], maxCount - k + extraDx, dy + r * 2));
}

function build(id: string, layers: LayerDef[]): Layout {
  const positions: Pos[] = [];
  for (const layer of layers) {
    layer.rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '#') positions.push({ x: layer.dx + c * 2, y: layer.dy + r * 2, z: layer.z });
      }
    });
  }
  // Önce alttaki katlar, sonra yukarıdan aşağı, soldan sağa
  positions.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
  return { id, positions };
}

export const LAYOUTS: Layout[] = [
  build('first-steps', [
    L(0, ['.####.', '######', '######', '.####.']),
    L(1, ['##', '##'], 4, 2),
  ]),

  build('heart', [
    L(0, ['.##..##.', '########', '########', '.######.', '..####..', '...##...']),
    L(1, ['######', '.####.', '..##..'], 2, 2),
    L(2, ['##'], 5, 3),
  ]),

  build('house', [
    L(0, ['..###..', '.#####.', '#######', '#######', '#######', '#######']),
    L(1, ['#####', '#...#', '#...#', '#####'], 2, 4),
    L(1, ['###'], 4, 1),
    L(2, ['#'], 6, 1),
  ]),

  build('diamond', [
    ...centeredRows(0, [2, 3, 4, 5, 6, 5, 4, 3, 2], 6),
    ...centeredRows(1, [2, 3, 4, 3, 2], 6, 4),
    ...centeredRows(2, [1, 2, 1], 6, 8),
  ]),

  build('pyramid', [
    L(0, ['######', '######', '######', '######', '######', '######']),
    L(1, ['####', '####', '####', '####'], 2, 2),
    L(2, ['##', '##'], 4, 4),
  ]),

  build('fish', [
    L(0, ['..###...', '.#####.#', '########', '########', '.#####.#', '..###...']),
    L(1, ['.###.', '#####', '#####', '.###.'], 2, 2),
    L(2, ['##', '##'], 5, 5),
  ]),

  build('tree', [
    L(0, ['...#...', '..###..', '.#####.', '#######', '..###..', '.#####.', '#######', '...#...', '..###..']),
    L(1, ['###', '.#.'], 4, 4),
    L(1, ['#####'], 2, 12),
    L(2, ['#'], 6, 4),
    L(2, ['###'], 4, 12),
  ]),

  build('crown', [
    L(0, ['#..##..#', '#..##..#', '##.##.##', '########', '########', '########']),
    L(1, ['######', '######', '######'], 2, 6),
    L(1, ['#'], 0, 1),
    L(1, ['#'], 14, 1),
    L(1, ['##'], 6, 1),
    L(2, ['#..#'], 3, 7),
  ]),

  build('butterfly', [
    L(0, ['##....##', '###..###', '########', '.######.', '.######.', '########', '###..###', '##....##']),
    L(1, ['#....#', '######', '.####.', '.####.', '######', '#....#'], 2, 2),
    L(2, ['##', '##', '##'], 6, 4),
    L(3, ['#', '#'], 7, 5),
  ]),

  build('ring', [
    L(0, ['########', '########', '##....##', '##....##', '##....##', '##....##', '########', '########']),
    L(1, ['#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######'], 1, 1),
    L(2, ['#.....#'], 0, 0),
    L(2, ['#.....#'], 0, 12),
    L(2, ['#.....#'], 0, 6),
    L(2, ['#'], 6, 0),
    L(2, ['#'], 6, 12),
  ]),

  build('cross', [
    L(0, ['..####..', '..####..', '########', '########', '########', '########', '..####..', '..####..']),
    L(1, ['.####.', '######', '######', '######', '######', '.####.'], 2, 2),
    L(2, ['####', '####', '####', '####'], 4, 4),
    L(3, ['##', '##'], 6, 6),
  ]),

  build('twin-towers', [
    L(0, ['###..###', '###..###', '###..###', '########', '########', '###..###', '###..###', '###..###']),
    L(1, ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##'], 1, 1),
    L(2, ['#....#', '#....#', '#....#', '#....#', '#....#', '#....#'], 2, 2),
    L(3, ['#....#', '#....#'], 2, 6),
  ]),

  build('stairs', [
    L(0, Array(6).fill('########')),
    L(1, Array(6).fill('#####'), 6, 0),
    L(2, Array(6).fill('###'), 10, 0),
    L(3, Array(6).fill('#'), 14, 0),
  ]),

  build('castle', [
    L(0, ['##.##.##', '########', '########', '########', '########', '########', '########', '##.##.##']),
    L(1, ['##..##', '#....#', '#....#', '#....#', '#....#', '##..##'], 2, 2),
    L(1, ['##', '##'], 6, 6),
    L(2, ['#', '#'], 7, 7),
    L(2, ['#...#'], 3, 3),
    L(2, ['#...#'], 3, 11),
  ]),

  build('mountain', [
    ...centeredRows(0, [4, 5, 6, 7, 8, 8, 8, 8, 8], 8),
    ...centeredRows(1, [3, 4, 5, 6, 6, 6, 6], 8, 4),
    ...centeredRows(2, [2, 3, 4, 4, 4], 8, 8),
    ...centeredRows(3, [1, 2, 2], 8, 12),
  ]),

  build('great-pyramid', [
    L(0, Array(9).fill('########')),
    L(1, Array(7).fill('######'), 2, 2),
    L(2, Array(5).fill('####'), 4, 4),
    L(3, Array(3).fill('##'), 6, 6),
    L(4, ['#', '#'], 7, 7),
  ]),
];

export function getLayout(id: string): Layout {
  const layout = LAYOUTS.find((l) => l.id === id);
  if (!layout) throw new Error(`Bilinmeyen dizilim: ${id}`);
  return layout;
}

/** Dizilimin yarım-taş birimi cinsinden sınırları. */
export function layoutBounds(positions: Pos[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = 0;
  for (const p of positions) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
    maxZ = Math.max(maxZ, p.z);
  }
  return { minX, minY, maxX, maxY, maxZ };
}
