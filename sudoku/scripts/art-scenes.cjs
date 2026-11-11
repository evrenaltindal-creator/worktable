/*
 * Hareketli tema sahneleri, süzülen parçacıklar, cilalı taş gövdesi ve yıldızlar.
 * generate-art.cjs tarafından kullanılır. Hepsi bu projeye özgü SVG çizimleridir.
 */

// Sabit tohumlu basit rastgele (her üretimde aynı sahne)
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

const W = 900;
const H = 1600;
const scene = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`;

function skyGradient(id, stops) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;
}

function cloud(x, y, s, op = 0.75) {
  return `<g opacity="${op}" fill="#FFFFFF">
    <ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${26 * s}"/>
    <ellipse cx="${x - 45 * s}" cy="${y + 6 * s}" rx="${45 * s}" ry="${20 * s}"/>
    <ellipse cx="${x + 50 * s}" cy="${y + 4 * s}" rx="${50 * s}" ry="${22 * s}"/>
    <ellipse cx="${x + 10 * s}" cy="${y - 18 * s}" rx="${42 * s}" ry="${26 * s}"/>
  </g>`;
}

/** Yumuşak tepe dalgası */
function hill(y, amp, waves, color, seed) {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${y}`;
  const step = W / waves;
  for (let i = 0; i < waves; i++) {
    const x1 = i * step + step / 2;
    const x2 = (i + 1) * step;
    const yy = y + (r() - 0.5) * amp * 2;
    d += ` Q ${x1} ${yy - amp}, ${x2} ${y + (r() - 0.5) * amp}`;
  }
  d += ` L${W} ${H} Z`;
  return `<path d="${d}" fill="${color}"/>`;
}

// ------------------------------------------------------------------ 1) Lale bahçesi
function spring() {
  const r = rng(11);
  let tulips = '';
  const colors = ['#E53950', '#FF7AA2', '#FFC93C', '#F25C2A', '#C83E8C'];
  for (let row = 0; row < 5; row++) {
    const y = 1390 + row * 45;
    for (let i = 0; i < 16; i++) {
      const x = i * 58 + (row % 2) * 29 + r() * 14;
      const c = colors[Math.floor(r() * colors.length)];
      const s = 0.8 + row * 0.12;
      tulips += `<g transform="translate(${x} ${y}) scale(${s})">
        <path d="M0 0 L0 30" stroke="#2F7D3E" stroke-width="3"/>
        <path d="M0 22 C -10 14, -14 16, -15 20 C -8 22, -4 24, 0 26 Z" fill="#3E9B4F"/>
        <path d="M-9 -16 C -9 -2, -4 2, 0 2 C 4 2, 9 -2, 9 -16 L 4.5 -10 L 0 -18 L -4.5 -10 Z" fill="${c}"/>
      </g>`;
    }
  }
  return scene(`<defs>${skyGradient('s', [
    [0, '#2C8FC9'], [0.55, '#73C7D9'], [0.8, '#B9E6C9'],
  ])}
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF6C8"/><stop offset="0.35" stop-color="#FFE7A0" stop-opacity="0.8"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="720" cy="230" r="230" fill="url(#sun)"/>
    ${cloud(180, 260, 1.3)}${cloud(620, 420, 1)}${cloud(330, 640, 0.8, 0.55)}${cloud(760, 820, 1.1, 0.5)}
    ${hill(1180, 40, 4, '#8CCB7E', 3)}
    ${hill(1270, 35, 5, '#5BAE5E', 5)}
    ${hill(1360, 25, 3, '#3C8C46', 7)}
    ${tulips}`);
}

