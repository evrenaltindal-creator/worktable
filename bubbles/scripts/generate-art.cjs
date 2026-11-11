/* Huzur Bubbles çizimleri: 6 renkli balon (her birinde ayrı sembol), gökkuşağı balonu, simgeler, uygulama ikonu. */
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const svg = (inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

// Renk ve sembol: renk körü oyuncular da ayırt edebilsin
const BUBBLES = [
  ['#E53950', '#8E1B2C', '<path d="M50 70 C 20 50, 26 28, 42 32 C 47 33, 50 38, 50 40 C 50 38, 53 33, 58 32 C 74 28, 80 50, 50 70 Z" fill="#FFFFFF"/>'], // kırmızı: kalp
  ['#2F7FE0', '#173F7A', '<path d="M50 26 L56 42 L74 43 L60 54 L65 72 L50 62 L35 72 L40 54 L26 43 L44 42 Z" fill="#FFFFFF"/>'], // mavi: yıldız
  ['#2FB06A', '#14603B', '<path d="M50 28 C 70 36, 72 60, 50 74 C 30 60, 32 36, 50 28 Z M50 32 L50 70" fill="#FFFFFF" stroke="#2FB06A" stroke-width="3"/>'], // yeşil: yaprak
  ['#F5B82E', '#9C6B0A', '<circle cx="50" cy="50" r="12" fill="#FFFFFF"/>' + [0,45,90,135,180,225,270,315].map(a => `<rect x="48" y="24" width="4" height="10" rx="2" fill="#FFFFFF" transform="rotate(${a} 50 50)"/>`).join('')], // sarı: güneş
  ['#9A5BD8', '#56288F', '<path d="M50 26 L72 50 L50 74 L28 50 Z" fill="#FFFFFF"/>'], // mor: elmas
  ['#FF8A3D', '#A84A10', '<path d="M50 28 L54 44 L70 40 L58 52 L68 66 L52 60 L50 76 L48 60 L32 66 L42 52 L30 40 L46 44 Z" fill="#FFFFFF"/>'], // turuncu: çiçek
];

function bubble([fill, dark, symbol]) {
  return svg(`<defs><radialGradient id="g" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/><stop offset="0.25" stop-color="${fill}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
    <circle cx="50" cy="50" r="47" fill="url(#g)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="${dark}" stroke-width="2" opacity="0.6"/>
    <g opacity="0.92">${symbol}</g>
    <ellipse cx="36" cy="26" rx="14" ry="8" fill="#FFFFFF" opacity="0.55" transform="rotate(-25 36 26)"/>`, 100, 100);
}

function rainbow() {
  const cols = ['#E53950', '#FF8A3D', '#F5B82E', '#2FB06A', '#2F7FE0', '#9A5BD8'];
  const seg = cols.map((c, i) => {
    const a0 = (i / 6) * Math.PI * 2, a1 = ((i + 1) / 6) * Math.PI * 2;
    return `<path d="M50 50 L${50 + 47 * Math.cos(a0)} ${50 + 47 * Math.sin(a0)} A47 47 0 0 1 ${50 + 47 * Math.cos(a1)} ${50 + 47 * Math.sin(a1)} Z" fill="${c}"/>`;
  }).join('');
  return svg(`<defs><radialGradient id="s" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.7"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.25"/></radialGradient></defs>
    ${seg}<circle cx="50" cy="50" r="47" fill="url(#s)"/><path d="M50 30 L55 45 L70 50 L55 55 L50 70 L45 55 L30 50 L45 45 Z" fill="#FFFFFF"/>`, 100, 100);
}

const W = '#FFFFFF';
const icons = {
  'ui/swap.png': svg(`<path d="M10 18 H34 M28 11 L35 18 L28 25" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 32 H14 M20 25 L13 32 L20 39" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 48, 48),
  'ui/rainbow.png': svg(`<path d="M6 36 A18 18 0 0 1 42 36" stroke="${W}" stroke-width="5" fill="none"/><path d="M13 36 A11 11 0 0 1 35 36" stroke="${W}" stroke-width="4" fill="none" opacity="0.8"/><path d="M20 36 A4 4 0 0 1 28 36" stroke="${W}" stroke-width="3" fill="none" opacity="0.6"/>`, 48, 48),
};

function appIcon(withBg = true) {
  const bg = withBg ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5BB8F0"/><stop offset="1" stop-color="#2E5FB8"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>` : '';
  const place = (i, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${bubble(BUBBLES[i]).replace(/<svg[^>]*>|<\/svg>/g, '').replace(/id="g"/g, `id="g${i}${x}"`).replace(/url\(#g\)/g, `url(#g${i}${x})`)}</g>`;
  return svg(`${bg}${place(0, 170, 300, 3.3)}${place(1, 470, 220, 3.6)}${place(3, 330, 560, 2.9)}${place(2, 600, 520, 2.6)}`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: true });
  };
  for (let i = 0; i < BUBBLES.length; i++) await render(bubble(BUBBLES[i]), `bubbles/b${i}.png`, 160, 160);
  await render(rainbow(), 'bubbles/rainbow.png', 160, 160);
  for (const [f, s] of Object.entries(icons)) await render(s, f, 144, 144);
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#2E5FB8"/>', 1024, 1024), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log('Huzur Bubbles çizimleri üretildi.');
})();
