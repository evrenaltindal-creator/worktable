/**
 * Oyun motoru kontrolü:  npm run check:game
 *
 * - Her dizilim: çift sayıda taş, aynı katta çakışma yok, üst katlar desteklenmiş
 * - Her seviye: dağıtım üretilebiliyor ve gerçekten sonuna kadar çözülebiliyor
 * - Karıştırma sonrası tahta yine çözülebiliyor
 */
import { LAYOUTS, layoutBounds } from '../src/game/layouts';
import { computeRelations, dealWithSolution, freeTiles, reshuffleWithSolution, Relations } from '../src/game/engine';
import { LEVEL_COUNT, getLevel } from '../src/game/levels';
import { FaceId, matchGroup } from '../src/game/tiles';

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error('HATA:', msg);
};

for (const layout of LAYOUTS) {
  const ps = layout.positions;
  if (ps.length % 2 !== 0) fail(`${layout.id}: tek sayıda taş (${ps.length})`);
  if (ps.length > 144) fail(`${layout.id}: 144'ten fazla taş`);
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.z === b.z && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2) {
        fail(`${layout.id}: çakışma (${a.x},${a.y},${a.z}) ve (${b.x},${b.y},${b.z})`);
      }
    }
    const p = ps[i];
    if (p.z > 0) {
      const supported = ps.some((q) => q.z === p.z - 1 && Math.abs(q.x - p.x) < 2 && Math.abs(q.y - p.y) < 2);
      if (!supported) fail(`${layout.id}: havada duran taş (${p.x},${p.y},${p.z})`);
    }
  }
  const b = layoutBounds(ps);
  const cols = (b.maxX - b.minX + 2) / 2;
  const rows = (b.maxY - b.minY + 2) / 2;
  console.log(`${layout.id.padEnd(14)} ${String(ps.length).padStart(3)} taş  ${cols}x${rows}  ${b.maxZ + 1} kat`);
  if (cols > 8.5) fail(`${layout.id}: çok geniş (${cols} sütun)`);
}

/**
 * Dağıtımın ürettiği çözümü adım adım oynar: her adımda iki taş da serbest
 * ve eşleşiyor olmalı, sonunda tahta boşalmalı. Bu, çözülebilirliğin kesin kanıtıdır.
 */
function replay(faces: FaceId[], present0: boolean[], rel: Relations, solution: [number, number][]): string | null {
  const present = present0.slice();
  for (const [step, [a, b]] of solution.entries()) {
    const free = new Set(freeTiles(present, rel));
    if (!free.has(a) || !free.has(b)) return `adım ${step + 1}: taş serbest değil`;
    if (matchGroup(faces[a]) !== matchGroup(faces[b])) return `adım ${step + 1}: taşlar eşleşmiyor`;
    present[a] = present[b] = false;
  }
  return present.some(Boolean) ? 'tahta boşalmadı' : null;
}

const t0 = Date.now();
for (let level = 1; level <= LEVEL_COUNT; level++) {
  const { layout, seed } = getLevel(level);
  const rel = computeRelations(layout.positions);
  let deal: { faces: FaceId[]; solution: [number, number][] };
  try {
    deal = dealWithSolution(layout.positions, rel, seed);
  } catch (e) {
    fail(`seviye ${level} (${layout.id}): ${(e as Error).message}`);
    continue;
  }
  const { faces, solution } = deal;
  const counts = new Map<string, number>();
  faces.forEach((f) => counts.set(matchGroup(f), (counts.get(matchGroup(f)) ?? 0) + 1));
  for (const [g, c] of counts) if (c % 2) fail(`seviye ${level}: ${g} grubunda tek sayı`);

  const present = faces.map(() => true);
  const err = replay(faces, present, rel, solution);
  if (err) fail(`seviye ${level} (${layout.id}): ${err}`);
  if (freeTiles(present, rel).length < 2) fail(`seviye ${level}: başlangıçta serbest taş yok`);

  // Rastgele birkaç hamle yap, sonra karıştır ve yine çözülebilir mi bak
  let moves = 0;
  for (let step = 0; step < 8; step++) {
    const free = freeTiles(present, rel);
    let done = false;
    for (let a = 0; a < free.length && !done; a++)
      for (let b = a + 1; b < free.length && !done; b++)
        if (matchGroup(faces[free[a]]) === matchGroup(faces[free[b]])) {
          present[free[a]] = present[free[b]] = false;
          done = true;
          moves++;
        }
  }
  if (moves === 0) fail(`seviye ${level}: hiç hamle yok`);
  const sh = reshuffleWithSolution(layout.positions, rel, faces, present, seed + 1);
  if (!sh.solution) fail(`seviye ${level}: karıştırma çözülebilir sonuç üretemedi`);
  else {
    const e2 = replay(sh.faces, present, rel, sh.solution);
    if (e2) fail(`seviye ${level}: karıştırma sonrası ${e2}`);
  }
}
console.log(`\n${LEVEL_COUNT} seviye kontrol edildi (${Date.now() - t0} ms).`);

if (failures) {
  console.error(`\n${failures} hata bulundu.`);
  process.exit(1);
}
console.log('Tüm kontroller geçti.');
