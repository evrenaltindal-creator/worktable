/* Huzur Blocks çizimleri: yenile simgesi ve uygulama ikonu.  node scripts/generate-art.cjs */
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
const W = '#FFFFFF';
const COLORS = [['#E8505B', '#A3303A'], ['#3C8CE7', '#2560A8'], ['#3FBF7F', '#26845A'], ['#F5B82E', '#B07F0E'], ['#9A5BD8', '#673A99'], ['#FF8A3D', '#B85A1E']];

const block = (x, y, s, [face, edge]) =>
  `<rect x="${x + s * 0.05}" y="${y + s * 0.05}" width="${s * 0.9}" height="${s * 0.9}" rx="${s * 0.18}" fill="${edge}"/>` +
  `<rect x="${x + s * 0.05}" y="${y + s * 0.05}" width="${s * 0.9}" height="${s * 0.78}" rx="${s * 0.18}" fill="${face}"/>` +
  `<rect x="${x + s * 0.17}" y="${y + s * 0.14}" width="${s * 0.66}" height="${s * 0.2}" rx="${s * 0.08}" fill="#FFFFFF" opacity="0.32"/>`;

function appIcon(withBg = true) {
  const bg = withBg ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B6CB0"/><stop offset="1" stop-color="#173A6B"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>` : '';
  // 4x4 ızgara; bir satır dolmak üzere, üstten bir L parçası iniyor
  const s = 150, ox = 212, oy = 300;
  const grid = [
    [-1, -1, -1, -1],
    [1, -1, -1, 4],
    [1, 1, -1, 4],
    [2, 2, 2, -1],
  ];
  let out = `<rect x="${ox - 20}" y="${oy - 20}" width="${s * 4 + 40}" height="${s * 4 + 40}" rx="60" fill="#0B1E3A" opacity="0.55"/>`;
  grid.forEach((row, r) => row.forEach((v, c) => {
    out += v >= 0 ? block(ox + c * s, oy + r * s, s, COLORS[v]) : `<rect x="${ox + c * s + 8}" y="${oy + r * s + 8}" width="${s - 16}" height="${s - 16}" rx="24" fill="#FFFFFF" opacity="0.08"/>`;
  }));
  // inen parça (sarı) ve boşluk
  out += block(ox + 3 * s, oy + 3 * s - 40, s, COLORS[3]);
  out += block(ox + 2 * s, oy + 0 * s - 170, s, COLORS[0]) + block(ox + 2 * s, oy + 1 * s - 170, s, COLORS[0]);
  return svg(bg + out, 1024, 1024);
}

const icons = {
  'ui/refresh.png': svg(`<path d="M38 22 A14 14 0 1 1 30 11" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M27 4 L34 11 L26 17" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 48, 48),
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  for (const [f, s] of Object.entries(icons)) await render(s, f, 144, 144);
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#173A6B"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Blocks çizimleri üretildi.');
})();
