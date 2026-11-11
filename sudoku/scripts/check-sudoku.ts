/** Sudoku motoru kontrolü: npm run check:game */
import { DIFFICULTIES, PEERS, UNITS, countClues, countSolutions, makePuzzle, solvableBySingles } from '../src/game/sudoku';

let failures = 0;
const fail = (m: string) => {
  failures++;
  console.error('HATA:', m);
};

for (const d of DIFFICULTIES) {
  const t0 = Date.now();
  let slowest = 0;
  let clueSum = 0;
  let singlesFail = 0;
  const N = d === 'expert' ? 30 : 40;
  for (let n = 1; n <= N; n++) {
    const s = Date.now();
    const { puzzle, solution } = makePuzzle(d, n);
    slowest = Math.max(slowest, Date.now() - s);
    clueSum += countClues(puzzle);
    // çözüm geçerli mi
    for (const unit of UNITS) {
      const set = new Set(unit.map((i) => solution[i]));
      if (set.size !== 9 || set.has(0)) fail(`${d} #${n}: çözüm geçersiz`);
    }
    // bulmaca çözümle uyumlu mu
    puzzle.forEach((v, i) => {
      if (v && v !== solution[i]) fail(`${d} #${n}: ipucu çözümle uyuşmuyor`);
    });
    if (!solvableBySingles(puzzle)) singlesFail++;
    if (countSolutions(puzzle, 2) !== 1) fail(`${d} #${n}: tek çözüm değil`);
    if ((d === 'easy' || d === 'medium') && !solvableBySingles(puzzle)) fail(`${d} #${n}: temel mantıkla çözülemiyor`);
    // aynı numara her zaman aynı bulmaca
    if (n <= 3 && makePuzzle(d, n).puzzle.join('') !== puzzle.join('')) fail(`${d} #${n}: tekrarlanabilir değil`);
  }
  console.log(`${d.padEnd(7)} ${N} bulmaca, temel mantıkla çözülemeyen: ${singlesFail}/${N}`);
  console.log(`${d.padEnd(7)} ${N} bulmaca, ortalama ${(clueSum / N).toFixed(1)} ipucu, en yavaş ${slowest} ms, toplam ${Date.now() - t0} ms`);
}
if (PEERS[0].length !== 20) fail('akraba sayısı 20 olmalı');
if (failures) {
  console.error(`${failures} hata`);
  process.exit(1);
}
console.log('Tüm kontroller geçti.');
