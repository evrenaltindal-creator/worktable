/*
 * Dil dosyası testleri:  node ok-kacis/test/i18n.test.js
 * - Her dilde Türkçedeki bütün anahtarlar var mı?
 * - {n}, {s} gibi yer tutucular her dilde aynı mı?
 * - Tekil/çoğul ve sayı biçimi doğru çalışıyor mu?
 */
'use strict';
const assert = require('assert');
const path = require('path');
const I = require(path.join(__dirname, '..', 'www', 'js', 'i18n.js'));

const base = I.STRINGS.tr;
const codes = I.LANGS.map((l) => l.code);
assert.deepStrictEqual(codes.sort(), Object.keys(I.STRINGS).sort(), 'LANGS ve STRINGS aynı dilleri içermeli');

const holes = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join(',');
let checked = 0;
for (const code of codes) {
  const table = I.STRINGS[code];
  for (const key of Object.keys(base)) {
    assert.ok(typeof table[key] === 'string' && table[key].trim(), `${code}: "${key}" eksik`);
    assert.strictEqual(holes(table[key]), holes(base[key]), `${code}: "${key}" yer tutucuları farklı`);
    checked++;
  }
  for (const key of Object.keys(table)) {
    const root = key.replace(/_one$/, '');
    assert.ok(base[root] != null, `${code}: "${key}" Türkçede yok (yazım hatası?)`);
    if (key.endsWith('_one')) assert.strictEqual(holes(table[key]), holes(base[root]), `${code}: "${key}" yer tutucuları farklı`);
  }
}

// Tekil / çoğul
I.set('en');
assert.strictEqual(I.t('left', { n: 1 }), '1 arrow');
assert.strictEqual(I.t('left', { n: 4 }), '4 arrows');
I.set('fr');
assert.strictEqual(I.t('left', { n: 0 }), '0 flèche'); // Fransızcada 0 da tekil
assert.strictEqual(I.t('rankBadge', { n: 1 }), 'Tu es 1er au classement !');
assert.strictEqual(I.t('rankBadge', { n: 2 }), 'Tu es 2e au classement !');
I.set('de');
assert.strictEqual(I.t('timeUpTitle', { n: 1 }), '1 Pfeil befreit');
I.set('ja');
assert.strictEqual(I.t('left', { n: 1 }), '残り1本');
I.set('xx');
assert.strictEqual(I.lang, 'en', 'bilinmeyen dil İngilizceye düşmeli');

// Dil algılama
assert.strictEqual(I.detect('ko'), 'ko');
assert.strictEqual(I.detect('zz'), I.detect(null));

// Sayı biçimi her dilde hata vermeden çalışmalı
for (const l of I.LANGS) new Intl.NumberFormat(l.locale).format(12345);

console.log(`OK: ${codes.length} dil, ${checked} metin kontrol edildi`);
