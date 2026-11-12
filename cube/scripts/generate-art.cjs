/* Huzur Mahjong Cube çizimleri: 12 sembollü izometrik küp, döndür simgesi, uygulama ikonu.  node scripts/generate-art.cjs */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

// 100x100 kutuda semboller (renkli ve biçimleri farklı)
const SYM = [
  ['#D93A4E', '<path d="M50 82 C 18 60, 18 30, 36 28 C 44 27, 50 34, 50 39 C 50 34, 56 27, 64 28 C 82 30, 82 60, 50 82 Z"/>'], // kalp
  ['#2667C9', '<path d="M50 14 L60 40 L88 41 L66 58 L74 86 L50 70 L26 86 L34 58 L12 41 L40 40 Z"/>'], // yıldız
  ['#2E9B52', '<path d="M22 80 C 20 44, 44 20, 82 18 C 82 58, 60 80, 24 80 Z"/><path d="M28 74 L66 34" stroke="#FFF8E8" stroke-width="5" fill="none"/>'], // yaprak
  ['#E99A12', '<circle cx="50" cy="50" r="17"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="46.5" y="12" width="7" height="16" rx="3.5" transform="rotate(${a} 50 50)"/>`).join('')], // güneş
  ['#7A45C2', '<path d="M62 14 A36 36 0 1 0 84 66 A28 28 0 1 1 62 14 Z"/>'], // ay
  ['#1A9C9C', '<path d="M50 12 C 64 34, 76 48, 76 62 A26 26 0 0 1 24 62 C 24 48, 36 34, 50 12 Z"/>'], // damla
  ['#E0559A', [0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="28" rx="13" ry="20" transform="rotate(${a} 50 50)"/>`).join('') + '<circle cx="50" cy="50" r="11" fill="#F7C531"/>'], // çiçek
  ['#1B3C7A', '<path d="M50 10 L84 50 L50 90 L16 50 Z"/><path d="M50 10 L62 50 L50 90 L38 50 Z" fill="#4A6FB5"/>'], // elmas
  ['#B07A10', '<path d="M50 14 C 30 14, 26 34, 26 50 C 26 62, 20 68, 16 74 L84 74 C 80 68, 74 62, 74 50 C 74 34, 70 14, 50 14 Z"/><circle cx="50" cy="82" r="8"/>'], // çan
  ['#E8642A', '<path d="M14 50 C 30 26, 62 24, 76 50 C 62 76, 30 74, 14 50 Z"/><path d="M76 50 L92 34 L92 66 Z"/><circle cx="32" cy="46" r="5" fill="#FFF8E8"/>'], // balık
  ['#3D8FD8', '<path d="M24 70 A16 16 0 0 1 26 38 A20 20 0 0 1 64 30 A18 18 0 0 1 80 70 Z"/>'], // bulut
  ['#A8243A', '<path d="M14 72 L18 30 L36 48 L50 20 L64 48 L82 30 L86 72 Z"/><rect x="14" y="74" width="72" height="10" rx="3"/>'], // taç
];

const S = 100; // küp kenarı
const W = 1.732 * S;
const H = 2 * S;
const m = (ax, ay, cx, cy, e, f) => `matrix(${ax / 100} ${ay / 100} ${cx / 100} ${cy / 100} ${e} ${f})`;
const FACES = {
  top: { pts: `${W / 2},0 ${W},${S / 2} ${W / 2},${S} 0,${S / 2}`, tf: m(0.866 * S, -0.5 * S, 0.866 * S, 0.5 * S, 0, 0.5 * S), fill: '#FFF8E8' },
  left: { pts: `0,${S / 2} ${W / 2},${S} ${W / 2},${H} 0,${1.5 * S}`, tf: m(0.866 * S, 0.5 * S, 0, S, 0, 0.5 * S), fill: '#EEE1C2' },
  right: { pts: `${W / 2},${S} ${W},${S / 2} ${W},${1.5 * S} ${W / 2},${H}`, tf: m(0.866 * S, -0.5 * S, 0, S, W / 2, S), fill: '#D8C59C' },
};

function cubeSvg([color, sym], withSvg = true) {
  const face = (f, shade) => `<polygon points="${f.pts}" fill="${f.fill}" stroke="#A88C58" stroke-width="2.5" stroke-linejoin="round"/>` + `<g transform="${f.tf}"><g transform="translate(14 14) scale(0.72)" fill="${color}" opacity="${shade}">${sym}</g></g>`;
  const inner = face(FACES.left, 0.9) + face(FACES.right, 0.8) + face(FACES.top, 1) + `<polyline points="0,${S / 2} ${W / 2},${S} ${W},${S / 2}" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="2"/>`;
  return withSvg ? svg(inner, W, H) : inner;
}

const WHITE = '#FFFFFF';
const icons = {
  'ui/rotate.png': svg(`<path d="M10 26 A14 14 0 1 1 24 38" stroke="${WHITE}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M4 18 L10 27 L18 20" stroke="${WHITE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 48, 48),
};

function appIcon(withBg = true) {
  const bg = withBg ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F8F6E"/><stop offset="1" stop-color="#145A57"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>` : '';
  const k = 2.6;
  const place = (i, gx, gy, gz) => {
    const sx = 512 + (gx - gy) * 0.866 * S * k - (W * k) / 2;
    const sy = 170 + (gx + gy) * 0.5 * S * k - gz * S * k;
    return `<g transform="translate(${sx} ${sy}) scale(${k})">${cubeSvg(SYM[i], false)}</g>`;
  };
  // 2x2 taban ve üstte bir küp
  return svg(`${bg}${place(1, 0, 0, 0)}${place(2, 1, 0, 0)}${place(3, 0, 1, 0)}${place(4, 1, 1, 0)}${place(0, 0.5, 0.5, 1)}`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  fs.mkdirSync(path.join(ROOT, 'assets', 'cubes'), { recursive: true });
  for (let i = 0; i < SYM.length; i++) await render(cubeSvg(SYM[i]), `cubes/c${i}.png`, Math.round(W * 1.6), Math.round(H * 1.6));
  for (const [f, s] of Object.entries(icons)) await render(s, f, 144, 144);
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#145A57"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Mahjong Cube çizimleri üretildi.');
})();
