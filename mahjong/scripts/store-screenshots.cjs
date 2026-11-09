/*
 * App Store ekran görüntülerini üretir (Apple'ın istediği tam boyutlarda).
 *
 *   npx expo export --platform web
 *   npx serve dist -l 8765        (veya: python -m http.server 8765 --directory dist)
 *   node scripts/store-screenshots.cjs
 *
 * Gerekli: playwright (npm install --no-save playwright && npx playwright install chromium)
 * Çıktı: store/screenshots/{iphone-6.9,ipad-13}/*.png
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const URL = process.env.APP_URL || 'http://localhost:8765/';
const OUT = path.join(__dirname, '..', 'store', 'screenshots');

const DEVICES = [
  // 6.9" iPhone: 1320 x 2868
  { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3, mobile: true },
  // 13" iPad: 2064 x 2752
  { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2, mobile: true },
];

const progress = (unlocked, stars = {}) =>
  JSON.stringify({
    unlocked,
    best: Object.fromEntries(Object.keys(stars).map((k) => [k, 60])),
    stars,
    boosters: { hint: 3, shuffle: 2, undo: 5 },
    settings: { sound: true, haptics: true, highlightFree: true },
  });

async function shoot(browser, dev, locale) {
  const ctx = await browser.newContext({
    viewport: dev.viewport,
    deviceScaleFactor: dev.scale,
    isMobile: dev.mobile,
    hasTouch: true,
    locale,
  });
  const page = await ctx.newPage();
  const dir = path.join(OUT, locale.slice(0, 2), dev.name);
  fs.mkdirSync(dir, { recursive: true });
  const L = locale.startsWith('tr')
    ? { levels: 'Seviyeler', level: (n) => `Seviye ${n}`, hint: 'İpucu' }
    : { levels: 'Levels', level: (n) => `Level ${n}`, hint: 'Hint' };

  async function setProgress(p) {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate((v) => {
      localStorage.clear();
      localStorage.setItem('huzur:progress:v1', v);
    }, p);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
  }

  async function openLevel(n) {
    await setProgress(progress(n));
    await page.getByText(L.levels, { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: L.level(n), exact: true }).click();
    await page.waitForTimeout(2200); // taşlar düşerek yerleşsin
  }

  await setProgress(progress(1));
  await page.screenshot({ path: path.join(dir, '1-home.jpg'), type: 'jpeg', quality: 90 });

  await openLevel(12);
  await page.getByText(L.hint, { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(dir, '2-sunset-hint.jpg'), type: 'jpeg', quality: 90 });

  await openLevel(23);
  await page.screenshot({ path: path.join(dir, '3-dawn.jpg'), type: 'jpeg', quality: 90 });

  await openLevel(34);
  await page.screenshot({ path: path.join(dir, '4-sea.jpg'), type: 'jpeg', quality: 90 });

  const stars = { 1: 3, 2: 3, 3: 2, 4: 3, 5: 1, 6: 3, 7: 2, 8: 3, 9: 3, 10: 2, 11: 3 };
  await setProgress(progress(12, stars));
  await page.getByText(L.levels, { exact: true }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(dir, '5-levels.jpg'), type: 'jpeg', quality: 90 });
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const locale of ['tr-TR', 'en-US']) {
    for (const dev of DEVICES) await shoot(browser, dev, locale);
  }
  await browser.close();
  console.log('Ekran görüntüleri:', OUT);
})();
