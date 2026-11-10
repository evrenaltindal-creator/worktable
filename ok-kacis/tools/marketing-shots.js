#!/usr/bin/env node
/*
 * App Store tanıtım görsellerini üretir (iPhone 6,9 inç: 1320×2868):
 * üstte o dilde büyük başlık ve açıklama, altta telefon çerçevesinde oyun ekranı.
 *
 * Girdi:  store/raw-screenshots/<dil>/*.jpg   (tools/screenshots.js üretir)
 *         store/listing.json > <dil>.shots     (başlık, açıklama)
 * Çıktı:  store/fastlane/screenshots/<dil>/01.jpg ... 04.jpg  (App Store'a bunlar yüklenir)
 *
 * Gerekenler: Playwright (Chromium ile).
 *   node ok-kacis/tools/marketing-shots.js          # bütün diller
 *   node ok-kacis/tools/marketing-shots.js tr ja    # sadece bazıları
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'store', 'raw-screenshots');
const OUT = path.join(ROOT, 'store', 'fastlane', 'screenshots');
const FONTS = 'file://' + path.join(ROOT, 'www', 'fonts', 'fonts.css');
const listing = JSON.parse(fs.readFileSync(path.join(ROOT, 'store', 'listing.json'), 'utf8'));
const RAW_FILES = ['1-combo.jpg', '2-time-attack.jpg', '3-perfect.jpg', '4-record.jpg'];
// başlıkta "\n" elle satır kırar (Japoncada kelime ortasından bölünmesin diye)
// her görselin vurgu rengi (oyunun koyu tema paletinden)
const ACCENTS = ['#3ee0b0', '#ff6f8e', '#ffd24a', '#d7a6ff'];
const CJK = { ja: 'Noto+Sans+JP:wght@500;700;900', ko: 'Noto+Sans+KR:wght@500;700;900' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page(lang, i) {
  const [title, sub] = listing[lang].shots[i];
  const accent = ACCENTS[i];
  const shot = 'file://' + path.join(RAW, listing.locales[lang], RAW_FILES[i]);
  const cjk = CJK[lang] ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${CJK[lang]}&display=swap">` : '';
  // arka plandaki büyük, silik oklar (oyunun simgesindeki kıvrık ok biçimi)
  const arrows = [
    { x: -60, y: 2180, s: 1.5, r: -8, c: '#ffd24a', o: 0.1 },
    { x: 980, y: 1500, s: 1.1, r: 90, c: accent, o: 0.12 },
    { x: 880, y: 140, s: 0.8, r: 0, c: '#8cc6ff', o: 0.1 },
  ]
    .map(
      (a) =>
        `<svg class="deco" style="left:${a.x}px;top:${a.y}px;transform:scale(${a.s}) rotate(${a.r}deg);opacity:${a.o}" viewBox="0 0 1024 1024" width="420" height="420"><path d="M256 832V576H512V320H688" fill="none" stroke="${a.c}" stroke-width="104" stroke-linecap="round" stroke-linejoin="round"/><path d="M676 188L884 320L676 452Z" fill="${a.c}" stroke="${a.c}" stroke-width="40" stroke-linejoin="round"/></svg>`
    )
    .join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">${cjk}
<style>
  html,body{margin:0;width:1320px;height:2868px;overflow:hidden}
  body{position:relative;background:
      radial-gradient(1200px 900px at 18% 8%, #21528c 0%, rgba(33,82,140,0) 70%),
      radial-gradient(1100px 1100px at 95% 70%, ${accent}33 0%, rgba(0,0,0,0) 65%),
      linear-gradient(180deg,#0e2a4d 0%,#0a1f3a 100%);
    font-family:"Bricolage Grotesque","Noto Sans JP","Noto Sans KR","Hiragino Sans","Apple SD Gothic Neo",system-ui,sans-serif;color:#f1f6ff}
  .grid{position:absolute;inset:0;background:
      repeating-linear-gradient(0deg, rgba(140,198,255,.07) 0 3px, transparent 3px 120px),
      repeating-linear-gradient(90deg, rgba(140,198,255,.07) 0 3px, transparent 3px 120px)}
  .deco{position:absolute;transform-origin:center}
  :lang(ko) h1, :lang(ko) p{word-break:keep-all}
  .head{position:absolute;left:100px;right:100px;top:150px}
  h1{margin:0;font-weight:800;font-size:128px;line-height:1.02;letter-spacing:-.035em;text-wrap:balance}
  .mark{display:block;width:300px;height:44px;margin:42px 0 34px}
  p{margin:0;font-family:"JetBrains Mono","Noto Sans JP","Noto Sans KR",monospace;font-weight:700;font-size:50px;line-height:1.3;color:${accent};text-wrap:balance}
  .phone{position:absolute;left:150px;width:1020px;top:820px;padding:24px;border-radius:120px;background:#06101f;
    box-shadow:0 0 0 6px #23456f, 0 60px 120px rgba(0,0,0,.55)}
  .phone img{display:block;width:100%;height:auto;border-radius:98px}
</style></head><body>
<div class="grid"></div>${arrows}
<div class="head" id="head">
  <h1 id="t">${esc(title).replace(/\n/g, '<br>')}</h1>
  <svg class="mark" viewBox="0 0 300 44" aria-hidden="true"><path d="M6 32H120V12H252" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M246 2L290 12L246 24Z" fill="${accent}" stroke="${accent}" stroke-width="6" stroke-linejoin="round"/></svg>
  <p>${esc(sub)}</p>
</div>
<div class="phone" id="phone"><img src="${shot}" alt=""></div>
</body></html>`;
}

(async () => {
  const only = process.argv.slice(2);
  const langs = Object.keys(listing.locales).filter((l) => !only.length || only.includes(l));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1320, height: 2868 }, deviceScaleFactor: 1 });
  const tmp = path.join(require('os').tmpdir(), 'okk-shots');
  fs.mkdirSync(tmp, { recursive: true });
  for (const lang of langs) {
    if (!listing[lang].shots) throw new Error(lang + ': listing.json içinde shots yok');
    const dir = path.join(OUT, listing.locales[lang]);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < RAW_FILES.length; i++) {
      const file = path.join(tmp, `${lang}-${i}.html`);
      fs.writeFileSync(file, page(lang, i));
      const p = await ctx.newPage();
      await p.goto('file://' + file);
      await p.evaluate(() => document.fonts.ready);
      // başlık 2 satırı aşarsa yazıyı küçült, telefonu başlığın altına yerleştir
      await p.evaluate(() => {
        const t = document.getElementById('t');
        let size = 128;
        while (t.getBoundingClientRect().height > 2 * size * 1.05 && size > 84) {
          size -= 4;
          t.style.fontSize = size + 'px';
        }
        const bottom = document.getElementById('head').getBoundingClientRect().bottom;
        document.getElementById('phone').style.top = Math.max(820, Math.round(bottom + 90)) + 'px';
      });
      await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(dir, `0${i + 1}.jpg`), type: 'jpeg', quality: 90 });
      await p.close();
    }
    console.log('ok', lang);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