// ------------------------------------------------------------------ 2) Boğazda gün batımı
function mosque(x, base, s, color) {
  const w = 220 * s;
  const domeR = 70 * s;
  let g = `<rect x="${x - w / 2}" y="${base - 60 * s}" width="${w}" height="${60 * s}" fill="${color}"/>`;
  g += `<path d="M${x - domeR} ${base - 60 * s} A ${domeR} ${domeR * 0.9} 0 0 1 ${x + domeR} ${base - 60 * s} Z" fill="${color}"/>`;
  g += `<rect x="${x - 4 * s}" y="${base - 60 * s - domeR * 0.9 - 22 * s}" width="${8 * s}" height="${24 * s}" fill="${color}"/>`;
  for (const side of [-1, 1]) {
    const dx = x + side * w * 0.36;
    const r2 = 34 * s;
    g += `<path d="M${dx - r2} ${base - 60 * s} A ${r2} ${r2 * 0.9} 0 0 1 ${dx + r2} ${base - 60 * s} Z" fill="${color}"/>`;
  }
  for (const side of [-1, 1]) {
    const mx = x + side * (w / 2 + 18 * s);
    const mh = 260 * s;
    g += `<rect x="${mx - 6 * s}" y="${base - mh}" width="${12 * s}" height="${mh}" fill="${color}"/>`;
    g += `<rect x="${mx - 10 * s}" y="${base - mh * 0.72}" width="${20 * s}" height="${6 * s}" fill="${color}"/>`;
    g += `<rect x="${mx - 10 * s}" y="${base - mh * 0.45}" width="${20 * s}" height="${6 * s}" fill="${color}"/>`;
    g += `<path d="M${mx - 7 * s} ${base - mh} L${mx} ${base - mh - 44 * s} L${mx + 7 * s} ${base - mh} Z" fill="${color}"/>`;
  }
  return g;
}

function houses(x0, x1, base, color, seed) {
  const r = rng(seed);
  let g = '';
  for (let x = x0; x < x1; ) {
    const w = 30 + r() * 40;
    const h = 30 + r() * 60;
    g += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${color}"/>`;
    x += w - 2;
  }
  return g;
}

function sunset() {
  const r = rng(21);
  let refl = '';
  for (let i = 0; i < 22; i++) {
    const y = 1330 + i * 12;
    const w = 220 - i * 7 + r() * 40;
    refl += `<rect x="${450 - w / 2 + (r() - 0.5) * 40}" y="${y}" width="${w}" height="4" rx="2" fill="#FFC27A" opacity="${0.75 - i * 0.03}"/>`;
  }
  return scene(`<defs>${skyGradient('s', [
    [0, '#24164F'], [0.35, '#6E2A72'], [0.62, '#D9506A'], [0.78, '#FF9A5C'], [0.83, '#FFC07A'],
  ])}${skyGradient('w', [[0, '#5A2453'], [1, '#1B0B26']])}
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE3A0"/><stop offset="0.4" stop-color="#FFB86B" stop-opacity="0.6"/><stop offset="1" stop-color="#FF8A5C" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    ${[...Array(40)].map(() => `<circle cx="${r() * W}" cy="${r() * 520}" r="${0.8 + r() * 1.6}" fill="#FFFFFF" opacity="${0.3 + r() * 0.5}"/>`).join('')}
    <circle cx="450" cy="1230" r="360" fill="url(#glow)"/>
    <circle cx="450" cy="1250" r="110" fill="#FFD98A"/>
    ${houses(0, 900, 1310, '#4A1E52', 4)}
    ${mosque(250, 1300, 0.8, '#4A1E52')}
    ${mosque(700, 1305, 1.05, '#33123F')}
    ${houses(380, 560, 1312, '#33123F', 9)}
    <rect x="0" y="1300" width="${W}" height="${H - 1300}" fill="url(#w)"/>
    ${refl}`);
}

// ------------------------------------------------------------------ 3) Kapadokya şafağı
function chimney(x, base, w, h, body, cap, seed) {
  const r = rng(seed);
  let g = `<path d="M${x - w / 2} ${base} C ${x - w / 2} ${base - h * 0.6}, ${x - w * 0.22} ${base - h * 0.95}, ${x} ${base - h}
           C ${x + w * 0.22} ${base - h * 0.95}, ${x + w / 2} ${base - h * 0.6}, ${x + w / 2} ${base} Z" fill="${body}"/>`;
  g += `<ellipse cx="${x}" cy="${base - h - 6}" rx="${w * 0.3}" ry="${w * 0.14}" fill="${cap}"/>`;
  for (let i = 0; i < 3; i++) {
    const wy = base - h * (0.25 + r() * 0.45);
    const wx = x + (r() - 0.5) * w * 0.4;
    g += `<path d="M${wx - 6} ${wy} L${wx - 6} ${wy - 10} A 6 6 0 0 1 ${wx + 6} ${wy - 10} L${wx + 6} ${wy} Z" fill="#5A2E25" opacity="0.8"/>`;
  }
  return g;
}

