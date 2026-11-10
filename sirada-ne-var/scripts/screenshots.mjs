// App Store ekran goruntulerini 7 dilde ceker (iPhone 6.9", 1290x2796).
// Kullanim: npm run screenshots   (Playwright ve Chromium kurulu olmali)
// Cikti: fastlane/screenshots/<dil>/
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appUrl = pathToFileURL(join(root, 'web', 'index.html')).href;

const LOCALES = { tr: 'tr', en: 'en-US', pt: 'pt-BR', de: 'de-DE', fr: 'fr-FR', ja: 'ja', ko: 'ko' };
const only = process.argv.slice(2);

async function waitResult(page) {
  await page.waitForSelector('#result:not([hidden])', { timeout: 20000 });
}

const browser = await chromium.launch();
for (const [lang, store] of Object.entries(LOCALES)) {
  if (only.length && !only.includes(lang)) continue;
  const dir = join(root, 'fastlane', 'screenshots', store);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, colorScheme: 'light', locale: lang });
  const page = await ctx.newPage();
  await page.goto(appUrl + '#' + lang);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const shot = (name) => page.screenshot({ path: join(dir, name) });

  await shot('01_wheel.png');

  await page.click('#spinBtn');
  await waitResult(page);
  await page.waitForTimeout(700);
  await shot('02_result.png');
  await page.click('#okBtn');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.click('#tab-slot');
  await page.click('#lever');
  await waitResult(page);
  await page.click('#okBtn');
  await page.evaluate(() => { document.getElementById('app').classList.remove('is-won'); window.scrollTo(0, 0); });
  await page.waitForTimeout(300);
  await shot('03_slot.png');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.click('#tab-wheel');
  for (let i = 0; i < 2; i++) await page.click('#optionList li:nth-child(1) [data-act="inc"]');
  await page.click('#optionList li:nth-child(4) [data-act="inc"]');
  await page.evaluate(() => {
    const panel = document.getElementById('panel');
    window.scrollTo(0, panel.getBoundingClientRect().top + window.scrollY - 16);
  });
  await page.waitForTimeout(300);
  await shot('04_options.png');

  await ctx.close();
  console.log(store, 'ok');
}
await browser.close();
