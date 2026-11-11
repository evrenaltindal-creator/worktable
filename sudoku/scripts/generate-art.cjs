/*
 * Huzur Sudoku'ya özgü çizimler: uygulama ikonu ve yeni düğme simgeleri.
 * (Sahne, efekt ve diğer simgeler Huzur Mahjong ile ortaktır, assets/ altında hazırdır.)
 *   npm install --no-save playwright && npx playwright install chromium
 *   node scripts/generate-art.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const W = '#FFFFFF';
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
const icon = (inner) => svg(inner, 48, 48);

const ui = {
  erase: icon(`<path d="M8 30 L24 12 L38 26 L24 42 L14 42 Z" fill="${W}"/>
    <path d="M14 42 L8 36 L15 28 L28 41 Z" fill="#2A6F6A" opacity="0.6"/>
    <rect x="24" y="40" width="18" height="4" rx="2" fill="${W}"/>`),
  notes: icon(`<path d="M10 38 L12 30 L32 10 L38 16 L18 36 Z" fill="${W}"/>
    <path d="M10 38 L12 30 L18 36 Z" fill="#2A6F6A" opacity="0.6"/>
    <rect x="6" y="41" width="22" height="3.5" rx="1.75" fill="${W}"/>`),
};

/** Uygulama ikonu: cilalı fildişi tahta üzerinde 3x3 kutu, birkaç rakam ve küçük bir lale */
function appIcon(size, withBg = true) {
  const bg = withBg
    ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2C7FB8"/><stop offset="1" stop-color="#173F7A"/></linearGradient></defs>
       <rect width="1024" height="1024" fill="url(#g)"/>`
    : '';
  const cells = [
    [0, 0, '5'], [1, 0, ''], [2, 0, '3'],
    [0, 1, ''], [1, 1, '7'], [2, 1, ''],
    [0, 2, '9'], [1, 2, ''], [2, 2, '1'],
  ];
  const x0 = 222, y0 = 222, c = 194;
  const grid = cells
    .map(([x, y, d]) => `<rect x="${x0 + x * c + 6}" y="${y0 + y * c + 6}" width="${c - 12}" height="${c - 12}" rx="22" fill="${x === 1 && y === 1 ? '#FFE27A' : '#FFFBF0'}"/>
      ${d ? `<text x="${x0 + x * c + c / 2}" y="${y0 + y * c + c / 2 + 52}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="150" fill="${x === 1 && y === 1 ? '#1F5FA8' : '#1B2A4A'}">${d}</text>` : ''}`)
    .join('');
  const tulip = `<g transform="translate(${x0 + c * 1.5} ${y0 + c * 0.5 - 25}) scale(4.2)">
      <path d="M0 6 L0 26" stroke="#2F7D3E" stroke-width="3"/>
      <path d="M-9 -12 C -9 2, -4 6, 0 6 C 4 6, 9 2, 9 -12 L 4.5 -6 L 0 -14 L -4.5 -6 Z" fill="#E53950"/>
    </g>`;
  return svg(`${bg}
    <rect x="200" y="214" width="624" height="624" rx="70" fill="#A86F2C"/>
    <rect x="190" y="190" width="624" height="624" rx="70" fill="#D9B573"/>
    ${grid}
    ${tulip}`, 1024, 1024).replace('width="1024" height="1024"', `width="${size}" height="${size}"`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').screenshot({ path: file, omitBackground: true });
  };
  for (const [id, s] of Object.entries(ui)) await render(s, path.join(ROOT, 'assets/ui', `${id}.png`), 144, 144);
  const A = path.join(ROOT, 'assets');
  await render(appIcon(1024), path.join(A, 'icon.png'), 1024, 1024);
  await render(appIcon(1024, false), path.join(A, 'splash-icon.png'), 1024, 1024);
  await render(appIcon(1024, false), path.join(A, 'android-icon-foreground.png'), 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#173F7A"/>', 1024, 1024), path.join(A, 'android-icon-background.png'), 1024, 1024);
  await render(appIcon(1024, false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), path.join(A, 'android-icon-monochrome.png'), 1024, 1024);
  await render(appIcon(48), path.join(A, 'favicon.png'), 48, 48);
  await browser.close();
  console.log('Huzur Sudoku çizimleri üretildi.');
})();
