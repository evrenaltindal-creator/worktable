#!/usr/bin/env node
/*
 * Siteyi hazırlar: oyunu (www) site/oyna/ klasörüne kopyalar ve tanıtım
 * metinlerini store/listing.json'dan site/texts.js'e yazar.
 * Oyunu ya da metinleri değiştirdikten sonra çalıştır:
 *   node ok-kacis/tools/build-site.js      (ya da ok-kacis içinde: npm run site)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const SITE = path.join(ROOT, 'site');
const GAME = path.join(SITE, 'oyna');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, entry.name);
    const b = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

// 1) Oyun: www -> site/oyna (eski kopyayı silip baştan)
fs.rmSync(GAME, { recursive: true, force: true });
copyDir(WWW, GAME);
const indexPath = path.join(GAME, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const hook = '<script src="config.js"></script>';
if (!html.includes(hook)) throw new Error('index.html içinde config.js satırı bulunamadı');
html = html.replace(hook, hook + '\n<script src="../site-ayarlari.js"></script>');
html = html.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', '<link rel="icon" href="icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="../img/apple-touch-icon.png">');
fs.writeFileSync(indexPath, html);

// 2) Tanıtım metinleri
const listing = JSON.parse(fs.readFileSync(path.join(ROOT, 'store', 'listing.json'), 'utf8'));
const texts = {};
for (const lang of Object.keys(listing.locales)) {
  const L = listing[lang];
  texts[lang] = {
    title: 'Ok Kaçış',
    name: L.name,
    subtitle: L.subtitle,
    promotionalText: L.promotionalText,
    web: L.web,
  };
}
fs.writeFileSync(
  path.join(SITE, 'texts.js'),
  '/* store/listing.json dosyasından üretildi: node ok-kacis/tools/build-site.js. Elle düzenleme. */\n' +
    'window.OK_KACIS_TEXTS = ' +
    JSON.stringify(texts, null, 2) +
    ';\n'
);

// 3) Eksik ekran görüntüsü uyarısı
const missing = Object.keys(listing.locales).filter((l) => !fs.existsSync(path.join(SITE, 'img', 'screens', l + '.jpg')));
if (missing.length) console.warn('Uyarı: site/img/screens içinde eksik görseller: ' + missing.join(', ') + ' (node ok-kacis/tools/screenshots.js)');

let files = 0;
(function count(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? count(path.join(d, e.name)) : files++;
})(SITE);
console.log(`OK: site hazır (${files} dosya) -> ${path.relative(process.cwd(), SITE)}`);
