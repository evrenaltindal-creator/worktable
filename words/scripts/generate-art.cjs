/* Huzur Words çizimleri: uygulama ikonu (harf tablosu ve bulunmuş kelime şeridi).  node scripts/generate-art.cjs */
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

function appIcon(withBg = true) {
  const bg = withBg ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#21B5B5"/><stop offset="1" stop-color="#0E6F7A"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>` : '';
  const letters = ['KUŞ', 'ARI', 'GÖL'].map((r) => Array.from(r));
  const s = 200, ox = 212, oy = 212;
  let out = `<rect x="${ox - 30}" y="${oy - 30}" width="${s * 3 + 60}" height="${s * 3 + 60}" rx="70" fill="#FFFDF5"/>`;
  out += `<rect x="${ox + 10}" y="${oy + s + 22}" width="${s * 3 - 20}" height="${s - 44}" rx="${(s - 44) / 2}" fill="#FF8A3D" opacity="0.7"/>`;
  out += `<rect x="${ox + 22}" y="${oy + 10}" width="${s - 44}" height="${s * 3 - 20}" rx="${(s - 44) / 2}" fill="#3C8CE7" opacity="0.45"/>`;
  letters.forEach((row, r) => row.forEach((ch, c) => (out += `<text x="${ox + c * s + s / 2}" y="${oy + r * s + s / 2 + 52}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="150" text-anchor="middle" fill="#24324A">${ch}</text>`)));
  return svg(bg + out, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#0E6F7A"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Words çizimleri üretildi.');
})();
