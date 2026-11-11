/* Huzur Blocks App Store ekran görüntüleri.  Web derlemesini 8771'de sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 6;
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };
const KEY = 'huzur-blocks:progress:v1';

// İpucunun gösterdiği soluk (hayalet) blokların ortası
const ghost = (page) =>
  page.evaluate(() => {
    const els = [...document.querySelectorAll('div')].filter((d) => d.style.opacity === '0.45');
    if (!els.length) return null;
    const rs = els.map((e) => e.getBoundingClientRect());
    const x0 = Math.min(...rs.map((r) => r.left));
    const x1 = Math.max(...rs.map((r) => r.right));
    const y0 = Math.min(...rs.map((r) => r.top));
    const y1 = Math.max(...rs.map((r) => r.bottom));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  });

async function hintPlace(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
  await page.waitForTimeout(250);
  const g = await ghost(page);
  if (g) await page.mouse.click(g.x, g.y);
  await page.waitForTimeout(450);
}

const won = (page) => page.evaluate(([k, l]) => JSON.parse(localStorage.getItem(k) || '{}').stars?.[l] !== undefined, [KEY, String(LEVEL)]);

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8771/',
  storageKey: KEY,
  progress: (lang) => ({ next: LEVEL, hints: 99, refreshes: 5, best: 2480, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    for (let k = 0; k < 6; k++) await hintPlace(page, lang);
    // yeni üçlü gelene kadar yerleştir, sonra ilk parçayı tahtanın üstünde sürüklerken çek
    for (let k = 0; k < 3; k++) {
      const n = await page.evaluate(() => [...document.querySelectorAll('div')].filter((d) => getComputedStyle(d).backgroundColor === 'rgba(12, 24, 48, 0.35)').length);
      if (n === 3) break;
      await hintPlace(page, lang);
    }
    const slot = await page.evaluate(() => {
      const el = [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).backgroundColor === 'rgba(12, 24, 48, 0.35)');
      const r = el?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    });
    const box = await page.getByTestId('blocks-area').boundingBox();
    if (slot) {
      await page.mouse.move(slot.x, slot.y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.62, { steps: 10 });
      await page.waitForTimeout(150);
      await save('2-start.jpg');
      await page.mouse.up();
      await page.waitForTimeout(450);
    } else await save('2-start.jpg');
    for (let k = 0; k < 5; k++) await hintPlace(page, lang);
    await save('3-play.jpg');
    for (let k = 0; k < 120 && !(await won(page)); k++) await hintPlace(page, lang);
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
