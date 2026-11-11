/* Huzur Color Pop App Store ekran görüntüleri.  Web derlemesini 8772'de sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 9;
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };
const KEY = 'huzur-colorpop:progress:v1';

// İpucunun beyaz çerçeveyle işaretlediği grubun bir karosu
const marked = (page) =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).borderTopColor === 'rgb(255, 255, 255)' && getComputedStyle(d).borderTopWidth === '4px');
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  });

async function hint(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
  await page.waitForTimeout(300);
  return marked(page);
}

const ended = (page) => page.evaluate(([k, l]) => JSON.parse(localStorage.getItem(k) || '{}').stars?.[l] !== undefined, [KEY, String(LEVEL)]);

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8772/',
  storageKey: KEY,
  progress: (lang) => ({ next: LEVEL, hints: 99, undos: 5, hammers: 5, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    await hint(page, lang);
    await save('2-start.jpg');
    for (let k = 0; k < 80 && !(await ended(page)); k++) {
      const m = k === 0 ? await marked(page) : await hint(page, lang);
      if (!m) {
        await page.waitForTimeout(600);
        continue;
      }
      await page.mouse.click(m.x, m.y);
      if (k === 6) {
        await page.waitForTimeout(120);
        await save('3-play.jpg');
      }
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
