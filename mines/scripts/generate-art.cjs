/* Huzur Mines'a özgü çizimler: bayrak, mayın, uygulama ikonu.  node scripts/generate-art.cjs */
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

const flag = (pole = '#5A3A22', cloth = '#E53950') => `
  <rect x="20" y="8" width="5" height="34" rx="2.5" fill="${pole}"/>
  <path d="M25 9 L42 16 L25 24 Z" fill="${cloth}"/>
  <ellipse cx="22.5" cy="42" rx="11" ry="3.5" fill="${pole}"/>`;
const mine = `
  ${[0, 45, 90, 135].map((a) => `<rect x="22" y="5" width="4" height="38" rx="2" fill="#1B2A4A" transform="rotate(${a} 24 24)"/>`).join('')}
  <circle cx="24" cy="24" r="13" fill="#1B2A4A"/>
  <circle cx="19.5" cy="19.5" r="4" fill="#FFFFFF" opacity="0.8"/>`;

const icons = {
  'ui/flag.png': svg(flag('#FFFFFF', '#FFFFFF'), 48, 48),
  'ui/flag-red.png': svg(flag(), 48, 48),
  'ui/mine.png': svg(mine, 48, 48),
};

function appIcon(size, withBg = true) {
  const bg = withBg
    ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FAE73"/><stop offset="1" stop-color="#1B6B47"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>`
    : '';
  const c = 196, x0 = 218, y0 = 218;
  const cells = [
    ['up', 0, 0], ['1', 1, 0], ['up', 2, 0],
    ['2', 0, 1], ['flag', 1, 1], ['1', 2, 1],
    ['up', 0, 2], ['1', 1, 2], ['0', 2, 2],
  ];
  const num = { '1': '#1F5FA8', '2': '#1E7F4F' };
  const body = cells.map(([k, x, y]) => {
    const X = x0 + x * c + 8, Y = y0 + y * c + 8, s = c - 16;
    if (k === 'up') return `<rect x="${X}" y="${Y + 10}" width="${s}" height="${s}" rx="26" fill="#1C6E64"/><rect x="${X}" y="${Y}" width="${s}" height="${s}" rx="26" fill="#2FA38F"/><rect x="${X + 14}" y="${Y + 12}" width="${s - 28}" height="${s * 0.3}" rx="16" fill="#FFFFFF" opacity="0.25"/>`;
    const face = `<rect x="${X}" y="${Y}" width="${s}" height="${s}" rx="26" fill="#FFFBF0"/>`;
    if (k === 'flag') return face + `<g transform="translate(${X + s / 2 - 70} ${Y + s / 2 - 74}) scale(3.1)">${flag()}</g>`;
    if (k === '0') return face;
    return face + `<text x="${X + s / 2}" y="${Y + s / 2 + 50}" text-anchor="middle" font-family="DejaVu Sans, Arial" font-weight="700" font-size="140" fill="${num[k]}">${k}</text>`;
  }).join('');
  return svg(`${bg}<rect x="200" y="214" width="624" height="624" rx="70" fill="#8A5A22"/><rect x="190" y="190" width="644" height="644" rx="70" fill="#D9B573"/>${body}`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  for (const [f, s] of Object.entries(icons)) await render(s, f, 144, 144);
  await render(appIcon(1024), 'icon.png', 1024, 1024);
  await render(appIcon(1024, false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(1024, false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#1B6B47"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(1024, false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(48), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Mines çizimleri üretildi.');
})();
