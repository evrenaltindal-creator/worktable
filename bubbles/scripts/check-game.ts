/** Balon motoru kontrolü: npm run check:game */
import { COLS, MAX_ROWS, ROW_H, WIDTH, buildLevel, center, colorsOnBoard, findFloating, findGroup, isEmpty, neighbors, place, rowLen, simulateShot } from '../src/game/bubbles';
import { createRng } from '../src/kit/rng';
let failures = 0;
const fail = (m: string) => { failures++; console.error('HATA:', m); };
const shooter = { x: WIDTH / 2, y: 1 + (MAX_ROWS + 1.5) * ROW_H };

// Komşuluk simetrik mi
for (let r = 0; r < MAX_ROWS; r++) for (let c = 0; c < rowLen(r); c++)
  for (const [nr, nc] of neighbors(r, c)) if (!neighbors(nr, nc).some(([a, b]) => a === r && b === c)) fail(`komşuluk simetrik değil ${r},${c}`);
// Komşu merkezler 2 birim uzakta
for (const [nr, nc] of neighbors(3, 4)) { const a = center(3, 4), b = center(nr, nc); if (Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - 2) > 1e-6) fail('komşu uzaklığı 2 değil'); }

// Basit oyuncu: her atışta en çok patlatan açıyı dener; 1-20. seviyeler bitirilebiliyor mu
let wins = 0;
for (let level = 1; level <= 20; level++) {
  const lv = buildLevel(level);
  let g = lv.grid;
  const rng = createRng(level);
  let shots = 0;
  for (; shots < 300 && !isEmpty(g); shots++) {
    const colors = colorsOnBoard(g);
    const color = colors[Math.floor(rng() * colors.length)];
    let best: { a: number; score: number; cell: [number, number] } | null = null;
    for (let a = 0.18; a < Math.PI - 0.18; a += 0.04) {
      const s = simulateShot(g, shooter, a);
      if (!s.cell) continue;
      const [r, c] = s.cell;
      if (g[r][c] !== -1) fail(`seviye ${level}: dolu hücreye yapıştı`);
      const res = place(g, s.cell, color);
      const score = res.popped.length + res.dropped.length * 2;
      if (!best || score > best.score) best = { a, score, cell: s.cell };
    }
    if (!best) { fail(`seviye ${level}: atış bulunamadı`); break; }
    const res = place(g, best.cell, color);
    // patlayan grup gerçekten aynı renk mi
    if (res.popped.length && new Set(res.colorsOf(res.popped)).size !== 1) fail(`seviye ${level}: karışık renk patladı`);
    g = res.grid;
    if (findFloating(g).length) fail(`seviye ${level}: havada balon kaldı`);
  }
  if (isEmpty(g)) wins++;
  if (level === 1) console.log(`seviye 1: ${buildLevel(1).grid.flat().filter((v) => v >= 0).length} balon, ${shots} atışta temizlendi`);
}
console.log(`Basit oyuncu 20 seviyenin ${wins} tanesini (tavan inmeden) bitirdi`);
if (wins < 15) fail('seviyeler basit oyuncu için fazla zor');
const g0 = buildLevel(1).grid;
if (findGroup(g0, 0, 0).length < 1) fail('grup bulunamadı');
if (COLS !== 9) fail('COLS');
if (failures) { console.error(`${failures} hata`); process.exit(1); }
console.log('Tüm kontroller geçti.');
