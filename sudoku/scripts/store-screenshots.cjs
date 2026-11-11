/*
 * Huzur Sudoku App Store ekran görüntüleri (her dil, Apple'ın istediği boyutlarda).
 *
 *   npx expo export --platform web
 *   python3 -m http.server 8767 --directory dist
 *   node scripts/store-screenshots.cjs            # tüm diller
 *   CJK_FONTS=<klasör>/node_modules/@fontsource node scripts/store-screenshots.cjs ja ko
 *
 * Çıktı: store/screenshots/<dil>/{iphone-6.9,iphone-6.3,ipad-13}/*.jpg
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const URL = process.env.APP_URL || 'http://localhost:8767/';
const OUT = path.join(__dirname, '..', 'store', 'screenshots');
const CJK_FONTS = process.env.CJK_FONTS;

const DEVICES = {
  iphone: { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3 },
  iphone63: { name: 'iphone-6.3', viewport: { width: 402, height: 874 }, scale: 3 },
  ipad: { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2 },
};

const LANGS = {
  tr: { locale: 'tr-TR', all: true, easy: 'Kolay', medium: 'Orta', hard: 'Zor', notes: 'Not', hint: 'İpucu' },
  en: { locale: 'en-US', all: true, easy: 'Easy', medium: 'Medium', hard: 'Hard', notes: 'Notes', hint: 'Hint' },
  pt: { locale: 'pt-BR', easy: 'Fácil', medium: 'Médio', hard: 'Difícil', notes: 'Notas', hint: 'Dica' },
  de: { locale: 'de-DE', easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', notes: 'Notizen', hint: 'Tipp' },
  fr: { locale: 'fr-FR', easy: 'Facile', medium: 'Moyen', hard: 'Difficile', notes: 'Notes', hint: 'Indice' },
  ja: { locale: 'ja-JP', font: ['noto-sans-jp', 'Noto Sans JP'], easy: 'かんたん', medium: 'ふつう', hard: 'むずかしい', notes: 'メモ', hint: 'ヒント' },
  ko: { locale: 'ko-KR', font: ['noto-sans-kr', 'Noto Sans KR'], easy: '쉬움', medium: '보통', hard: '어려움', notes: '메모', hint: '힌트' },
};

const progress = (lang, next = { easy: 4, medium: 7, hard: 3, expert: 1 }) =>
  JSON.stringify({ next, stars: {}, hints: 99, daily: {}, settings: { sound: true, haptics: true, showMistakes: true, highlightSame: true, language: lang } });

async function applyCjkFont(ctx, font) {
  if (!font || !CJK_FONTS) return;
  const [pkg, family] = font;
  const dir = path.join(CJK_FONTS, pkg);
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

async function shoot(browser, lang, dev) {
  const L = LANGS[lang];
  const ctx = await browser.newContext({ viewport: dev.viewport, deviceScaleFactor: dev.scale, isMobile: true, hasTouch: true, locale: L.locale });
  await applyCjkFont(ctx, L.font);
  const page = await ctx.newPage();
  const dir = path.join(OUT, lang, dev.name);
  fs.mkdirSync(dir, { recursive: true });
  const save = (name) => page.screenshot({ path: path.join(dir, name), type: 'jpeg', quality: 90 });
  const fresh = async () => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate((v) => {
      localStorage.clear();
      localStorage.setItem('huzur-sudoku:progress:v1', v);
    }, progress(lang));
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
  };
  const cellLabels = () =>
    page.evaluate(() => [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label')).filter((l) => /^\d-\d/.test(l)));
  const tapCell = (label) => page.getByRole('button', { name: label, exact: true }).click();
  const hints = async (n) => {
    for (let k = 0; k < n; k++) {
      await page.getByRole('button', { name: new RegExp(`^${L.hint}`) }).click();
      await page.waitForTimeout(60);
    }
  };

  await fresh();
  await save('1-home.jpg');

  // Kolay: bir kare seçili, aynı rakamlar vurgulu
  await page.getByText(L.easy, { exact: true }).click();
  await page.waitForTimeout(900);
  await hints(8);
  const filled = (await cellLabels()).filter((l) => l.includes(':'));
  await tapCell(filled[Math.floor(filled.length / 2)]);
  await page.waitForTimeout(300);
  await save('2-game.jpg');

  // Orta: notlarla
  await fresh();
  await page.getByText(L.medium, { exact: true }).click();
  await page.waitForTimeout(900);
  await hints(6);
  await page.getByRole('switch', { name: L.notes }).click();
  const empty = (await cellLabels()).filter((l) => !l.includes(':')).slice(0, 5);
  const noteSets = [['1', '4', '7'], ['2', '6'], ['3', '5', '8', '9'], ['4', '6'], ['1', '7', '9']];
  for (const [k, label] of empty.entries()) {
    await tapCell(label);
    for (const d of noteSets[k]) await page.getByRole('button', { name: d, exact: true }).click();
  }
  await page.waitForTimeout(300);
  await save('3-notes.jpg');

  // Zor: neredeyse bitmiş tahta
  await fresh();
  await page.getByText(L.hard, { exact: true }).click();
  await page.waitForTimeout(900);
  await hints(40);
  await page.waitForTimeout(500);
  await save('4-hard.jpg');

  // Bitiş: konfeti ve yıldızlar
  await hints(20);
  await page.waitForTimeout(1600);
  await save('5-win.jpg');
  await ctx.close();
}

(async () => {
  const wanted = process.argv.slice(2);
  const langs = wanted.length ? wanted : Object.keys(LANGS);
  const browser = await chromium.launch();
  for (const lang of langs) {
    await shoot(browser, lang, DEVICES.iphone);
    if (LANGS[lang].all) {
      await shoot(browser, lang, DEVICES.iphone63);
      await shoot(browser, lang, DEVICES.ipad);
    }
    console.log('tamam:', lang);
  }
  await browser.close();
  console.log('Ekran görüntüleri:', OUT);
})();
