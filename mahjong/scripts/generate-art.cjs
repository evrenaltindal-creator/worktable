/*
 * Taş yüzlerini, arayüz simgelerini ve uygulama ikonunu üretir.
 *
 * Bütün çizimler bu dosyadaki SVG kodlarından üretilir; dışarıdan hazır görsel
 * kullanılmaz. Çıktılar assets/ klasörüne PNG olarak yazılır ve repoya eklenir,
 * bu yüzden uygulamayı çalıştırmak için bu betiği çalıştırmanız GEREKMEZ.
 * Sadece çizimleri değiştirmek isterseniz:
 *
 *   npm install --no-save playwright && npx playwright install chromium
 *   npm run gen:art
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT_TILES = path.join(ROOT, 'assets', 'tiles');
const OUT_UI = path.join(ROOT, 'assets', 'ui');

// ---------------------------------------------------------------- renkler
const BLUE = '#1F5FA8';
const GREEN = '#1E7F4F';
const RED = '#C42F2A';
const NAVY = '#1B2A4A';
const INK = '#26324A';

// Yüz alanı: 88 x 116 birim (uygulamadaki taş yüzü oranı ile aynı).
const FW = 88;
const FH = 116;

const CJK = "'Noto Serif TC', 'WenQuanYi Zen Hei', serif";
const NUM = "'DejaVu Sans', 'Arial', sans-serif";

function svg(inner, w = FW, h = FH) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
}

function cornerIndex(n, color = INK) {
  return `<text x="6" y="16" font-family="${NUM}" font-weight="700" font-size="14" fill="${color}">${n}</text>`;
}

// ---------------------------------------------------------------- daireler
function coin(cx, cy, r, color) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="#FFFFFF"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="${color}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#FFFFFF"/>`;
}

function bigCoin(cx, cy) {
  let s = `<circle cx="${cx}" cy="${cy}" r="33" fill="${GREEN}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="28" fill="#FFFFFF"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s += `<circle cx="${cx + Math.cos(a) * 22}" cy="${cy + Math.sin(a) * 22}" r="4.2" fill="${BLUE}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="14" fill="${RED}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="8" fill="#FFFFFF"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="4" fill="${RED}"/>`;
  return s;
}

function dots(n) {
  const L = 28, C = 46, R = 64;
  const layouts = {
    2: [[C, 36, GREEN], [C, 86, BLUE]],
    3: [[L, 32, BLUE], [C, 61, RED], [R, 90, GREEN]],
    4: [[L, 40, BLUE], [R, 40, GREEN], [L, 84, GREEN], [R, 84, BLUE]],
    5: [[L, 36, BLUE], [R, 36, GREEN], [C, 62, RED], [L, 88, GREEN], [R, 88, BLUE]],
    6: [[L, 32, GREEN], [R, 32, GREEN], [L, 62, RED], [R, 62, RED], [L, 92, RED], [R, 92, RED]],
    7: [[24, 26, GREEN], [C, 37, GREEN], [68, 48, GREEN], [L, 72, RED], [R, 72, RED], [L, 97, RED], [R, 97, RED]],
    8: [[L, 26, BLUE], [R, 26, BLUE], [L, 50, BLUE], [R, 50, BLUE], [L, 74, BLUE], [R, 74, BLUE], [L, 98, BLUE], [R, 98, BLUE]],
    9: [[24, 34, BLUE], [C, 34, BLUE], [68, 34, BLUE], [24, 64, RED], [C, 64, RED], [68, 64, RED], [24, 94, GREEN], [C, 94, GREEN], [68, 94, GREEN]],
  };
  const radius = { 2: 15, 3: 12.5, 4: 13.5, 5: 12, 6: 11.5, 7: 10, 8: 10, 9: 10 }[n];
  if (n === 1) return svg(cornerIndex(1) + bigCoin(46, 62));
  return svg(cornerIndex(n) + layouts[n].map(([x, y, c]) => coin(x, y, radius, c)).join(''));
}

// ---------------------------------------------------------------- bambular
function stick(cx, cy, color, h = 30, w = 9) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${color}"/>
    <rect x="${x - 1}" y="${cy - 2}" width="${w + 2}" height="4" rx="2" fill="${color}"/>
    <rect x="${x + 2.2}" y="${y + 3}" width="2" height="${h - 6}" rx="1" fill="#FFFFFF" opacity="0.55"/>
    <rect x="${x - 1}" y="${y + 1}" width="${w + 2}" height="3" rx="1.5" fill="${color}"/>
    <rect x="${x - 1}" y="${y + h - 4}" width="${w + 2}" height="3" rx="1.5" fill="${color}"/>`;
}

function bambooOne() {
  // Tek bambu: yapraklı büyük bir filiz (özgün çizim).
  return svg(`${cornerIndex(1)}
    <rect x="40" y="20" width="12" height="88" rx="6" fill="${GREEN}"/>
    <rect x="38" y="44" width="16" height="5" rx="2.5" fill="#15603B"/>
    <rect x="38" y="72" width="16" height="5" rx="2.5" fill="#15603B"/>
    <rect x="43" y="24" width="3" height="80" rx="1.5" fill="#FFFFFF" opacity="0.5"/>
    <path d="M52 44 C 70 30, 80 34, 82 40 C 72 42, 62 46, 52 50 Z" fill="#2FA866"/>
    <path d="M40 70 C 22 56, 10 60, 8 66 C 18 68, 30 72, 40 76 Z" fill="#2FA866"/>
    <path d="M52 76 C 66 70, 74 74, 76 80 C 68 80, 60 82, 52 82 Z" fill="#2FA866"/>
    <circle cx="46" cy="16" r="6" fill="${RED}"/>`);
}

function bamboo(n) {
  if (n === 1) return bambooOne();
  const G = GREEN, R = RED, B = BLUE;
  const top = 40, mid = 62, bot = 88;
  const lay = {
    2: [[46, 37, G], [46, 87, B]],
    3: [[46, 37, G], [28, 87, G], [64, 87, G]],
    4: [[28, 37, B], [64, 37, G], [28, 87, G], [64, 87, B]],
    5: [[24, 32, G], [68, 32, B], [46, 62, R], [24, 92, B], [68, 92, G]],
    6: [[22, 37, G], [46, 37, G], [70, 37, G], [22, 87, B], [46, 87, B], [70, 87, B]],
    7: [[46, 28, R], [22, 62, G], [46, 62, B], [70, 62, G], [22, 96, G], [46, 96, B], [70, 96, G]],
    8: [[17, 37, G], [36, 37, G], [55, 37, G], [74, 37, G], [17, 87, B], [36, 87, B], [55, 87, B], [74, 87, B]],
    9: [[22, 30, G], [46, 30, R], [70, 30, G], [22, 63, G], [46, 63, R], [70, 63, G], [22, 96, G], [46, 96, R], [70, 96, G]],
  };
  const h = n === 7 || n === 9 ? 28 : n === 5 ? 34 : 42;
  const w = n === 8 ? 11 : n >= 6 ? 12 : 13;
  void top; void mid; void bot;
  return svg(cornerIndex(n) + lay[n].map(([x, y, c]) => stick(x, y, c, h, w)).join(''));
}

// ---------------------------------------------------------------- karakterler
const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
function character(n) {
  return svg(`${cornerIndex(n)}
    <text x="46" y="54" text-anchor="middle" font-family="${CJK}" font-weight="900" font-size="38" fill="${NAVY}">${CN_NUM[n - 1]}</text>
    <text x="46" y="104" text-anchor="middle" font-family="${CJK}" font-weight="900" font-size="44" fill="${RED}">萬</text>`);
}

// ---------------------------------------------------------------- rüzgarlar ve ejderhalar
function bigGlyph(ch, color, size = 62) {
  return svg(`<text x="44" y="${58 + size * 0.36}" text-anchor="middle" font-family="${CJK}" font-weight="900" font-size="${size}" fill="${color}">${ch}</text>`);
}

function whiteDragon() {
  return svg(`
    <rect x="14" y="16" width="60" height="84" rx="6" fill="none" stroke="${BLUE}" stroke-width="6"/>
    <rect x="24" y="26" width="40" height="64" rx="3" fill="none" stroke="${BLUE}" stroke-width="3"/>`);
}

// ---------------------------------------------------------------- çiçekler (grup: pembe çerçeve)
function flowerFrame(inner) {
  return svg(`<rect x="5" y="5" width="78" height="106" rx="9" fill="none" stroke="#E46A9B" stroke-width="3" stroke-dasharray="7 4"/>${inner}`);
}

function petals(cx, cy, count, rx, ry, dist, color, rot = 0) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = rot + (i * 360) / count;
    s += `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${color}" transform="rotate(${a} ${cx} ${cy})"/>`;
  }
  return s;
}

function stem(x1, y1, x2, y2) {
  return `<path d="M${x1} ${y1} Q ${x1 + 4} ${(y1 + y2) / 2}, ${x2} ${y2}" stroke="${GREEN}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}

const flowers = [
  // Erik çiçeği (pembe, 5 yaprak)
  () => flowerFrame(`${stem(44, 64, 44, 104)}
     <path d="M44 92 C 30 84, 24 88, 22 94 C 30 96, 38 96, 44 94 Z" fill="#2FA866"/>
     ${petals(44, 46, 5, 11, 14, 14, '#F08DB4')}
     <circle cx="44" cy="46" r="8" fill="#F7D046"/>`),
  // Lale (kırmızı)
  () => flowerFrame(`${stem(44, 62, 44, 106)}
     <path d="M44 96 C 28 80, 22 82, 18 86 C 26 92, 36 98, 44 100 Z" fill="#2FA866"/>
     <path d="M44 92 C 58 78, 66 80, 70 84 C 62 90, 52 96, 44 98 Z" fill="#2FA866"/>
     <path d="M26 30 C 26 58, 36 66, 44 66 C 52 66, 62 58, 62 30 L 53 40 L 44 24 L 35 40 Z" fill="#D7263D"/>
     <path d="M44 24 L 53 40 C 52 54, 48 62, 44 66 C 40 62, 36 54, 35 40 Z" fill="#F0485C"/>`),
  // Peygamber çiçeği (mavi)
  () => flowerFrame(`${stem(44, 66, 44, 106)}
     <path d="M44 94 C 58 84, 64 86, 68 90 C 60 94, 52 96, 44 98 Z" fill="#2FA866"/>
     ${petals(44, 46, 8, 6, 13, 13, '#3C7DE0')}
     ${petals(44, 46, 8, 4, 9, 11, '#6FA3F0', 22.5)}
     <circle cx="44" cy="46" r="7" fill="#2A3F8F"/>`),
  // Lavanta (mor)
  () => flowerFrame(`${stem(44, 40, 44, 106)}
     ${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${38 + (i % 2) * 12}" cy="${24 + i * 9}" rx="7" ry="6" fill="${i % 2 ? '#8C5BD8' : '#A57BE6'}"/>`).join('')}
     <path d="M44 96 C 30 86, 24 88, 22 92 C 30 96, 38 98, 44 98 Z" fill="#2FA866"/>`),
];

// ---------------------------------------------------------------- mevsimler (grup: altın çerçeve)
function seasonFrame(inner) {
  return svg(`<rect x="5" y="5" width="78" height="106" rx="9" fill="none" stroke="#D4A017" stroke-width="3"/>
    <rect x="9" y="9" width="70" height="98" rx="7" fill="none" stroke="#D4A017" stroke-width="1"/>${inner}`);
}

const seasons = [
  // İlkbahar: filiz
  () => seasonFrame(`
     <path d="M44 100 L44 56" stroke="${GREEN}" stroke-width="5" stroke-linecap="round"/>
     <path d="M44 66 C 26 64, 18 50, 20 38 C 34 40, 44 50, 44 66 Z" fill="#45B36B"/>
     <path d="M44 60 C 60 56, 70 42, 68 30 C 54 32, 44 44, 44 60 Z" fill="#2FA866"/>
     <ellipse cx="44" cy="102" rx="22" ry="5" fill="#8B5E3C"/>`),
  // Yaz: güneş
  () => seasonFrame(`
     ${[...Array(12)].map((_, i) => `<rect x="42" y="18" width="4" height="13" rx="2" fill="#F29A1D" transform="rotate(${i * 30} 44 58)"/>`).join('')}
     <circle cx="44" cy="58" r="20" fill="#F7C531"/>
     <circle cx="44" cy="58" r="13" fill="#FBD964"/>`),
  // Sonbahar: yaprak
  () => seasonFrame(`
     <path d="M44 22 C 66 36, 72 62, 58 84 C 52 92, 36 92, 30 84 C 16 62, 22 36, 44 22 Z" fill="#E0662B"/>
     <path d="M44 28 L44 100" stroke="#8B3A12" stroke-width="3" stroke-linecap="round"/>
     <path d="M44 50 L58 40 M44 64 L60 56 M44 50 L30 40 M44 64 L28 56 M44 78 L56 72 M44 78 L32 72" stroke="#8B3A12" stroke-width="2" stroke-linecap="round"/>`),
  // Kış: kar tanesi
  () => seasonFrame(`
     ${[0, 60, 120].map((a) => `<g transform="rotate(${a} 44 58)">
        <path d="M44 24 L44 92" stroke="#3B8FD9" stroke-width="5" stroke-linecap="round"/>
        <path d="M36 32 L44 40 L52 32 M36 84 L44 76 L52 84" stroke="#3B8FD9" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`).join('')}
     <circle cx="44" cy="58" r="6" fill="#FFFFFF" stroke="#3B8FD9" stroke-width="3"/>`),
];

// ---------------------------------------------------------------- taş listesi
const tiles = {};
for (let n = 1; n <= 9; n++) {
  tiles[`d${n}`] = dots(n);
  tiles[`b${n}`] = bamboo(n);
  tiles[`c${n}`] = character(n);
}
tiles.we = bigGlyph('東', NAVY);
tiles.ws = bigGlyph('南', NAVY);
tiles.ww = bigGlyph('西', NAVY);
tiles.wn = bigGlyph('北', NAVY);
tiles.dr = bigGlyph('中', RED, 66);
tiles.dg = bigGlyph('發', GREEN, 60);
tiles.dw = whiteDragon();
flowers.forEach((f, i) => (tiles[`f${i + 1}`] = f()));
seasons.forEach((f, i) => (tiles[`s${i + 1}`] = f()));

// ---------------------------------------------------------------- arayüz simgeleri (beyaz, 48x48)
function icon(inner) {
  return svg(inner, 48, 48);
}
const W = '#FFFFFF';
const ui = {
  undo: icon(`<path d="M18 12 L8 21 L18 30" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 21 H28 C36 21, 41 27, 41 33 C41 39, 36 42, 30 42 H20" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  hint: icon(`<path d="M24 5 C 14 5, 9 13, 9 19 C 9 26, 15 29, 16 35 H32 C33 29, 39 26, 39 19 C 39 13, 34 5, 24 5 Z" fill="${W}"/>
              <rect x="17" y="37" width="14" height="4" rx="2" fill="${W}"/>
              <rect x="19" y="42" width="10" height="4" rx="2" fill="${W}"/>`),
  shuffle: icon(`<path d="M5 14 H14 C24 14, 24 34, 34 34 H41" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M5 34 H14 C24 34, 24 14, 34 14 H41" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M36 8 L42 14 L36 20 M36 28 L42 34 L36 40" stroke="${W}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  home: icon(`<path d="M6 23 L24 7 L42 23" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11 21 V41 H20 V30 H28 V41 H37 V21" fill="${W}"/>`),
  settings: icon(`${[...Array(8)].map((_, i) => `<rect x="21" y="3" width="6" height="10" rx="2" fill="${W}" transform="rotate(${i * 45} 24 24)"/>`).join('')}
              <circle cx="24" cy="24" r="14" fill="${W}"/><circle cx="24" cy="24" r="6" fill="#2A6F6A"/>`),
  lock: icon(`<path d="M15 21 V15 C15 9, 19 6, 24 6 C29 6, 33 9, 33 15 V21" stroke="${W}" stroke-width="5" fill="none"/>
              <rect x="10" y="20" width="28" height="22" rx="4" fill="${W}"/>`),
  check: icon(`<path d="M9 25 L20 36 L40 12" stroke="${W}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  restart: icon(`<path d="M38 24 C38 32, 32 39, 24 39 C16 39, 9 32, 9 24 C9 16, 16 9, 24 9 C29 9, 33 11, 36 15" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round"/>
              <path d="M37 5 V16 H26" stroke="${W}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  grid: icon(`${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${6 + c * 13}" y="${6 + r * 13}" width="10" height="10" rx="2.5" fill="${W}"/>`).join('')).join('')}`),
  play: icon(`<path d="M14 8 L40 24 L14 40 Z" fill="${W}" stroke="${W}" stroke-width="3" stroke-linejoin="round"/>`),
  back: icon(`<path d="M30 8 L14 24 L30 40" stroke="${W}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  close: icon(`<path d="M12 12 L36 36 M36 12 L12 36" stroke="${W}" stroke-width="6" stroke-linecap="round"/>`),
};

// ---------------------------------------------------------------- uygulama ikonu
function appIcon(size, withBg = true) {
  const bg = withBg
    ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D6B66"/><stop offset="1" stop-color="#0D3B3E"/></linearGradient></defs>
       <rect width="1024" height="1024" fill="url(#g)"/>`
    : '';
  const tile = (x, y, rot, inner) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <rect x="0" y="0" width="360" height="470" rx="44" fill="#C9A86A"/>
      <rect x="0" y="0" width="330" height="440" rx="40" fill="#FFFBF0"/>
      <g transform="translate(14 14) scale(3.43)">${inner}</g>
    </g>`;
  const inner = (s) => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">${bg}
    ${tile(170, 300, -12, inner(tiles.dr))}
    ${tile(470, 250, 9, inner(flowers[1]()))}
  </svg>`;
}

// ---------------------------------------------------------------- çizim
async function main() {
  fs.mkdirSync(OUT_TILES, { recursive: true });
  fs.mkdirSync(OUT_UI, { recursive: true });

  const fontDir = path.join(ROOT, 'node_modules', '@fontsource', 'noto-serif-tc');
  const fontCss = fs
    .readFileSync(path.join(fontDir, '900.css'), 'utf8')
    .replace(/url\(\.\/files\//g, `url(file://${fontDir}/files/`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  async function render(svgText, file, width, height) {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<!doctype html><html><head><style>${fontCss}
        html,body{margin:0;padding:0;background:transparent}
        svg{display:block;width:${width}px;height:${height}px}</style></head>
        <body>${svgText}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.locator('svg').screenshot({ path: file, omitBackground: true });
  }

  // Bütün CJK karakterlerinin yüklenmesi için bir kez hepsini çiz
  await page.setContent(`<style>${fontCss}</style><div style="font-family:'Noto Serif TC';font-weight:900">一二三四五六七八九萬東南西北中發</div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  for (const [id, s] of Object.entries(tiles)) {
    await render(s, path.join(OUT_TILES, `${id}.png`), FW * 3, FH * 3);
  }
  for (const [id, s] of Object.entries(ui)) {
    await render(s, path.join(OUT_UI, `${id}.png`), 144, 144);
  }

  const A = path.join(ROOT, 'assets');
  await render(appIcon(1024), path.join(A, 'icon.png'), 1024, 1024);
  await render(appIcon(1024, false), path.join(A, 'splash-icon.png'), 1024, 1024);
  await render(appIcon(1024, false), path.join(A, 'android-icon-foreground.png'), 1024, 1024);
  await render(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><rect width="1024" height="1024" fill="#145A57"/></svg>`,
    path.join(A, 'android-icon-background.png'), 1024, 1024,
  );
  await render(appIcon(1024, false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), path.join(A, 'android-icon-monochrome.png'), 1024, 1024);
  await render(appIcon(48), path.join(A, 'favicon.png'), 48, 48);

  // Önizleme sayfası (kontrol için)
  await browser.close();
  console.log(`Üretildi: ${Object.keys(tiles).length} taş, ${Object.keys(ui).length} simge, uygulama ikonları.`);
}

module.exports = { tiles, ui };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
