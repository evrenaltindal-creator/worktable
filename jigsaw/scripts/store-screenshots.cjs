/* Huzur Jigsaw App Store ekran görüntüleri.  Web derlemesini 8773'te sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 10; // 5x5, ayçiçeği resmi
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const HINT = { tr: 'İpucu', en: 'Hint', pt: 'Dica', de: 'Tipp', fr: 'Indice', ja: 'ヒント', ko: '힌트' };

const rectOf = (page, test) =>
  page.evaluate((kind) => {
    const el = [...document.querySelectorAll('div')].find((d) => {
      const s = getComputedStyle(d);
      return kind === 'hint' ? s.borderTopColor === 'rgb(126, 224, 161)' && s.borderTopWidth === '4px' : s.borderTopColor === 'rgb(255, 255, 255)' && s.borderTopWidth === '3px';
    });
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width } : null;
  }, test);

async function hint(page, lang) {
  await page.getByRole('button', { name: new RegExp(`^${HINT[lang]}`) }).click({ force: true });
  await page.waitForTimeout(250);
  return rectOf(page, 'hint');
}

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8773/',
  storageKey: 'huzur-jigsaw:progress:v1',
  progress: (lang) => ({ next: LEVEL, hints: 99, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(1200);
    // ilk birkaç parçayı yerleştir, sonra birini sürüklerken çek
    for (let k = 0; k < 6; k++) {
      const h = await hint(page, lang);
      if (h) await page.mouse.click(h.x, h.y);
      await page.waitForTimeout(250);
    }
    const h = await hint(page, lang);
    const sel = await rectOf(page, 'sel');
    if (h && sel) {
      await page.mouse.move(sel.x, sel.y);
      await page.mouse.down();
      await page.mouse.move(h.x - h.w * 0.6, h.y + h.w * 1.3, { steps: 10 });
      await page.waitForTimeout(150);
      await save('2-start.jpg');
      await page.mouse.move(h.x, h.y + h.w * 0.9, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(300);
    } else await save('2-start.jpg');
    for (let k = 0; k < 8; k++) {
      const p = await hint(page, lang);
      if (p) await page.mouse.click(p.x, p.y);
      await page.waitForTimeout(250);
    }
    await save('3-play.jpg');
    for (let k = 0; k < 40; k++) {
      const p = await hint(page, lang);
      if (!p) break;
      await page.mouse.click(p.x, p.y);
      await page.waitForTimeout(250);
    }
    // tamamlanan resim (kutlama penceresinden hemen önce)
    await page.waitForTimeout(350);
    await save('4-win.jpg');
  },
});
