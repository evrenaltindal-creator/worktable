const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
// Reklam görsellerini üretir: node olustur.js (Playwright gerekir). Çıktı: ../reklamlar/<dil>/
const OUT = path.join(__dirname, '..', 'reklamlar');
const SIZES = [['instagram-kare', 1080, 1080], ['hikaye-reels', 1080, 1920], ['facebook-baglanti', 1200, 628], ['banner-300x250', 300, 250], ['banner-728x90', 728, 90], ['banner-320x50', 320, 50]];
(async () => {
  const b = await chromium.launch();
  for (const lang of ['tr', 'en']) {
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    for (const [name, w, h] of SIZES) {
      const scale = w <= 728 ? 2 : 1; // küçük web banner'ları retina için 2x
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
      await p.goto('file://' + path.join(__dirname, 'reklam.html') + `#w=${w}&h=${h}&lang=${lang}`);
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250);
      const over = await p.evaluate(() => [...document.querySelectorAll('.wrap *')].some(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.bottom > innerHeight + 1 && !e.closest('.phone'); }));
      await p.screenshot({ path: path.join(OUT, lang, `${name}.png`) });
      console.log(lang, name, `${w}x${h}${scale > 1 ? ' @2x' : ''}`, over ? 'TAŞMA VAR' : 'ok');
      await p.close();
    }
  }
  await b.close();
})();
