/* Huzur Mines App Store ekran görüntüleri.  Web derlemesini 8768'de sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const EASY = { tr: 'Kolay', en: 'Easy', pt: 'Fácil', de: 'Leicht', fr: 'Facile', ja: 'かんたん', ko: '쉬움' };
const MEDIUM = { tr: 'Orta', en: 'Medium', pt: 'Médio', de: 'Mittel', fr: 'Moyen', ja: 'ふつう', ko: '보통' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };

async function hintStep(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click();
  await page.waitForTimeout(80);
  const cell = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).backgroundColor === 'rgb(126, 224, 161)');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (cell) await page.mouse.click(cell.x, cell.y);
  await page.waitForTimeout(120);
}

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8768/',
  storageKey: 'huzur-mines:progress:v1',
  progress: (lang) => ({ hints: 99, next: { easy: 3, medium: 5, hard: 2 }, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(MEDIUM[lang], { exact: true }).click();
    await page.waitForTimeout(700);
    const closed = await page.getByRole('button', { name: 'closed', exact: true }).all();
    await closed[Math.floor(closed.length / 2) + 4].click();
    await page.waitForTimeout(400);
    // birkaç bayrak koy (görünsün)
    for (let k = 0; k < 3; k++) await hintStep(page, lang);
    await save('2-start.jpg');
    for (let k = 0; k < 6; k++) await hintStep(page, lang);
    await save('3-play.jpg');
    for (let k = 0; k < 80; k++) {
      if (await page.getByRole('button', { name: 'closed', exact: true }).count() === 0) break;
      await hintStep(page, lang);
      if (await page.evaluate(() => document.querySelectorAll('[aria-label="closed"]').length === 0)) break;
    }
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
