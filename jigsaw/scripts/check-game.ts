/* Yapboz motoru testleri:  npm run check:game */
import { SIZES, levelInfo, makePuzzle, near, pieceUnitPath } from '../src/game/jigsaw';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};

for (const { cols, rows } of SIZES) {
  for (let seed = 1; seed <= 30; seed++) {
    const p = makePuzzle(cols, rows, seed);
    if (p.edges.length !== cols * rows) fail('parça sayısı yanlış');
    if ([...p.order].sort((a, b) => a - b).join() !== Array.from({ length: cols * rows }, (_, i) => i).join()) fail('karışık sıra bir permütasyon değil');
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const e = p.edges[r * cols + c];
        // dış kenarlar düz, iç kenarlar dolu
        if ((r === 0) !== (e.top === 0)) fail(`(${r},${c}) üst kenar`);
        if ((r === rows - 1) !== (e.bottom === 0)) fail(`(${r},${c}) alt kenar`);
        if ((c === 0) !== (e.left === 0)) fail(`(${r},${c}) sol kenar`);
        if ((c === cols - 1) !== (e.right === 0)) fail(`(${r},${c}) sağ kenar`);
        // komşular birbirine uyar
        if (c < cols - 1 && e.right !== -p.edges[r * cols + c + 1].left) fail(`(${r},${c}) sağ komşu uymuyor`);
        if (r < rows - 1 && e.bottom !== -p.edges[(r + 1) * cols + c].top) fail(`(${r},${c}) alt komşu uymuyor`);
        const d = pieceUnitPath(e);
        if (!d.startsWith('M 0 0') || !d.endsWith('Z') || /NaN|undefined/.test(d)) fail('geçersiz parça yolu');
      }
  }
}
if (makePuzzle(4, 4, 7).order.join() === Array.from({ length: 16 }, (_, i) => i).join()) fail('parçalar karışmamış');
if (!near(10, 10, 100) || near(60, 0, 100)) fail('yakınlık eşiği yanlış');
const l1 = levelInfo(1);
const l20 = levelInfo(20);
if (l1.cols !== 3 || l20.cols !== 6 || l1.picture !== 0 || levelInfo(13).picture !== 0) fail('seviye bilgisi yanlış');
if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
