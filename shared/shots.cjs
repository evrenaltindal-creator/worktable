/*
 * Huzur oyunları için ortak App Store ekran görüntüsü yardımcısı.
 * Her uygulamanın scripts/store-screenshots.cjs dosyası bunu çağırır ve sadece
 * "senaryoyu" (hangi ekranlara gidip ne yapılacağını) verir.
 *
 * Japonca/Korece için: CJK_FONTS=<klasör>/node_modules/@fontsource (noto-sans-jp / noto-sans-kr)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const DEVICES = {
  iphone: { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3 },
  iphone63: { name: 'iphone-6.3', viewport: { width: 402, height: 874 }, scale: 3 },
  ipad: { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2 },
};
const LOCALES = { tr: 'tr-TR', en: 'en-US', pt: 'pt-BR', de: 'de-DE', fr: 'fr-FR', ja: 'ja-JP', ko: 'ko-KR' };
const FONTS = { ja: ['noto-sans-jp', 'Noto Sans JP'], ko: ['noto-sans-kr', 'Noto Sans KR'] };

async function applyCjkFont(ctx, lang) {
  const font = FONTS[lang];
  if (!font || !process.env.CJK_FONTS) return;
  const [pkg, family] = font;
  const dir = path.join(process.env.CJK_FONTS, pkg);
  const css = ['400', '700', '900']
    .map((w) => fs.readFileSync(path.join(dir, `${w}.css`), 'utf8'))
    .join('\n')
    .replace(/url\(\.\/files\//g, `url(/__cjk/${pkg}/files/`);
  await ctx.route('**/__cjk/**', (route) => {
    const rel = new globalThis.URL(route.request().url()).pathname.replace(`/__cjk/${pkg}/`, '');
    route.fulfill({ path: path.join(dir, rel) });
  });
  await ctx.addInitScript((text) => {
    const add = () => {
      const s = document.createElement('style');
      s.textContent = text;
      document.head.appendChild(s);
    };
    if (document.head) add();
    else document.addEventListener('DOMContentLoaded', add);
  }, `${css}\ndiv, span { font-family: '${family}', sans-serif !important; }`);
}

/**
 * opts: { appDir, url, storageKey, progress(lang) -> object, scenario(page, lang, save, fresh) }
 */
async function run(opts) {
  const wanted = process.argv.slice(2);
  const langs = wanted.length ? wanted : Object.keys(LOCALES);
  const browser = await chromium.launch();
  for (const lang of langs) {
    const devs = lang === 'tr' || lang === 'en' ? [DEVICES.iphone, DEVICES.iphone63, DEVICES.ipad] : [DEVICES.iphone];
    for (const dev of devs) {
      const ctx = await browser.newContext({ viewport: dev.viewport, deviceScaleFactor: dev.scale, isMobile: true, hasTouch: true, locale: LOCALES[lang] });
      await applyCjkFont(ctx, lang);
      const page = await ctx.newPage();
      const dir = path.join(opts.appDir, 'store', 'screenshots', lang, dev.name);
      fs.mkdirSync(dir, { recursive: true });
      const save = (name) => page.screenshot({ path: path.join(dir, name), type: 'jpeg', quality: 90 });
      const fresh = async (extra = {}) => {
        await page.goto(opts.url, { waitUntil: 'networkidle' });
        await page.evaluate(
          ([k, v]) => {
            localStorage.clear();
            localStorage.setItem(k, v);
          },
          [opts.storageKey, JSON.stringify({ ...opts.progress(lang), ...extra })],
        );
        await page.reload({ waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(900);
      };
      await opts.scenario(page, lang, save, fresh);
      await ctx.close();
    }
    console.log('tamam:', lang);
  }
  await browser.close();
}

module.exports = { run };
