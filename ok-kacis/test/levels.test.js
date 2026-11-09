/*
 * Seviye üretici testleri. Çalıştırmak için:  node ok-kacis/test/levels.test.js
 * Bağımlılık gerektirmez.
 */
'use strict';
const assert = require('assert');
const path = require('path');
const L = require(path.join(__dirname, '..', 'www', 'js', 'levels.js'));

const LEVELS = 300;
let totalArrows = 0;
const t0 = Date.now();

for (let n = 1; n <= LEVELS; n++) {
  const b = L.generate(n);
  const p = L.levelParams(n);
  assert.strictEqual(b.w, p.w, `seviye ${n}: genişlik`);
  assert.strictEqual(b.h, p.h, `seviye ${n}: yükseklik`);
  assert.ok(b.arrows.length >= 2, `seviye ${n}: en az iki ok olmalı`);

  const seen = new Set();
  let cellsUsed = 0;
  for (const a of b.arrows) {
    assert.ok(a.cells.length >= 2, `seviye ${n} ok ${a.id}: en az iki hücre`);
    assert.ok(a.color >= 0 && a.color < L.COLORS, `seviye ${n} ok ${a.id}: renk`);
    for (const [x, y] of a.cells) {
      assert.ok(x >= 0 && y >= 0 && x < b.w && y < b.h, `seviye ${n} ok ${a.id}: tahta dışında`);
      const key = x + ',' + y;
      assert.ok(!seen.has(key), `seviye ${n}: hücre ${key} iki okta birden`);
      seen.add(key);
    }
    for (let i = 1; i < a.cells.length; i++) {
      const [x0, y0] = a.cells[i - 1];
      const [x1, y1] = a.cells[i];
      assert.strictEqual(Math.abs(x1 - x0) + Math.abs(y1 - y0), 1, `seviye ${n} ok ${a.id}: kopuk gövde`);
    }
    const head = a.cells[a.cells.length - 1];
    const neck = a.cells[a.cells.length - 2];
    assert.deepStrictEqual([head[0] - neck[0], head[1] - neck[1]], a.dir, `seviye ${n} ok ${a.id}: baş yönü`);
    // Gövde kendi kaçış yolunun üstünde olamaz
    let x = head[0] + a.dir[0];
    let y = head[1] + a.dir[1];
    while (x >= 0 && y >= 0 && x < b.w && y < b.h) {
      assert.ok(!a.cells.some(([cx, cy]) => cx === x && cy === y), `seviye ${n} ok ${a.id}: kendi yolunu kesiyor`);
      x += a.dir[0];
      y += a.dir[1];
    }
    cellsUsed += a.cells.length;
  }

  const order = L.solve(b);
  assert.ok(order, `seviye ${n}: çözülemiyor`);
  assert.strictEqual(order.length, b.arrows.length);
  assert.ok(cellsUsed / (b.w * b.h) >= 0.5, `seviye ${n}: tahta çok boş (${cellsUsed}/${b.w * b.h})`);

  // Aynı seviye her seferinde aynı tahtayı vermeli
  assert.deepStrictEqual(L.generate(n), b, `seviye ${n}: tekrar üretilince farklı`);
  totalArrows += b.arrows.length;
}

// İlk seviyeler küçük, sonrakiler büyük olmalı
assert.ok(L.levelParams(1).w * L.levelParams(1).h < L.levelParams(15).w * L.levelParams(15).h);

// Başlangıçta önü açık en az bir ok olmalı ve en az bir ok kilitli olmalı (ilk seviyeler hariç)
for (let n = 5; n <= LEVELS; n++) {
  const b = L.generate(n);
  const occ = new Int16Array(b.w * b.h).fill(-1);
  for (const a of b.arrows) for (const [x, y] of a.cells) occ[y * b.w + x] = a.id;
  const free = b.arrows.filter((a) => L.probe(b.w, b.h, occ, a).blocker === -1).length;
  assert.ok(free >= 1, `seviye ${n}: hiç açık ok yok`);
  assert.ok(free < b.arrows.length, `seviye ${n}: bütün oklar baştan açık, bulmaca yok`);
}

// Zamana karşı modu: aynı zorlukta, tohuma göre farklı ama yine çözülebilir tahtalar
let seeded = 0;
for (let stage = 1; stage <= 20; stage++) {
  const level = Math.min(40, 2 + stage * 2);
  const shapes = new Set();
  for (let k = 0; k < 15; k++) {
    const seed = (k * 2654435761 + stage * 97) >>> 0;
    const b = L.generate(level, seed);
    assert.ok(L.solve(b), `tur tahtası ${stage}/${k}: çözülemiyor`);
    assert.deepStrictEqual(L.generate(level, seed), b, `tur tahtası ${stage}/${k}: tekrar üretilince farklı`);
    shapes.add(JSON.stringify(b.arrows.map((a) => a.cells)));
    seeded++;
  }
  assert.ok(shapes.size > 10, `tur ${stage}: tohumlar yeterince farklı tahta üretmiyor`);
}
// Tohum verilmezse eski seviyeler değişmemeli
assert.deepStrictEqual(L.generate(7), L.generate(7, undefined));

console.log(`OK: ${seeded} zamana karşı tahtası üretildi ve çözüldü`);
console.log(`OK: ${LEVELS} seviye üretildi ve çözüldü, toplam ${totalArrows} ok, ${Date.now() - t0} ms`);
