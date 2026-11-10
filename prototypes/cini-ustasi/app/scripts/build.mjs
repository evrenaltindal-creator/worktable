// Oyunun kaynağından (../../index.html) çevrimdışı çalışan üretim sürümünü kurar.
//   app/www/        -> iOS uygulamasının içine giren dosyalar (npx cap sync ios ile kopyalanır)
//   ../site/oyna/   -> sitenizde yayınlanacak, tarayıcıda oynanan sürüm
// Kullanım: npm run build  (app klasöründe)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(APP, '..', 'index.html');
const ICON = join(APP, 'resources', 'icon-1024.png');
const OUTPUTS = [join(APP, 'www'), join(APP, '..', 'site', 'oyna')];

// 1) Kaynak sayfa: yayın platformuna özel satırları ve Google Fonts bağlantısını çıkar
// Git on Windows may check out the source with CRLF line endings.
let page = readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n');
const drop = [
  /<meta charset="utf-8">\n/,
  /<meta name="viewport"[^>]*>\n/,
  /<title>[^<]*<\/title>\n/,
  /<meta name="claude:viewport-fit-sides"[^>]*>\n/,
  /<link rel="preconnect"[^>]*>\n/g,
  /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n/
];
for (const re of drop) page = page.replace(re, '');
if (/fonts\.googleapis\.com|https?:\/\/(?!www\.w3\.org)/.test(page.replace(/<!--[\s\S]*?-->/g, ''))) {
  // Uygulama internetsiz çalışmalı: sayfada dış adres kalmamalı
  const left = page.match(/https?:\/\/(?!www\.w3\.org)[^\s"'<>)]+/g);
  throw new Error('Sayfada dış bağlantı kaldı: ' + left.slice(0, 5).join(', '));
}
const styleMatch = page.match(/<style>[\s\S]*?<\/style>/);
if (!styleMatch) throw new Error('Kaynakta <style> bulunamadı');
const style = styleMatch[0];
const body = page.replace(style, '').trim();

// 2) Yazı tipleri: Manrope ve Yeseva One, yalnızca Latin + Latin genişletilmiş (Türkçe, Almanca, Fransızca, Portekizce).
//    Japonca ve Korece iPhone'un kendi yazı tipleriyle (Hiragino, Apple SD Gothic Neo) gösterilir.
function fontFaces(pkg, weights) {
  const faces = [];
  for (const w of weights) {
    const css = readFileSync(join(APP, 'node_modules', '@fontsource', pkg, `${w}.css`), 'utf8');
    for (const block of css.split('/* ').slice(1)) {
      const name = block.slice(0, block.indexOf(' */'));
      if (!/-(latin|latin-ext)-\d+-normal$/.test(name)) continue;
      const face = block.slice(block.indexOf('@font-face'))
        .replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\([^)]+\.woff\) format\('woff'\)/, 'url(files/$1) format(\'woff2\')')
        .trim();
      faces.push({ file: name + '.woff2', pkg, css: face });
    }
  }
  return faces;
}
const faces = [...fontFaces('manrope', [400, 500, 600, 700, 800]), ...fontFaces('yeseva-one', [400])];

// 3) Tam HTML belgesi
const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#EAF0F5">
<meta name="format-detection" content="telephone=no">
<title>Çini Ustası</title>
<link rel="icon" href="icon.png">
<link rel="apple-touch-icon" href="icon.png">
<link rel="stylesheet" href="fonts/fonts.css">
<script>window.CINI_PROD = true;</script>
<style>
/* Çentik ve ana ekran çubuğu için güvenli alan; uygulama hissi için seçim ve büyütme kapalı */
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation;overscroll-behavior:none}
</style>
${style}
</head>
<body>
${body}
</body>
</html>
`;

// 4) Yaz
for (const out of OUTPUTS) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'fonts', 'files'), { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'fonts', 'fonts.css'), faces.map(f => f.css).join('\n\n') + '\n');
  for (const f of faces) copyFileSync(join(APP, 'node_modules', '@fontsource', f.pkg, 'files', f.file), join(out, 'fonts', 'files', f.file));
  if (existsSync(ICON)) copyFileSync(ICON, join(out, 'icon.png'));
  copyFileSync(join(APP, '..', 'site', 'gizlilik.html'), join(out, 'privacy.html'));
  console.log('yazıldı:', out);
}
console.log(`index.html ${(html.length / 1024).toFixed(0)} KB, ${faces.length} yazı tipi dosyası`);
