/* Huzur Bubbles App Store ekran görüntüleri.  Web derlemesini 8769'da sunup: node scripts/store-screenshots.cjs [diller] */
const path = require('path');
const { execSync } = require('child_process');
const { run } = require('../../shared/shots.cjs');

const LEVEL = 10;
const LEVEL_TEXT = { tr: 'Seviye', en: 'Level', pt: 'Nível', de: 'Level', fr: 'Niveau', ja: 'レベル', ko: '레벨' };
const SH_Y = 1 + (13 + 1.6) * Math.sqrt(3); // GameScreen'deki SHOOTER.y
const H_UNITS = SH_Y + 1.6;

// Seviyeyi bitiren açılar (oyundaki renk sırasıyla aynı)
const { angles } = JSON.parse(execSync(`npx tsx scripts/bot-angles.ts ${LEVEL}`, { cwd: path.join(__dirname, '..') }).toString());

async function shooter(page) {
  const box = await page.getByTestId('bubble-area').boundingBox();
  const u = Math.min(box.width / 18, box.height / H_UNITS);
  return { u, x: box.x + (box.width - 18 * u) / 2 + 9 * u, y: box.y + SH_Y * u };
}

async function aim(page, a) {
  const s = await shooter(page);
  await page.mouse.move(s.x, s.y - 3 * s.u);
  await page.mouse.down();
  await page.mouse.move(s.x + Math.cos(a) * 14 * s.u, s.y - Math.sin(a) * 14 * s.u, { steps: 4 });
}

async function shoot(page, a) {
  await aim(page, a);
  await page.mouse.up();
  await page.getByTestId('flying').waitFor({ state: 'detached', timeout: 5000 });
  await page.waitForTimeout(150);
}

run({
  appDir: path.join(__dirname, '..'),
  url: process.env.APP_URL || 'http://localhost:8769/',
  storageKey: 'huzur-bubbles:progress:v1',
  progress: (lang) => ({ next: LEVEL, rainbows: 5, stars: {}, settings: { sound: true, haptics: true, language: lang } }),
  scenario: async (page, lang, save, fresh) => {
    await fresh();
    await save('1-home.jpg');
    await page.getByText(`${LEVEL_TEXT[lang]} ${LEVEL}`, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(900);
    // görüntü için net bir nişan çizgisi göster, sonra asıl açıya çevirip bırak
    await aim(page, 1.25);
    await page.waitForTimeout(200);
    await save('2-start.jpg');
    const s = await shooter(page);
    await page.mouse.move(s.x + Math.cos(angles[0]) * 14 * s.u, s.y - Math.sin(angles[0]) * 14 * s.u, { steps: 4 });
    await page.mouse.up();
    await page.getByTestId('flying').waitFor({ state: 'detached', timeout: 5000 });
    // ortalara kadar oyna; büyük bir patlamanın hemen ardından çek
    const mid = Math.floor(angles.length / 2);
    for (let i = 1; i < mid; i++) await shoot(page, angles[i]);
    await aim(page, angles[mid]);
    await page.mouse.up();
    await page.getByTestId('flying').waitFor({ state: 'detached', timeout: 5000 });
    await page.waitForTimeout(60);
    await save('3-play.jpg');
    for (let i = mid + 1; i < angles.length; i++) await shoot(page, angles[i]);
    await page.waitForTimeout(1600);
    await save('4-win.jpg');
  },
});