function dawn() {
  const r = rng(31);
  let far = '', mid = '', near = '';
  for (let i = 0; i < 9; i++) far += chimney(40 + i * 105 + r() * 30, 1260, 90 + r() * 30, 180 + r() * 80, '#C98D7C', '#A9705F', 100 + i);
  for (let i = 0; i < 7; i++) mid += chimney(i * 145 + r() * 40, 1360, 120 + r() * 30, 230 + r() * 90, '#B9664D', '#7E3D2E', 200 + i);
  for (let i = 0; i < 5; i++) near += chimney(60 + i * 200 + r() * 40, 1480, 160 + r() * 30, 280 + r() * 80, '#94493A', '#5E2A21', 300 + i);
  return scene(`<defs>${skyGradient('s', [
    [0, '#34477F'], [0.4, '#8A74B8'], [0.66, '#E9A6A1'], [0.8, '#FBD3B0'],
  ])}</defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    ${cloud(160, 420, 1, 0.35)}${cloud(700, 300, 1.4, 0.3)}${cloud(520, 700, 0.9, 0.25)}
    <circle cx="640" cy="1150" r="70" fill="#FFE4B8" opacity="0.9"/>
    ${hill(1220, 30, 3, '#D9A08E', 13)}
    ${far}
    ${hill(1300, 25, 4, '#C27B63', 17)}
    ${mid}
    ${hill(1420, 20, 3, '#9E5442', 19)}
    ${near}
    <rect x="0" y="1470" width="${W}" height="${H - 1470}" fill="#7A3A2E"/>`);
}

// ------------------------------------------------------------------ 4) Ege kıyısı (yel değirmenleri, beyaz evler)
function windmill(x, base, s) {
  return `<g>
    <path d="M${x - 22 * s} ${base} L${x - 16 * s} ${base - 90 * s} L${x + 16 * s} ${base - 90 * s} L${x + 22 * s} ${base} Z" fill="#FFFFFF"/>
    <path d="M${x - 18 * s} ${base - 90 * s} Q ${x} ${base - 118 * s}, ${x + 18 * s} ${base - 90 * s} Z" fill="#8D5A3B"/>
    <rect x="${x - 6 * s}" y="${base - 30 * s}" width="${12 * s}" height="${30 * s}" fill="#4F7FA8"/>
    ${[20, 110, 200, 290].map((a) => `<rect x="${x - 3 * s}" y="${base - 150 * s}" width="${6 * s}" height="${50 * s}" fill="#EDE3D1" transform="rotate(${a} ${x} ${base - 100 * s})"/>`).join('')}
    <circle cx="${x}" cy="${base - 100 * s}" r="${5 * s}" fill="#8D5A3B"/>
  </g>`;
}

