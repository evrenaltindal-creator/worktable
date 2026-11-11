/* Huzur Jewels App Store ekran görüntüleri.  Web derlemesini 8770'te sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 8;
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };
const KEY = 'huzur-jewels:progress:v1';

// İpucunun yeşil çerçeveli iki taşı
const marks = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('div')]
      .filter((d) => getComputedStyle(d).borderTopColor === 'rgb(126, 224, 161)' && getComputedStyle(d).borderTopWidth === '4px')
      .map((d) => {
        const r = d.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }),
  );

async function showHint(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
  await page.waitForTimeout(450);
  return marks(page);
}

async function swipe(page, m) {
  await page.mouse.move(m[0].x, m[0].y);
  await page.mouse.down();
  await page.mouse.move(m[1].x, m[1].y, { steps: 5 });
  await page.mouse.up();
}

const won = (page) => page.evaluate(([k, l]) => JSON.parse(localStorage.getItem(k) || '{}').stars?.[l] !== undefined, [KEY, String(LEVEL)]);

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8770/',
  storageKey: KEY,
  progress: (lang) => ({ next: LEVEL, hints: 99, hammers: 5, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    let m = await showHint(page, lang);
    await save('2-start.jpg');
    for (let k = 0; k < 40 && !(await won(page)); k++) {
      if (k > 0) m = await showHint(page, lang);
      if (m.length !== 2) {
        await page.waitForTimeout(700);
        continue;
      }
      await swipe(page, m);
      if (k === 3) {
        await page.waitForTimeout(330);
        await save('3-play.jpg');
      }
      await page.waitForTimeout(1700);
    }
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
