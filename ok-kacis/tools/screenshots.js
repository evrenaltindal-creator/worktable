#!/usr/bin/env node
/*
 * App Store ekran görüntülerini 7 dilde üretir (iPhone 6,9 inç: 1320×2868).
 * Çıktı: store/fastlane/screenshots/<dil>/  ve site için küçük kopyalar: site/img/screens/
 *
 * Gerekenler: Playwright (Chromium ile). Küçük kopyalar için isteğe bağlı: sharp.
 *   node ok-kacis/tools/screenshots.js            # bütün diller
 *   node ok-kacis/tools/screenshots.js tr en      # sadece bazıları
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const GAME = 'file://' + path.join(ROOT, 'www', 'index.html') + '?debug&ads=none';
const OUT = path.join(ROOT, 'store', 'fastlane', 'screenshots');
const WEB = path.join(ROOT, 'site', 'img', 'screens');
const listing = JSON.parse(fs.readFileSync(path.join(ROOT, 'store', 'listing.json'), 'utf8'));
const BROWSER_LOCALE = { tr: 'tr-TR', en: 'en-US', pt: 'pt-BR', de: 'de-DE', fr: 'fr-FR', ja: 'ja-JP', ko: 'ko-KR' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {}

async function open(browser, lang, scheme) {
  const ctx = await browser.newContext({
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 3,
    locale: BROWSER_LOCALE[lang],
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  await page.goto(GAME);
  await page.waitForSelector('.card--menu');
  await page.evaluate(() => document.fonts.ready);
  await sleep(400);
  return { ctx, page };
}

async function tapFree(page) {
  const ids = await page.evaluate(() => OkKacisDebug.free());
  if (!ids.length) return false;
  const p = await page.evaluate((id) => OkKacisDebug.point(id), ids[0]);
  await page.mouse.click(p.x, p.y);
  return true;
}

const mult = (page) => page.evaluate(() => OkKacisDebug.S.combo.mult);

const SCENES = [
  {
    file: '1-combo.jpg',
    scheme: 'light',
    async run(page) {
      await page.click('.card--menu .btn--primary');
      await page.evaluate(() => OkKacisDebug.load(11));
      await sleep(1400);
      for (let i = 0; i < 12 && (await mult(page)) < 2; i++) {
        await tapFree(page);
        await sleep(110);
      }
      await sleep(220);
    },
  },
  {
    file: '2-time-attack.jpg',
    scheme: 'dark',
    async run(page) {
      await page.click('.card--menu .btn--secondary');
      await sleep(900);
      for (let i = 0; i < 120 && (await mult(page)) < 4; i++) {
        if (!(await tapFree(page))) await sleep(150);
        else await sleep(70);
      }
      await sleep(190);
    },
  },
  {
    file: '3-perfect.jpg',
    scheme: 'light',
    async run(page) {
      await page.click('.card--menu .btn--primary');
      await page.evaluate(() => OkKacisDebug.load(9));
      await sleep(1400);
      while (await tapFree(page)) await sleep(95);
      await sleep(430);
    },
  },
  {
    file: '4-record.jpg',
    scheme: 'dark',
    async run(page) {
      await page.click('.card--menu .btn--secondary');
      await sleep(900);
      for (let i = 0; i < 40; i++) {
        if (!(await tapFree(page))) await sleep(150);
        else await sleep(80);
      }
      await page.evaluate(() => OkKacisDebug.setTime(0.05));
      await page.waitForSelector('.card--record, .card--timeup');
      await sleep(1900);
    },
  },
];

(async () => {
  const only = process.argv.slice(2);
  const langs = Object.keys(listing.locales).filter((l) => !only.length || only.includes(l));
  const browser = await chromium.launch();
  fs.mkdirSync(WEB, { recursive: true });
  for (const lang of langs) {
    const dir = path.join(OUT, listing.locales[lang]);
    fs.mkdirSync(dir, { recursive: true });
    for (const scene of SCENES) {
      const { ctx, page } = await open(browser, lang, scene.scheme);
      await scene.run(page);
      const file = path.join(dir, scene.file);
      await page.screenshot({ path: file, type: 'jpeg', quality: 88 });
      if (sharp && scene.file.startsWith('1-')) {
        await sharp(file).resize(600).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(WEB, `${lang}.jpg`));
      }
      await ctx.close();
    }
    console.log('ok', lang);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