function sea() {
  const r = rng(41);
  let town = '';
  for (let i = 0; i < 26; i++) {
    const x = 30 + r() * 420;
    const y = 1160 + (x / 450) * 120 + r() * 120;
    const w = 34 + r() * 30;
    const h = 26 + r() * 22;
    town += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFFFF"/>
      <rect x="${x + w * 0.2}" y="${y + h * 0.3}" width="${w * 0.18}" height="${h * 0.32}" fill="#3C78B4"/>
      <rect x="${x + w * 0.6}" y="${y + h * 0.3}" width="${w * 0.18}" height="${h * 0.32}" fill="#3C78B4"/>
      ${r() > 0.6 ? `<circle cx="${x + w + 6}" cy="${y + h - 4}" r="9" fill="#D9418C" opacity="0.9"/>` : ''}`;
  }
  let sparkle = '';
  for (let i = 0; i < 40; i++) {
    sparkle += `<rect x="${r() * W}" y="${1260 + r() * 330}" width="${10 + r() * 30}" height="3" rx="1.5" fill="#FFFFFF" opacity="${0.2 + r() * 0.4}"/>`;
  }
  return scene(`<defs>${skyGradient('s', [[0, '#1976D2'], [0.5, '#4FB3EE'], [0.72, '#A8DDF7']])}
    ${skyGradient('w', [[0, '#1C9CD8'], [0.4, '#0B6FAE'], [1, '#063F6E']])}</defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="160" cy="220" r="80" fill="#FFF3C4" opacity="0.9"/>
    <circle cx="160" cy="220" r="140" fill="#FFF3C4" opacity="0.25"/>
    ${cloud(620, 300, 1.2, 0.8)}${cloud(300, 560, 0.9, 0.6)}${cloud(760, 760, 1, 0.5)}
    <rect x="0" y="1230" width="${W}" height="${H - 1230}" fill="url(#w)"/>
    ${sparkle}
    <path d="M0 1120 C 120 1080, 260 1110, 360 1170 C 430 1210, 480 1270, 520 1330 L520 ${H} L0 ${H} Z" fill="#C9B48A"/>
    <path d="M0 1150 C 120 1110, 250 1140, 340 1195 C 400 1235, 450 1290, 480 1340 L480 ${H} L0 ${H} Z" fill="#B59A6B"/>
    ${windmill(110, 1130, 1)}${windmill(230, 1135, 0.85)}${windmill(330, 1172, 0.7)}
    ${town}
    <path d="M0 1330 C 160 1310, 320 1340, 480 1340 L480 ${H} L0 ${H} Z" fill="#9C7F52" opacity="0.6"/>`);
}

// ------------------------------------------------------------------ parçacıklar
const sp = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

function balloon(c1, c2) {
  return sp(80, 110, `
    <path d="M40 4 C 12 4, 4 28, 4 42 C 4 62, 24 76, 32 86 L48 86 C 56 76, 76 62, 76 42 C 76 28, 68 4, 40 4 Z" fill="${c1}"/>
    <path d="M40 4 C 30 4, 24 28, 24 42 C 24 62, 32 76, 36 86 L44 86 C 48 76, 56 62, 56 42 C 56 28, 50 4, 40 4 Z" fill="${c2}"/>
    <path d="M40 4 C 37 4, 35 28, 35 42 C 35 62, 38 76, 39 86 L41 86 C 42 76, 45 62, 45 42 C 45 28, 43 4, 40 4 Z" fill="${c1}"/>
    <ellipse cx="22" cy="28" rx="6" ry="12" fill="#FFFFFF" opacity="0.35"/>
    <path d="M33 86 L35 96 M47 86 L45 96" stroke="#5A3A22" stroke-width="1.5"/>
    <rect x="33" y="96" width="14" height="11" rx="2" fill="#8D5A3B"/>`);
}

const sprites = {
  petal: sp(48, 48, `<defs><radialGradient id="p" cx="0.35" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFE4EE"/><stop offset="1" stop-color="#F27BA6"/></radialGradient></defs>
    <path d="M24 4 C 38 10, 44 26, 24 44 C 4 26, 10 10, 24 4 Z" fill="url(#p)"/>`),
  sparkle: sp(64, 64, `<defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.4" stop-color="#FFF4B0" stop-opacity="0.7"/><stop offset="1" stop-color="#FFF4B0" stop-opacity="0"/></radialGradient></defs>
    <circle cx="32" cy="32" r="30" fill="url(#g)"/>
    <path d="M32 4 L36 28 L60 32 L36 36 L32 60 L28 36 L4 32 L28 28 Z" fill="#FFFFFF"/>`),
  glow: sp(64, 64, `<defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF1B8"/><stop offset="0.3" stop-color="#FFC36B" stop-opacity="0.9"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient></defs>
    <circle cx="32" cy="32" r="32" fill="url(#g)"/>`),
  gull: sp(96, 48, `<path d="M4 18 C 20 8, 36 10, 48 26 C 60 10, 76 8, 92 18 C 76 16, 62 22, 48 34 C 34 22, 20 16, 4 18 Z" fill="#FFFFFF"/>
    <path d="M4 18 C 10 14, 14 13, 18 13 C 14 15, 10 16, 4 18 Z M92 18 C 86 14, 82 13, 78 13 C 82 15, 86 16, 92 18 Z" fill="#3A3A4A"/>`),
  boat: sp(100, 100, `<path d="M50 8 L50 70 L14 70 Z" fill="#FFFFFF"/>
    <path d="M54 18 L54 70 L84 70 Z" fill="#F5F0E6"/>
    <rect x="49" y="6" width="3" height="68" fill="#6B4A2E"/>
    <path d="M10 74 L90 74 L80 90 L20 90 Z" fill="#B23A3A"/>
    <rect x="16" y="74" width="70" height="4" fill="#FFFFFF" opacity="0.6"/>`),
  'balloon-red': balloon('#E53950', '#FFD23F'),
  'balloon-blue': balloon('#2F6FD6', '#FFFFFF'),
  'balloon-green': balloon('#2FA866', '#F7C531'),
  'star-gold': sp(128, 128, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE680"/><stop offset="1" stop-color="#F2A516"/></linearGradient></defs>
    <path d="M64 6 L80 44 L122 47 L90 74 L100 116 L64 94 L28 116 L38 74 L6 47 L48 44 Z" fill="url(#g)" stroke="#C47A0A" stroke-width="5" stroke-linejoin="round"/>
    <path d="M64 22 L74 46 L58 46 Z" fill="#FFFFFF" opacity="0.55"/>`),
  'star-empty': sp(128, 128, `<path d="M64 6 L80 44 L122 47 L90 74 L100 116 L64 94 L28 116 L38 74 L6 47 L48 44 Z" fill="#000000" fill-opacity="0.25" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="5" stroke-linejoin="round"/>`),
};

