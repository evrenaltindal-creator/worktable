/*
 * App Store ekran görüntülerini üretir (Apple'ın istediği tam boyutlarda), her dil için.
 *
 *   npx expo export --platform web
 *   npx serve dist -l 8765        (veya: python -m http.server 8765 --directory dist)
 *   node scripts/store-screenshots.cjs            # tüm diller
 *   node scripts/store-screenshots.cjs ja ko      # sadece seçilen diller
 *
 * Gerekli: playwright (npm install --no-save playwright && npx playwright install chromium)
 *
 * Japonca ve Korece görüntülerde doğru yazı tipi için (isteğe bağlı):
 *   npm install --prefix <klasör> @fontsource/noto-sans-jp @fontsource/noto-sans-kr
 *   CJK_FONTS=<klasör>/node_modules/@fontsource node scripts/store-screenshots.cjs ja ko
 * (Bu ayar sadece ekran görüntüsü içindir; telefonda iOS'un kendi yazı tipleri kullanılır.)
 *
 * Çıktı: store/screenshots/<dil>/{iphone-6.9,ipad-13}/*.jpg
 * iPad görüntüleri Türkçe ve İngilizce içindir; diğer dillerde App Store bunları kullanır.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const URL = process.env.APP_URL || 'http://localhost:8765/';
const OUT = path.join(__dirname, '..', 'store', 'screenshots');
const CJK_FONTS = process.env.CJK_FONTS;

const DEVICES = {
  // 6.9" iPhone: 1320 x 2868
  iphone: { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3 },
  // 13" iPad: 2064 x 2752
  ipad: { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2 },
};

/** Ekranda tıklanacak yazılar (uygulamadaki çevirilerle aynı) */
const LANGS = {
  tr: { locale: 'tr-TR', ipad: true, levels: 'Seviyeler', level: (n) => `Seviye ${n}`, hint: 'İpucu' },
  en: { locale: 'en-US', ipad: true, levels: 'Levels', level: (n) => `Level ${n}`, hint: 'Hint' },
  pt: { locale: 'pt-BR', levels: 'Níveis', level: (n) => `Nível ${n}`, hint: 'Dica' },
  de: { locale: 'de-DE', levels: 'Levelauswahl', level: (n) => `Level ${n}`, hint: 'Tipp' },
  fr: { locale: 'fr-FR', levels: 'Niveaux', level: (n) => `Niveau ${n}`, hint: 'Indice' },
  ja: { locale: 'ja-JP', font: ['noto-sans-jp', 'Noto Sans JP'], levels: 'レベル選択', level: (n) => `レベル ${n}`, hint: 'ヒント' },
  ko: { locale: 'ko-KR', font: ['noto-sans-kr', 'Noto Sans KR'], levels: '레벨 선택', level: (n) => `레벨 ${n}`, hint: '힌트' },
};

const progress = (lang, unlocked, stars = {}) =>
  JSON.stringify({
    unlocked,
    best: Object.fromEntries(Object.keys(stars).map((k) => [k, 60])),
    stars,
    boosters: { hint: 3, shuffle: 2, undo: 5 },
    settings: { sound: true, haptics: true, highlightFree: true, language: lang },
  });

/** Japonca/Korece için yazı tipini sayfaya ekler (CJK_FONTS verilmişse). */
async function useCjkFont(ctx, font) {
  if (!font || !CJK_FONTS) return;
  const [pkg, family] = font;
  const dir = path.join(CJK_FONTS, pkg);
  const css = ['400', '700', '800', '900']
    .map((w) => fs.readFileSync(path.join(dir, `${w}.css`), 'utf8'))
    .join('\n')
    .replace(/url\(\.\/files\//g, `url(/__cjk/${pkg}/files/`);
  await ctx.route('**/__cjk/**', (route) => {
    const rel = new globalThis.URL(route.request().url()).pathname.replace(`/__cjk/${pkg}/`, '');
    route.fulfill({ path: path.join(dir, rel) });
  });
  const style = `${css}\ndiv, span { font-family: '${family}', sans-serif !important; }`;
  await ctx.addInitScript((text) => {
    const add = () => {
      const s = document.createElement('style');
      s.textContent = text;
      document.head.appendChild(s);
    };
    if (document.head) add();
    else document.addEventListener('DOMContentLoaded', add);
  }, style);
}

async function shoot(browser, lang, dev) {
  const L = LANGS[lang];
  const ctx = await browser.newContext({
    viewport: dev.viewport,
    deviceScaleFactor: dev.scale,
    isMobile: true,
    hasTouch: true,
    locale: L.locale,
  });
  await useCjkFont(ctx, L.font);
  const page = await ctx.newPage();
  const dir = path.join(OUT, lang, dev.name);
  fs.mkdirSync(dir, { recursive: true });
  const save = (name) => page.screenshot({ path: path.join(dir, name), type: 'jpeg', quality: 90 });

  async function setProgress(p) {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate((v) => {
      localStorage.clear();
      localStorage.setItem('huzur:progress:v1', v);
    }, p);
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
  }

  async function openLevel(n) {
    await setProgress(progress(lang, n));
    await page.getByText(L.levels, { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: L.level(n), exact: true }).click();
    await page.waitForTimeout(2200); // taşlar düşerek yerleşsin
  }

  await setProgress(progress(lang, 1));
  await save('1-home.jpg');

  await openLevel(12);
  await page.getByText(L.hint, { exact: true }).click();
  await page.waitForTimeout(500);
  await save('2-sunset-hint.jpg');

  await openLevel(23);
  await save('3-dawn.jpg');

  await openLevel(34);
  await save('4-sea.jpg');

  const stars = { 1: 3, 2: 3, 3: 2, 4: 3, 5: 1, 6: 3, 7: 2, 8: 3, 9: 3, 10: 2, 11: 3 };
  await setProgress(progress(lang, 12, stars));
  await page.getByText(L.levels, { exact: true }).click();
  await page.waitForTimeout(800);
  await save('5-levels.jpg');
  await ctx.close();
}

(async () => {
  const wanted = process.argv.slice(2);
  const langs = wanted.length ? wanted : Object.keys(LANGS);
  const browser = await chromium.launch();
  for (const lang of langs) {
    if (!LANGS[lang]) throw new Error(`Bilinmeyen dil: ${lang}`);
    await shoot(browser, lang, DEVICES.iphone);
    if (LANGS[lang].ipad) await shoot(browser, lang, DEVICES.ipad);
    console.log('tamam:', lang);
  }
  await browser.close();
  console.log('Ekran görüntüleri:', OUT);
})();
