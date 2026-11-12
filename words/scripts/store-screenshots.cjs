/* Huzur Words App Store ekran görüntüleri.  Web derlemesini 8774'te sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { execSync } = require('child_process');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 9; // çapraz kelimeler de var
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const appDir = path.join(__dirname, '..');
const puzzleOf = (lang) => JSON.parse(execSync(`npx tsx scripts/puzzle-json.ts ${lang} ${LEVEL}`, { cwd: appDir }).toString());

async function geometry(page, size) {
  const g = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).backgroundColor === 'rgba(255, 253, 245, 0.94)');
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width };
  });
  const cell = g.w / size;
  return (i) => ({ x: g.x + (i % size) * cell + cell / 2, y: g.y + Math.floor(i / size) * cell + cell / 2 });
}

run({
  appDir,
  url: process.env.APP_URL || 'http://localhost:8774/',
  storageKey: 'huzur-words:progress:v1',
  progress: (lang) => ({ next: LEVEL, hints: 9, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    const P = puzzleOf(lang);
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    const at = await geometry(page, P.size);
    const drag = async ([, a, z], shot) => {
      await page.mouse.move(at(a).x, at(a).y);
      await page.mouse.down();
      await page.mouse.move(at(z).x, at(z).y, { steps: 6 });
      if (shot) await save(shot);
      await page.mouse.up();
      await page.waitForTimeout(250);
    };
    // ilk iki kelimeyi bul, üçüncüyü çekerken çek
    await drag(P.words[0]);
    await drag(P.words[1]);
    await drag(P.words[2], '2-start.jpg');
    const half = Math.ceil(P.words.length / 2) + 1;
    for (let k = 3; k < half; k++) await drag(P.words[k]);
    await save('3-play.jpg');
    for (let k = half; k < P.words.length; k++) await drag(P.words[k]);
    await page.waitForTimeout(250);
    await save('4-win.jpg'); // tüm kelimeler bulunmuş tablo (kutlama penceresinden hemen önce)
  },
});
