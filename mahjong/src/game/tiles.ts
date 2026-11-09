/**
 * Taş türleri.
 *
 * - d1..d9  daireler
 * - b1..b9  bambular
 * - c1..c9  karakterler
 * - we ws ww wn  rüzgarlar (doğu, güney, batı, kuzey)
 * - dr dg dw     ejderhalar (kırmızı, yeşil, beyaz)
 * - f1..f4  çiçekler   -> herhangi bir çiçek, herhangi bir çiçekle eşleşir
 * - s1..s4  mevsimler  -> herhangi bir mevsim, herhangi bir mevsimle eşleşir
 */
export type FaceId = string;

const suit = (p: string) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${p}${n}`);

export const STANDARD_FACES: FaceId[] = [
  ...suit('d'),
  ...suit('b'),
  ...suit('c'),
  'we', 'ws', 'ww', 'wn',
  'dr', 'dg', 'dw',
];
export const FLOWER_FACES: FaceId[] = ['f1', 'f2', 'f3', 'f4'];
export const SEASON_FACES: FaceId[] = ['s1', 's2', 's3', 's4'];
export const ALL_FACES: FaceId[] = [...STANDARD_FACES, ...FLOWER_FACES, ...SEASON_FACES];

/** Eşleşme grubu: aynı gruptaki iki taş eşleşebilir. */
export function matchGroup(face: FaceId): string {
  if (face[0] === 'f') return 'F';
  if (face[0] === 's') return 'S';
  return face;
}

export function canMatch(a: FaceId, b: FaceId): boolean {
  return matchGroup(a) === matchGroup(b);
}
