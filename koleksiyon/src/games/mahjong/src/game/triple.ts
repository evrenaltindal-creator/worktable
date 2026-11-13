/**
 * "Üçlü Toplama": üstü açık bir taşa dokununca taş alttaki rafa iner.
 * Rafta aynı türden 3 taş olunca üçü birden kaybolur. Raf (7 yer) dolarsa oyun biter.
 *
 * Dağıtım her zaman çözülebilir üretilir: tahtadan geriye doğru, her adımda o an
 * üstü açık 3 taşa aynı tür atanır. Bu sırayla oynayan oyuncunun rafında en fazla
 * 3 taş olur.
 */
import { computeRelations, Relations } from './engine';
import { Pos } from './layouts';
import { createRng, randInt, Rng, shuffleInPlace } from './rng';
import { FaceId, STANDARD_FACES } from './tiles';

export const TRAY_SIZE = 7;
export const TRIPLE_LEVELS = 100;

export interface TripleLevel {
  positions: Pos[];
  rel: Relations;
  faces: FaceId[];
  /** Geçerli bir çözüm: üçerli gruplar halinde kaldırma sırası */
  solution: number[][];
}

/** Bir taşın üstü açık mı (üstünde onunla çakışan taş yok mu) */
export function isOpen(i: number, present: boolean[], rel: Relations): boolean {
  if (!present[i]) return false;
  for (const j of rel.above[i]) if (present[j]) return false;
  return true;
}

function buildPositions(level: number, rng: Rng): Pos[] {
  const cols = 6;
  const rows = Math.min(8, 4 + Math.floor((level - 1) / 3));
  const layers = Math.min(5, 2 + Math.floor((level - 1) / 4));
  const positions: Pos[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) positions.push({ x: c * 2, y: r * 2, z: 0 });

  for (let z = 1; z < layers; z++) {
    const half = z % 2 === 1; // tek katlar yarım taş kaydırılır
    const c2 = half ? cols - 1 : cols;
    const r2 = half ? rows - 1 : rows;
    const fill = 0.75 - z * 0.08;
    for (let r = 0; r < r2; r++) {
      for (let c = 0; c < c2; c++) {
        if (rng() > fill) continue;
        const p = { x: c * 2 + (half ? 1 : 0), y: r * 2 + (half ? 1 : 0), z };
        const supported = positions.some((q) => q.z === z - 1 && Math.abs(q.x - p.x) < 2 && Math.abs(q.y - p.y) < 2);
        if (supported) positions.push(p);
      }
    }
  }
  // 3'ün katı olsun: fazlalar en üst kattan çıkarılır (üstlerinde taş olmadığı için güvenli)
  positions.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
  while (positions.length % 3 !== 0) positions.pop();
  return positions;
}

export function buildTripleLevel(level: number): TripleLevel {
  const rng = createRng(level * 15485863 + 977);
  for (let attempt = 0; attempt < 200; attempt++) {
    const positions = buildPositions(level, rng);
    const rel = computeRelations(positions);
    const triples = positions.length / 3;
    const kindCount = Math.min(STANDARD_FACES.length, 5 + Math.floor(level / 2), triples);
    const kinds = shuffleInPlace(STANDARD_FACES.slice(), rng).slice(0, kindCount);

    const present = positions.map(() => true);
    const faces: FaceId[] = positions.map(() => '');
    const solution: number[][] = [];
    let ok = true;
    for (let t = 0; t < triples; t++) {
      const open = present.map((_, i) => i).filter((i) => isOpen(i, present, rel));
      if (open.length < 3) {
        ok = false;
        break;
      }
      // Üst katlardaki taşları önce kullan: yerleşim daha doğal olur
      open.sort((a, b) => positions[b].z - positions[a].z || rng() - 0.5);
      const pool = open.slice(0, Math.max(3, Math.ceil(open.length / 2)));
      const group: number[] = [];
      while (group.length < 3) {
        const k = pool.splice(randInt(rng, pool.length), 1)[0];
        group.push(k);
      }
      const face = kinds[t % kinds.length];
      for (const k of group) {
        faces[k] = face;
        present[k] = false;
      }
      solution.push(group);
    }
    if (ok) return { positions, rel, faces, solution };
  }
  throw new Error('Üçlü seviye üretilemedi');
}

/** Rafa taş ekler: aynı türün yanına yerleştirir; 3 olunca onları çıkarır. */
export function addToTray(tray: FaceId[], face: FaceId): { tray: FaceId[]; cleared: boolean } {
  const next = tray.slice();
  const lastSame = next.lastIndexOf(face);
  if (lastSame >= 0) next.splice(lastSame + 1, 0, face);
  else next.push(face);
  if (next.filter((f) => f === face).length >= 3) {
    return { tray: next.filter((f) => f !== face), cleared: true };
  }
  return { tray: next, cleared: false };
}