// ------------------------------------------------------------------ cilalı taş gövdesi
// Yüz 88 x 116, kalınlık 0.14 * 88 = 12.32 (uygulamadaki oranlarla birebir aynı)
function tileBody() {
  const d = 12.32;
  const w = 88 + d;
  const h = 116 + d;
  const r = 10.56;
  return sp(w, h, `<defs>
      <linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0C878"/><stop offset="1" stop-color="#A86F2C"/></linearGradient>
      <linearGradient id="face" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#FFF9EC"/><stop offset="1" stop-color="#F2E4C2"/></linearGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="${d * 0.25}" y="${d * 0.25}" width="${88 + d * 0.75}" height="${116 + d * 0.75}" rx="${r}" fill="url(#side)"/>
    <rect x="${d * 0.55}" y="${d * 0.55}" width="${88 + d * 0.45}" height="${116 + d * 0.45}" rx="${r}" fill="#8E5A22" opacity="0.55"/>
    <rect x="0" y="0" width="88" height="116" rx="${r}" fill="url(#face)"/>
    <rect x="3" y="3" width="82" height="34" rx="${r - 2}" fill="url(#gloss)" opacity="0.7"/>
    <rect x="0.75" y="0.75" width="86.5" height="114.5" rx="${r - 0.5}" fill="none" stroke="#D6B47A" stroke-width="1.5"/>`);
}

// ------------------------------------------------------------------ kapalı taş (arka yüz)
function tileBack() {
  const d = 12.32;
  const w = 88 + d;
  const h = 116 + d;
  const r = 10.56;
  const petal = (a) => `<ellipse cx="44" cy="40" rx="7" ry="15" fill="#E8D7A8" opacity="0.9" transform="rotate(${a} 44 58)"/>`;
  return sp(w, h, `<defs>
      <linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0C878"/><stop offset="1" stop-color="#A86F2C"/></linearGradient>
      <linearGradient id="back" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#2FA38F"/><stop offset="1" stop-color="#14695D"/></linearGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.6"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="${d * 0.25}" y="${d * 0.25}" width="${88 + d * 0.75}" height="${116 + d * 0.75}" rx="${r}" fill="url(#side)"/>
    <rect x="${d * 0.55}" y="${d * 0.55}" width="${88 + d * 0.45}" height="${116 + d * 0.45}" rx="${r}" fill="#8E5A22" opacity="0.55"/>
    <rect x="0" y="0" width="88" height="116" rx="${r}" fill="url(#back)"/>
    <rect x="7" y="7" width="74" height="102" rx="7" fill="none" stroke="#E8D7A8" stroke-width="2.5" opacity="0.85"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(petal).join('')}
    <circle cx="44" cy="58" r="8" fill="#F2B84B"/>
    <rect x="3" y="3" width="82" height="30" rx="${r - 2}" fill="url(#gloss)" opacity="0.6"/>`);
}

module.exports = {
  tileBack: tileBack(),
  scenes: { spring: spring(), sunset: sunset(), dawn: dawn(), sea: sea() },
  sprites,
  tileBody: tileBody(),
  SCENE_W: W,
  SCENE_H: H,
};
