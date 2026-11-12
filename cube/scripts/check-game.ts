/* Mahjong Küp motoru testleri:  npm run check:game */
import { Cube, findPair, freeCubes, indexCubes, isFree, makeLevel, reshuffle, rotate, solvable } from '../src/game/cube';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};

// 1) Serbestlik kuralı
{
  const mk = (x: number, y: number, z: number, id: number): Cube => ({ id, x, y, z, symbol: 0 });
  const row = [mk(0, 0, 0, 1), mk(1, 0, 0, 2), mk(2, 0, 0, 3)];
  const at = indexCubes(row);
  // tek sıra: y yönünde her küp açık
  if (!row.every((c) => isFree(c, at))) fail('tek sıradaki küpler serbest olmalı');
  const block: Cube[] = [];
  let id = 1;
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) block.push(mk(x, y, 0, id++));
  const mid = block[4];
  if (isFree(mid, indexCubes(block))) fail('dört yanı kapalı orta küp serbest olmamalı');
  const stacked = [...block, mk(0, 0, 1, id++)];
  if (isFree(stacked[0], indexCubes(stacked))) fail('üstü kapalı küp serbest olmamalı');
}

// 2) Her seviye: küp sayısı çift, her sembol çift sayıda, çözülebilir, başlangıçta hamle var
let total = 0;
for (let n = 1; n <= 30; n++) {
  const lv = makeLevel(n);
  total += lv.cubes.length;
  if (lv.cubes.length % 2) fail(`seviye ${n}: tek sayıda küp`);
  const counts = new Map<number, number>();
  lv.cubes.forEach((c) => counts.set(c.symbol, (counts.get(c.symbol) ?? 0) + 1));
  if ([...counts.values()].some((v) => v % 2)) fail(`seviye ${n}: bir sembol tek sayıda`);
  if (!findPair(lv.cubes)) fail(`seviye ${n}: başlangıçta hamle yok`);
  if (n <= 14 && !solvable(lv.cubes, 200000)) fail(`seviye ${n}: çözülemiyor`);
  // havada küp yok
  const at = indexCubes(lv.cubes);
  if (lv.cubes.some((c) => c.z > 0 && !at.has(`${c.x},${c.y},${c.z - 1}`))) fail(`seviye ${n}: havada küp`);
}
console.log(`30 seviyede toplam ${total} küp; ilk 14 seviye çözücüyle doğrulandı.`);

// 3) Karıştırma: aynı türler korunur ve sonuç çözülebilir
{
  const lv = makeLevel(9);
  let cs = lv.cubes;
  // birkaç çift kaldır
  for (let k = 0; k < 4; k++) {
    const p = findPair(cs);
    if (!p) break;
    cs = cs.filter((c) => c !== p[0] && c !== p[1]);
  }
  const before = cs.map((c) => c.symbol).sort().join();
  const after = reshuffle(cs, 99);
  if (after.map((c) => c.symbol).sort().join() !== before) fail('karıştırma sembolleri değiştirdi');
  if (!solvable(after, 200000)) fail('karıştırma sonrası çözülemiyor');
  if (freeCubes(after).length < 2) fail('karıştırma sonrası serbest küp yok');
}

// 4) Döndürme: 4 kez döndürünce başa döner
{
  const p = rotate(0, 0, 4, 5, 4);
  const q = rotate(0, 0, 0, 5, 4);
  if (p.x !== q.x || p.y !== q.y) fail('döndürme 4 adımda başa dönmüyor');
}

if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
