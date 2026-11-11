/** Mayın Tarlası motoru kontrolü: npm run check:game */
import { DIFFICULTIES, SIZES, deduce, generate, isWon, reveal, solvable } from '../src/game/mines';
let failures = 0;
const fail = (m: string) => { failures++; console.error('HATA:', m); };
for (const d of DIFFICULTIES) {
  const { cols, rows, mines } = SIZES[d];
  const t0 = Date.now();
  let slow = 0;
  for (let n = 1; n <= 40; n++) {
    const first = (n * 13) % (cols * rows);
    const s = Date.now();
    const b = generate(d, n, first);
    slow = Math.max(slow, Date.now() - s);
    if (b.mines.filter(Boolean).length !== mines) fail(`${d} #${n}: mayın sayısı yanlış`);
    if (b.mines[first]) fail(`${d} #${n}: ilk kare mayın`);
    if (!solvable(b, first)) fail(`${d} #${n}: tahminsiz çözülemiyor`);
    // Çözücü ile oynayıp kazan
    const r = Array(cols * rows).fill(false), f = Array(cols * rows).fill(false);
    reveal(b, r, f, first);
    for (let g = 0; g < 500 && !isWon(b, r); g++) {
      const { safe, mines: m } = deduce(b, r, f);
      m.forEach((i) => { if (!b.mines[i]) fail(`${d} #${n}: yanlış mayın çıkarımı`); f[i] = true; });
      safe.forEach((i) => { if (b.mines[i]) fail(`${d} #${n}: yanlış güvenli çıkarımı`); reveal(b, r, f, i); });
    }
    if (!isWon(b, r)) fail(`${d} #${n}: bitirilemedi`);
    if (generate(d, n, first).mines.join() !== b.mines.join()) fail(`${d} #${n}: tekrarlanabilir değil`);
  }
  console.log(`${d.padEnd(6)} ${cols}x${rows}, ${mines} mayın: 40 tahta, en yavaş ${slow} ms, toplam ${Date.now() - t0} ms`);
}
if (failures) { console.error(`${failures} hata`); process.exit(1); }
console.log('Tüm kontroller geçti.');
