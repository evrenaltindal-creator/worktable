/* Huzur Mahjong Cube App Store ekran görüntüleri.  Web derlemesini 8775'te sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 9;
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };
const TURN = { tr: 'Döndür', en: 'Turn', pt: 'Girar', de: 'Drehen', fr: 'Tourner', ja: '回す', ko: '돌리기' };
const KEY = 'huzur-cube:progress:v1';

const hinted = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-testid$="-hint"]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.25 };
    }),
  );
const left = (page) => page.evaluate(() => document.querySelectorAll('[data-testid^="cube-"]').length);
const won = (page) => page.evaluate(([k, l]) => JSON.parse(localStorage.getItem(k) || '{}').stars?.[l] !== undefined, [KEY, String(LEVEL)]);

async function pairStep(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
  await page.waitForTimeout(150);
  const h = await hinted(page);
  if (h.length !== 2) return;
  const before = await left(page);
  await page.mouse.click(h[0].x, h[0].y);
  await page.waitForTimeout(60);
  await page.mouse.click(h[1].x, h[1].y);
  await page.waitForTimeout(420);
  // önde başka küp varsa görünümü çevir
  if ((await left(page)) === before) await page.getByRole('button', { name: new RegExp(`^${TURN[lang]}`) }).click({ force: true });
}

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8775/',
  storageKey: KEY,
  progress: (lang) => ({ next: LEVEL, hints: 99, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
    await page.waitForTimeout(300);
    await save('2-start.jpg');
    const total = await left(page);
    for (let k = 0; k < 60 && (await left(page)) > total * 0.55; k++) await pairStep(page, lang);
    await page.getByRole('button', { name: new RegExp(`^${TURN[lang]}`) }).click({ force: true });
    await page.waitForTimeout(300);
    await save('3-play.jpg');
    for (let k = 0; k < 80 && !(await won(page)); k++) await pairStep(page, lang);
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
