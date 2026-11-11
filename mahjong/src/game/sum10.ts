/**
 * "Toplam 10": sayılı taşlardan (daire, bambu, karakter 1-9) toplamı 10 olan
 * iki serbest taş eşleşir: 1+9, 2+8, 3+7, 4+6, 5+5. Takım (renk) önemsizdir.
 */
import { MatchRule } from './engine';
import { Rng, randInt, shuffleInPlace } from './rng';
import { FaceId } from './tiles';

export function tileValue(face: FaceId): number {
  return /^[dbc][1-9]$/.test(face) ? Number(face[1]) : 0;
}

const SUITS = ['d', 'b', 'c'];

export const SUM10_RULE: MatchRule = {
  canMatch: (a, b) => {
    const va = tileValue(a);
    const vb = tileValue(b);
    return va > 0 && vb > 0 && va + vb === 10;
  },
  pairUp(faces) {
    const byValue: FaceId[][] = Array.from({ length: 10 }, () => []);
    for (const f of faces) byValue[tileValue(f)].push(f);
    const pairs: [FaceId, FaceId][] = [];
    for (let v = 1; v <= 4; v++) {
      const a = byValue[v];
      const b = byValue[10 - v];
      for (let k = 0; k < Math.min(a.length, b.length); k++) pairs.push([a[k], b[k]]);
    }
    const fives = byValue[5];
    for (let k = 0; k + 1 < fives.length; k += 2) pairs.push([fives[k], fives[k + 1]]);
    return pairs;
  },
  choosePairs(tileCount: number, rng: Rng) {
    const pairs: [FaceId, FaceId][] = [];
    let values: number[] = [];
    while (pairs.length < tileCount / 2) {
      // Değerler dengeli dağılsın diye 1-9 karışık sırayla döner
      if (values.length === 0) values = shuffleInPlace([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
      const v = values.pop() as number;
      pairs.push([`${SUITS[randInt(rng, 3)]}${v}`, `${SUITS[randInt(rng, 3)]}${10 - v}`]);
    }
    return pairs;
  },
};
