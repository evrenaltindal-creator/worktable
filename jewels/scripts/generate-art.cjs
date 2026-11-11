/* Huzur Jewels çizimleri: 6 mücevher (her biri ayrı biçimde), özel taş katmanları, çekiç simgesi, uygulama ikonu.
   node scripts/generate-art.cjs */
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const ngon = (n, r, rot = -90, cx = 50, cy = 52) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const scale = (pts, k, cx = 50, cy = 52) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);

// Renk + biçim: renk ayırt edemeyenler de biçimden tanır
const HEART = Array.from({ length: 40 }, (_, i) => {
  const t = (i / 40) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [50 + x * 2.7, 50 - y * 2.7];
});
const GEMS = [
  { light: '#FF8A95', base: '#E0283E', dark: '#7D0F1E', shape: ngon(12, 44, -90) }, // kırmızı: yuvarlak
  { light: '#8EC5FF', base: '#2471D6', dark: '#0E356E', shape: [[12, 22], [22, 12], [78, 12], [88, 22], [88, 82], [78, 92], [22, 92], [12, 82]] }, // mavi: kare
  { light: '#9BF0B8', base: '#1FA85A', dark: '#0B5A2E', shape: ngon(3, 50, -90, 50, 58) }, // yeşil: üçgen
  { light: '#FFF0A0', base: '#F2B705', dark: '#8A6200', shape: [[50, 4], [92, 52], [50, 98], [8, 52]] }, // sarı: eşkenar dörtgen
  { light: '#D9B3FF', base: '#8A43D6', dark: '#45197A', shape: ngon(6, 46, -90) }, // mor: altıgen
  { light: '#FFC8A0', base: '#F06A1A', dark: '#8A3505', shape: HEART }, // turuncu: kalp
];

function gem({ light, base, dark, shape }, id = 'g') {
  const inner = scale(shape, 0.55);
  // köşelerden iç yüzeye kesim çizgileri (mücevher yüzeyi)
  const facets = shape
    .filter((_, i) => shape.length <= 12 || i % 5 === 0)
    .map((p, i) => {
      const q = inner[shape.indexOf(p)];
      return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#FFFFFF" stroke-opacity="${i % 2 ? 0.18 : 0.32}" stroke-width="1.6"/>`;
    })
    .join('');
  return `<defs>
      <linearGradient id="${id}a" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.45" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
      <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.75"/><stop offset="0.6" stop-color="${base}" stop-opacity="0.2"/><stop offset="1" stop-color="${dark}" stop-opacity="0.3"/></linearGradient>
    </defs>
    <polygon points="${poly(scale(shape, 1, 50, 55))}" fill="#000000" opacity="0.22"/>
    <polygon points="${poly(shape)}" fill="url(#${id}a)" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>
    ${facets}
    <polygon points="${poly(inner)}" fill="url(#${id}b)" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="38" cy="32" rx="9" ry="5" fill="#FFFFFF" opacity="0.7" transform="rotate(-30 38 32)"/>
    <circle cx="62" cy="68" r="2.4" fill="#FFFFFF" opacity="0.6"/>`;
}

function star() {
  const cols = ['#E0283E', '#F06A1A', '#F2B705', '#1FA85A', '#2471D6', '#8A43D6'];
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 22 : 47;
    const a = ((-90 + 22.5 * i) * Math.PI) / 180;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
  const stops = cols.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('');
  return svg(`<defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>
      <radialGradient id="h" cx="0.4" cy="0.35" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
    <polygon points="${poly(pts)}" fill="url(#r)" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="${poly(pts)}" fill="url(#h)"/>
    <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>`, 100, 100);
}

// Özel taş katmanları (taşın üstüne biner)
const ARROW = (rot) => `<g transform="rotate(${rot} 50 50)" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
    <path d="M14 50 H86"/><path d="M24 40 L14 50 L24 60"/><path d="M76 40 L86 50 L76 60"/></g>
    <g transform="rotate(${rot} 50 50)" stroke="#000000" stroke-opacity="0.25" stroke-width="2" fill="none"><path d="M14 54 H86"/></g>`;
const overlays = {
  'gems/row.png': svg(ARROW(0), 100, 100),
  'gems/col.png': svg(ARROW(90), 100, 100),
  'gems/bomb.png': svg(`<circle cx="50" cy="50" r="44" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="10 7" opacity="0.95"/>
    <circle cx="50" cy="50" r="13" fill="#FFFFFF" opacity="0.95"/>
    ${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="47" y="20" width="6" height="12" rx="3" fill="#FFFFFF" transform="rotate(${a} 50 50)"/>`).join('')}`, 100, 100),
};

const W = '#FFFFFF';
const icons = {
  'ui/hammer.png': svg(`<g transform="rotate(-40 24 24)"><rect x="10" y="8" width="28" height="12" rx="3" fill="${W}"/><rect x="21" y="18" width="6" height="26" rx="3" fill="${W}"/></g>`, 48, 48),
  'ui/shuffle.png': svg(`<path d="M6 14 H14 C24 14 24 34 34 34 H40 M34 28 L40 34 L34 40" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 34 H14 C18 34 20 30 22 26 M26 20 C28 16 30 14 34 14 H40 M34 8 L40 14 L34 20" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 48, 48),
};

function appIcon(withBg = true) {
  const bg = withBg
    ? `<defs><radialGradient id="bg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#3A2A7A"/><stop offset="1" stop-color="#140B33"/></radialGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>`
    : '';
  const place = (i, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${gem(GEMS[i], `i${i}`)}</g>`;
  const sparkle = (x, y, s) => `<path d="M${x} ${y - s} L${x + s * 0.25} ${y - s * 0.25} L${x + s} ${y} L${x + s * 0.25} ${y + s * 0.25} L${x} ${y + s} L${x - s * 0.25} ${y + s * 0.25} L${x - s} ${y} L${x - s * 0.25} ${y - s * 0.25} Z" fill="#FFFFFF"/>`;
  return svg(`${bg}${place(1, 90, 110, 4.4)}${place(4, 530, 90, 4.4)}${place(0, 290, 440, 5)}${sparkle(840, 700, 70)}${sparkle(170, 800, 44)}`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  require('fs').mkdirSync(path.join(ROOT, 'assets', 'gems'), { recursive: true });
  for (let i = 0; i < GEMS.length; i++) await render(svg(gem(GEMS[i]), 100, 100), `gems/g${i}.png`, 160, 160);
  await render(star(), 'gems/star.png', 160, 160);
  for (const [f, s] of Object.entries(overlays)) await render(s, f, 160, 160);
  for (const [f, s] of Object.entries(icons)) await render(s, f, 144, 144);
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#140B33"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="(#[0-9A-Fa-f]{6}|url\([^)]*\))"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Jewels çizimleri üretildi.');
})();
