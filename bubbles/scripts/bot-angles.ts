/**
 * Test yardımcısı: GameScreen ile aynı renk dizisini kullanarak bir seviyeyi bitiren açıları üretir.
 * Kullanım: npx tsx scripts/bot-angles.ts <seviye>   → JSON açı listesi
 */
import { cloneGrid, findGroup, MAX_ROWS, ROW_H, WIDTH, buildLevel, colorsOnBoard, dropCeiling, isEmpty, place, reachedBottom, simulateShot } from '../src/game/bubbles';
import { createRng, randInt } from '../src/kit/rng';

const level = Number(process.argv[2] ?? 1);
const seed = level;
const SHOOTER = { x: WIDTH / 2, y: 1 + (MAX_ROWS + 1.6) * ROW_H };
const rng = createRng(seed * 31 + 7);
const pick = (g: number[][]) => {
  const cs = colorsOnBoard(g);
  return cs.length ? cs[randInt(rng, cs.length)] : 0;
};
let g = buildLevel(level).grid;
let current = pick(g);
let next = pick(g);
let misses = 0;
let drops = 0;
const angles: number[] = [];
for (let shot = 0; shot < 200 && !isEmpty(g) && !reachedBottom(g); shot++) {
  let best: { a: number; score: number; cell: [number, number] } | null = null;
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.03) {
    const s = simulateShot(g, SHOOTER, a);
    if (!s.cell) continue;
    const r = place(g, s.cell, current);
    // patlatmıyorsa aynı renk komşulara yapışmayı tercih et
    const t = cloneGrid(g);
    t[s.cell[0]][s.cell[1]] = current;
    const score = r.popped.length * 10 + r.dropped.length * 20 + findGroup(t, s.cell[0], s.cell[1]).length * 4 - s.cell[0];
    if (!best || score > best.score) best = { a, score, cell: s.cell };
  }
  if (!best) break;
  // Dokunma yuvarlamasına dayanıklı olsun: aynı hücreye giden açı aralığının ortasını seç
  const same = (x: number) => {
    const r = simulateShot(g, SHOOTER, x);
    return !!r.cell && r.cell[0] === best!.cell[0] && r.cell[1] === best!.cell[1];
  };
  let lo = best.a;
  let hi = best.a;
  while (lo - 0.005 > 0.17 && same(lo - 0.005)) lo -= 0.005;
  while (hi + 0.005 < Math.PI - 0.17 && same(hi + 0.005)) hi += 0.005;
  best.a = (lo + hi) / 2;
  angles.push(Number(best.a.toFixed(4)));
  const r = place(g, best.cell, current);
  g = r.grid;
  if (r.popped.length) misses = 0;
  else if (++misses >= 6) {
    g = dropCeiling(g, colorsOnBoard(g).length ? colorsOnBoard(g) : [0, 1, 2], seed * 97 + drops);
    drops++;
    misses = 0;
  }
  if (isEmpty(g) || reachedBottom(g)) break;
  const cs = colorsOnBoard(g);
  current = cs.includes(next) ? next : pick(g);
  next = pick(g);
}
console.log(JSON.stringify({ won: isEmpty(g), angles }));
