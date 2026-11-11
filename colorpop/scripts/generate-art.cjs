/* Huzur Color Pop çizimleri: 5 renkli karo (her birinde ayrı sembol), uygulama ikonu.  node scripts/generate-art.cjs
   (Çekiç simgesi Huzur Jewels'tan kopyalanır: assets/ui/hammer.png) */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

const SYM = {
  heart: '<path d="M50 74 C 22 54, 24 30, 40 31 C 46 31, 50 37, 50 40 C 50 37, 54 31, 60 31 C 76 30, 78 54, 50 74 Z" fill="#FFFFFF"/>',
  drop: '<path d="M50 24 C 60 40, 70 50, 70 60 A20 20 0 0 1 30 60 C 30 50, 40 40, 50 24 Z" fill="#FFFFFF"/>',
  leaf: '<path d="M28 72 C 26 44, 44 28, 74 28 C 74 58, 58 74, 30 72 Z" fill="#FFFFFF"/><path d="M32 68 L62 38" stroke="#000" stroke-opacity="0.18" stroke-width="3"/>',
  sun: '<circle cx="50" cy="50" r="13" fill="#FFFFFF"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="47.5" y="22" width="5" height="11" rx="2.5" fill="#FFFFFF" transform="rotate(${a} 50 50)"/>`).join(''),
  moon: '<path d="M60 26 A25 25 0 1 0 72 62 A20 20 0 1 1 60 26 Z" fill="#FFFFFF"/>',
};
const TILES = [
  ['#EF5466', '#B02C3D', SYM.heart],
  ['#3D8BEA', '#2259A6', SYM.drop],
  ['#3CC07D', '#22834F', SYM.leaf],
  ['#F7B92F', '#B37E0C', SYM.sun],
  ['#9C61DB', '#64369C', SYM.moon],
];

function tile([face, edge, sym], id = 't') {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs>
    <rect x="4" y="6" width="92" height="90" rx="22" fill="${edge}"/>
    <rect x="4" y="4" width="92" height="84" rx="22" fill="${face}"/>
    <rect x="4" y="4" width="92" height="84" rx="22" fill="url(#${id})"/>
    <g opacity="0.95" transform="translate(0 -3)">${sym}</g>`;
}

function appIcon(withBg = true) {
  const bg = withBg ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2A65A"/><stop offset="1" stop-color="#C2456B"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>` : '';
  const place = (i, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${tile(TILES[i], `i${i}${x}`)}</g>`;
  return svg(`${bg}${place(0, 100, 110, 3.9)}${place(3, 530, 110, 3.9)}${place(1, 100, 530, 3.9)}${place(1, 530, 530, 3.9)}`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  fs.mkdirSync(path.join(ROOT, 'assets', 'tiles'), { recursive: true });
  for (let i = 0; i < TILES.length; i++) await render(svg(tile(TILES[i]), 100, 100), `tiles/t${i}.png`, 160, 160);
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#C2456B"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="(#[0-9A-Fa-f]{6}|url\([^)]*\))"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Color Pop çizimleri üretildi.');
})();
