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

// ---------------------------------------------------------------- Toplam 10
import { SUM10_RULE, tileValue } from '../src/game/sum10';
import { availablePairs } from '../src/game/engine';
for (let level = 1; level <= LEVEL_COUNT; level += 3) {
  const { layout, seed } = getLevel(level);
  const rel = computeRelations(layout.positions);
  const deal = dealWithSolution(layout.positions, rel, seed + 7, SUM10_RULE);
  const present = deal.faces.map(() => true);
  for (const [step, [a, b]] of deal.solution.entries()) {
    const free = new Set(freeTiles(present, rel));
    if (!free.has(a) || !free.has(b) || tileValue(deal.faces[a]) + tileValue(deal.faces[b]) !== 10) {
      fail(`toplam10 seviye ${level}: adım ${step + 1} geçersiz`);
      break;
    }
    present[a] = present[b] = false;
  }
  // birkaç hamle + karıştırma sonrası da çözülebilir mi
  const p2 = deal.faces.map(() => true);
  for (let k = 0; k < 4; k++) {
    const m = availablePairs(deal.faces, p2, rel, SUM10_RULE)[0];
    if (m) p2[m[0]] = p2[m[1]] = false;
  }
  const sh = reshuffleWithSolution(layout.positions, rel, deal.faces, p2, seed + 99, SUM10_RULE);
  if (!sh.solution) fail(`toplam10 seviye ${level}: karıştırma çözülebilir değil`);
}
console.log('Toplam 10: kontrol edildi');

// ---------------------------------------------------------------- Üçlü Toplama
import { TRIPLE_LEVELS, TRAY_SIZE, addToTray, buildTripleLevel, isOpen } from '../src/game/triple';
for (let level = 1; level <= TRIPLE_LEVELS; level++) {
  let lv;
  try {
    lv = buildTripleLevel(level);
  } catch (e) {
    fail(`üçlü seviye ${level}: ${(e as Error).message}`);
    continue;
  }
  const { positions, rel, faces, solution } = lv;
  if (positions.length % 3) fail(`üçlü seviye ${level}: taş sayısı 3'ün katı değil`);
  const present = positions.map(() => true);
  let tray: string[] = [];
  for (const group of solution) {
    for (const i of group) {
      if (!isOpen(i, present, rel)) fail(`üçlü seviye ${level}: kapalı taş seçildi`);
      present[i] = false;
      tray = addToTray(tray, faces[i]).tray;
      if (tray.length >= TRAY_SIZE) fail(`üçlü seviye ${level}: raf doldu`);
    }
  }
  if (present.some(Boolean) || tray.length) fail(`üçlü seviye ${level}: bitmedi`);
}
console.log(`Üçlü Toplama: ${TRIPLE_LEVELS} seviye kontrol edildi`);

// ---------------------------------------------------------------- Bağlantı
import { CONNECT_LEVELS, buildConnectLevel, findMove, findPath, reshuffleConnect } from '../src/game/connect';
{
  // Birim testler: 3x3 tahta
  const b = { cols: 3, rows: 3, cells: ['a', 'x', 'a', 'x', 'x', 'x', 'b', 'x', 'b'] as (string | null)[] };
  if (!findPath(b, 0, 2)) fail('bağlantı: üst kenardan dolaşan yol bulunamadı');
  if (!findPath(b, 6, 8)) fail('bağlantı: alt kenardan dolaşan yol bulunamadı');
  const c = { cols: 3, rows: 3, cells: ['a', null, 'a', null, null, null, null, null, null] as (string | null)[] };
  const p = findPath(c, 0, 2);
  if (!p || p.length !== 2) fail('bağlantı: düz yol bulunamadı');
  const d = { cols: 4, rows: 4, cells: ['x', 'x', 'x', 'x', 'x', 'a', 'x', 'x', 'x', 'x', 'a', 'x', 'x', 'x', 'x', 'x'] as (string | null)[] };
  if (findPath(d, 5, 10)) fail('bağlantı: kapalı taşlar arasında yol bulunmamalı');
}
for (let level = 1; level <= CONNECT_LEVELS; level += 5) {
  const lv = buildConnectLevel(level);
  const b = { ...lv, cells: lv.cells.slice() };
  let shuffles = 0;
  for (let guard = 0; guard < 500; guard++) {
    if (!b.cells.some(Boolean)) break;
    const m = findMove(b);
    if (!m) {
      b.cells = reshuffleConnect(b, level * 31 + shuffles);
      shuffles++;
      if (!findMove(b) && b.cells.filter(Boolean).length > 0) {
        fail(`bağlantı seviye ${level}: karıştırma sonrası hamle yok`);
        break;
      }
      continue;
    }
    b.cells[m[0]] = b.cells[m[1]] = null;
  }
  if (b.cells.some(Boolean)) fail(`bağlantı seviye ${level}: bitirilemedi`);
}
console.log('Bağlantı: kontrol edildi');

// ---------------------------------------------------------------- Hafıza
import { MEMORY_LEVELS, buildMemoryLevel } from '../src/game/memory';
for (let level = 1; level <= MEMORY_LEVELS; level++) {
  const { cols, rows, faces } = buildMemoryLevel(level);
  if (faces.length !== cols * rows) fail(`hafıza seviye ${level}: taş sayısı yanlış`);
  const counts = new Map<string, number>();
  faces.forEach((f) => counts.set(f, (counts.get(f) ?? 0) + 1));
  for (const c of counts.values()) if (c !== 2) fail(`hafıza seviye ${level}: her taştan 2 olmalı`);
}
console.log(`Hafıza: ${MEMORY_LEVELS} seviye kontrol edildi`);

// ---------------------------------------------------------------- Zirve
import { PEAKS_LEVELS, buildPeaksLevel, isFreePeak, isNeighbor, peakValue } from '../src/game/peaks';
for (let level = 1; level <= PEAKS_LEVELS; level++) {
  const lv = buildPeaksLevel(level);
  const present = lv.faces.map(() => true);
  let current = peakValue(lv.stock[0]);
  let next = 1;
  for (const mv of lv.solution) {
    if (mv === -1) {
      if (next >= lv.stock.length) fail(`zirve seviye ${level}: deste yetmedi`);
      current = peakValue(lv.stock[next++]);
      continue;
    }
    if (!isFreePeak(mv, present)) fail(`zirve seviye ${level}: kapalı taş`);
    if (!isNeighbor(current, peakValue(lv.faces[mv]))) fail(`zirve seviye ${level}: komşu değil`);
    current = peakValue(lv.faces[mv]);
    present[mv] = false;
  }
  if (present.some(Boolean)) fail(`zirve seviye ${level}: bitmedi`);
}
console.log(`Zirve: ${PEAKS_LEVELS} seviye kontrol edildi`);

console.log(`\n${LEVEL_COUNT} seviye kontrol edildi (${Date.now() - t0} ms).`);

if (failures) {
  console.error(`\n${failures} hata bulundu.`);
  process.exit(1);
}
console.log('Tüm kontroller geçti.');
