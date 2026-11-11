/* Huzur Jigsaw çizimleri: 12 özgün manzara resmi (yapboz resimleri), uygulama ikonu.  node scripts/generate-art.cjs */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const S = 1024;
const svg = (inner, w = S, h = S) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

// Küçük yardımcılar
let gid = 0;
const lin = (stops, x2 = 0, y2 = 1) => {
  const id = `g${gid++}`;
  return { id, def: `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`, url: `url(#${id})` };
};
const rad = (stops, cx = 0.5, cy = 0.5, r = 0.5) => {
  const id = `g${gid++}`;
  return { id, def: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`, url: `url(#${id})` };
};
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hills = (y, amp, color, seed, n = 6) => {
  const r = rng(seed);
  let d = `M0 ${S} L0 ${y}`;
  for (let i = 1; i <= n; i++) {
    const x = (S / n) * i;
    d += ` Q ${x - S / n / 2} ${y - amp * (0.4 + r())} ${x} ${y + amp * (r() - 0.5) * 0.6}`;
  }
  return `<path d="${d} L${S} ${S} Z" fill="${color}"/>`;
};
const cloud = (x, y, s, o = 0.9) => `<g fill="#FFFFFF" opacity="${o}"><ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${32 * s}"/><ellipse cx="${x - 50 * s}" cy="${y + 10 * s}" rx="${45 * s}" ry="${24 * s}"/><ellipse cx="${x + 55 * s}" cy="${y + 8 * s}" rx="${50 * s}" ry="${26 * s}"/><ellipse cx="${x + 10 * s}" cy="${y - 22 * s}" rx="${42 * s}" ry="${30 * s}"/></g>`;
const flowerDots = (y0, y1, colors, count, seed, rmax = 9) => {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const y = y0 + (y1 - y0) * r();
    const s = 0.4 + ((y - y0) / (y1 - y0)) * 0.9;
    out += `<circle cx="${(r() * S).toFixed(0)}" cy="${y.toFixed(0)}" r="${(rmax * s).toFixed(1)}" fill="${colors[Math.floor(r() * colors.length)]}"/>`;
  }
  return out;
};
const pine = (x, y, h, c = '#1F5E45', snow = false) =>
  `<path d="M${x} ${y - h} L${x + h * 0.32} ${y - h * 0.45} L${x + h * 0.18} ${y - h * 0.45} L${x + h * 0.4} ${y} L${x - h * 0.4} ${y} L${x - h * 0.18} ${y - h * 0.45} L${x - h * 0.32} ${y - h * 0.45} Z" fill="${c}"/>` +
  (snow ? `<path d="M${x} ${y - h} L${x + h * 0.14} ${y - h * 0.74} L${x - h * 0.14} ${y - h * 0.74} Z" fill="#FFFFFF"/><path d="M${x - h * 0.3} ${y - h * 0.47} L${x + h * 0.3} ${y - h * 0.47} L${x + h * 0.2} ${y - h * 0.4} L${x - h * 0.2} ${y - h * 0.4} Z" fill="#FFFFFF" opacity="0.9"/>` : '') +
  `<rect x="${x - h * 0.04}" y="${y}" width="${h * 0.08}" height="${h * 0.08}" fill="#5A3A22"/>`;
const house = (x, y, w, wall, roof, door = '#7A4A2A') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${w * 0.7}" fill="${wall}"/>` +
  `<path d="M${x - w * 0.1} ${y} L${x + w / 2} ${y - w * 0.45} L${x + w * 1.1} ${y} Z" fill="${roof}"/>` +
  `<rect x="${x + w * 0.4}" y="${y + w * 0.32}" width="${w * 0.2}" height="${w * 0.38}" fill="${door}"/>` +
  `<rect x="${x + w * 0.1}" y="${y + w * 0.15}" width="${w * 0.18}" height="${w * 0.16}" fill="#BFE3FF" stroke="#FFFFFF" stroke-width="2"/>` +
  `<rect x="${x + w * 0.72}" y="${y + w * 0.15}" width="${w * 0.18}" height="${w * 0.16}" fill="#BFE3FF" stroke="#FFFFFF" stroke-width="2"/>`;

const scenes = [];

// 1) Deniz kenarında yel değirmenleri
{
  const sky = lin([[0, '#6EC6F5'], [1, '#D8F1FF']]);
  const sea = lin([[0, '#2E8FD0'], [1, '#1B5E99']]);
  const mill = (x, y, s, rot) =>
    `<path d="M${x - 40 * s} ${y + 160 * s} L${x - 28 * s} ${y} L${x + 28 * s} ${y} L${x + 40 * s} ${y + 160 * s} Z" fill="#FFFFFF"/>` +
    `<path d="M${x - 34 * s} ${y + 4 * s} Q ${x} ${y - 46 * s} ${x + 34 * s} ${y + 4 * s} Z" fill="#B5543A"/>` +
    `<rect x="${x - 10 * s}" y="${y + 110 * s}" width="${20 * s}" height="${50 * s}" fill="#6B4A2E"/>` +
    `<g transform="rotate(${rot} ${x} ${y - 6 * s})">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} ${x} ${y - 6 * s})"><rect x="${x - 3 * s}" y="${y - 120 * s}" width="${6 * s}" height="${114 * s}" fill="#5A4030"/><rect x="${x + 3 * s}" y="${y - 116 * s}" width="${26 * s}" height="${90 * s}" fill="#F3E9D2" stroke="#5A4030" stroke-width="${2 * s}"/></g>`).join('')}</g>` +
    `<circle cx="${x}" cy="${y - 6 * s}" r="${8 * s}" fill="#3A2A1E"/>`;
  scenes.push(svg(`<defs>${sky.def}${sea.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    <circle cx="820" cy="170" r="70" fill="#FFF3B0"/>${cloud(250, 170, 1.2)}${cloud(620, 110, 0.8)}
    <rect y="560" width="${S}" height="${S - 560}" fill="${sea.url}"/>
    ${[600, 650, 700, 760].map((y, i) => `<path d="M0 ${y} Q 256 ${y - 10} 512 ${y} T ${S} ${y}" stroke="#FFFFFF" stroke-opacity="${0.25 - i * 0.04}" stroke-width="4" fill="none"/>`).join('')}
    <path d="M0 ${S} L0 640 Q 200 520 420 600 Q 560 650 640 760 L640 ${S} Z" fill="#C9B27C"/>
    <path d="M0 ${S} L0 700 Q 200 610 400 680 Q 520 720 560 ${S} Z" fill="#8DBE5A"/>
    ${mill(160, 470, 1.25, 15)}${mill(380, 530, 0.95, 40)}${mill(560, 610, 0.7, 5)}
    <g transform="translate(800 640)"><path d="M-70 0 L70 0 L50 30 L-50 30 Z" fill="#FFFFFF"/><path d="M0 0 L0 -140 L80 -10 Z" fill="#FFFFFF"/><path d="M-6 -10 L-6 -120 L-70 -10 Z" fill="#E8505B"/></g>
    ${flowerDots(760, 1000, ['#FFFFFF', '#FFD34E', '#E8505B'], 70, 3)}`));
}
// 2) Günbatımında kubbeler ve deniz
{
  const sky = lin([[0, '#2B1F5C'], [0.45, '#C8507E'], [0.75, '#F79A4A'], [1, '#FFD27A']]);
  const water = lin([[0, '#F2A65A'], [1, '#3B2A6B']]);
  const dome = (x, y, r, c) => `<path d="M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y} Z" fill="${c}"/><rect x="${x - 3}" y="${y - r - 30}" width="6" height="30" fill="${c}"/><circle cx="${x}" cy="${y - r - 34}" r="6" fill="${c}"/>`;
  const minaret = (x, y, h, c) => `<rect x="${x - 9}" y="${y - h}" width="18" height="${h}" fill="${c}"/><path d="M${x - 9} ${y - h} L${x} ${y - h - 70} L${x + 9} ${y - h} Z" fill="${c}"/><rect x="${x - 15}" y="${y - h * 0.7}" width="30" height="8" fill="${c}"/>`;
  const c = '#2A1838';
  scenes.push(svg(`<defs>${sky.def}${water.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    <circle cx="512" cy="590" r="120" fill="#FFE29A"/>
    ${cloud(220, 260, 1, 0.25)}${cloud(780, 210, 1.3, 0.2)}
    <path d="M0 640 L1024 640 L1024 1024 L0 1024 Z" fill="${water.url}"/>
    ${[660, 700, 750, 810, 880].map((y, i) => `<rect x="${380 - i * 30}" y="${y}" width="${264 + i * 60}" height="6" rx="3" fill="#FFE29A" opacity="${0.7 - i * 0.12}"/>`).join('')}
    <path d="M0 640 L0 560 L140 560 L140 600 L300 600 L300 640 Z" fill="${c}"/>
    ${minaret(330, 640, 260, c)}${minaret(694, 640, 260, c)}
    <rect x="360" y="520" width="304" height="120" fill="${c}"/>
    ${dome(512, 520, 120, c)}${dome(400, 540, 46, c)}${dome(624, 540, 46, c)}
    <path d="M760 640 L760 590 L1024 590 L1024 640 Z" fill="${c}"/>${dome(880, 590, 50, c)}
    ${[0, 1, 2].map((i) => `<path d="M${120 + i * 70} ${300 + i * 25} q 14 -12 28 0 q 14 -12 28 0" stroke="#2A1838" stroke-width="5" fill="none"/>`).join('')}`));
}
// 3) Lale tarlası ve çiftlik evi
{
  const sky = lin([[0, '#8FD3FF'], [1, '#E8F7FF']]);
  let rows = '';
  const cols = ['#E8505B', '#FFD34E', '#FF8AB3', '#9A5BD8', '#FF8A3D'];
  for (let i = 0; i < 9; i++) {
    const y0 = 560 + i * 52;
    const h = 24 + i * 8;
    rows += `<path d="M${-200 + i * 40} ${y0 + h} L512 ${y0 - 10} L${1224 - i * 40} ${y0 + h} Z" fill="${cols[i % 5]}"/>`;
    rows += `<path d="M${-200 + i * 40} ${y0 + h + 8} L512 ${y0} L${1224 - i * 40} ${y0 + h + 8} Z" fill="#4E9A3A" opacity="0.6"/>`;
  }
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>${cloud(200, 150, 1)}${cloud(760, 220, 1.2)}
    ${hills(520, 60, '#7CB85A', 5)}<rect y="540" width="${S}" height="${S}" fill="#5DA046"/>
    ${house(600, 430, 150, '#FFF4E0', '#B5543A')}
    <g transform="translate(320 470)"><rect x="-6" y="0" width="12" height="80" fill="#6B4A2E"/><circle cx="0" cy="-10" r="56" fill="#3F8A3A"/><circle cx="-30" cy="10" r="40" fill="#4E9A3A"/></g>
    ${rows}`));
}
// 4) Vadide balonlar
{
  const sky = lin([[0, '#FFC48A'], [0.6, '#FFE5C2'], [1, '#FFF4E0']]);
  const balloon = (x, y, s, a, b) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -90 C 60 -90 70 -20 30 30 L-30 30 C -70 -20 -60 -90 0 -90 Z" fill="${a}"/>` +
    `<path d="M0 -90 C 22 -90 26 -20 12 30 L-12 30 C -26 -20 -22 -90 0 -90 Z" fill="${b}"/>` +
    `<path d="M-30 30 L-12 60 M30 30 L12 60" stroke="#5A3A22" stroke-width="3"/><rect x="-14" y="60" width="28" height="22" rx="4" fill="#8A5A30"/></g>`;
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    <circle cx="180" cy="200" r="60" fill="#FFF3B0" opacity="0.9"/>
    ${hills(620, 120, '#E2B07A', 11, 5)}${hills(700, 130, '#C98E5A', 12, 4)}
    <path d="M150 1024 L170 640 Q 200 600 230 640 L250 1024 Z" fill="#B87A48"/><path d="M700 1024 L730 620 Q 770 570 810 620 L840 1024 Z" fill="#B87A48"/>
    ${hills(820, 90, '#A9703F', 13, 6)}
    ${balloon(330, 300, 1.6, '#E8505B', '#FFD34E')}${balloon(640, 220, 1.2, '#3C8CE7', '#FFFFFF')}${balloon(820, 420, 0.9, '#3FBF7F', '#FF8A3D')}${balloon(500, 480, 0.7, '#9A5BD8', '#FFD34E')}${balloon(140, 520, 0.55, '#FF8AB3', '#FFFFFF')}`));
}
// 5) Kayalıkta deniz feneri (akşam)
{
  const sky = lin([[0, '#1E2F5C'], [0.6, '#5A6FB0'], [1, '#F2B880']]);
  const sea = lin([[0, '#2A4C7A'], [1, '#14284A']]);
  scenes.push(svg(`<defs>${sky.def}${sea.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    ${flowerDots(40, 380, ['#FFFFFF'], 50, 7, 3)}
    <path d="M640 330 L1024 200 L1024 300 Z" fill="#FFF3B0" opacity="0.35"/><path d="M600 330 L0 210 L0 300 Z" fill="#FFF3B0" opacity="0.25"/>
    <rect y="640" width="${S}" height="${S}" fill="${sea.url}"/>
    ${[680, 740, 820].map((y, i) => `<path d="M0 ${y} Q 256 ${y - 14} 512 ${y} T ${S} ${y}" stroke="#FFFFFF" stroke-opacity="${0.22 - i * 0.05}" stroke-width="4" fill="none"/>`).join('')}
    <path d="M380 1024 L420 700 Q 520 610 700 660 Q 820 700 860 1024 Z" fill="#4A3F3A"/><path d="M450 1024 L470 760 Q 560 700 680 740 L720 1024 Z" fill="#5E524B"/>
    <path d="M560 660 L580 360 L650 360 L670 660 Z" fill="#FFFFFF"/>
    ${[420, 500, 580].map((y) => `<path d="M${578 - (y - 360) * 0.066} ${y} L${652 + (y - 360) * 0.066} ${y} L${654 + (y - 360) * 0.068} ${y + 40} L${576 - (y - 360) * 0.068} ${y + 40} Z" fill="#E8505B"/>`).join('')}
    <rect x="570" y="300" width="90" height="60" fill="#FFE29A"/><path d="M560 300 L615 250 L670 300 Z" fill="#E8505B"/><rect x="560" y="356" width="110" height="10" fill="#333"/>
    <circle cx="615" cy="330" r="20" fill="#FFFFFF"/>`));
}
// 6) Dağ gölünde kayık
{
  const sky = lin([[0, '#9AD3FF'], [1, '#F0FAFF']]);
  const lake = lin([[0, '#5DB2D6'], [1, '#2C7DA0']]);
  const mountain = (pts, c, snow) => `<path d="M${pts} Z" fill="${c}"/>` + (snow || '');
  scenes.push(svg(`<defs>${sky.def}${lake.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>${cloud(300, 140, 0.9)}${cloud(800, 200, 0.7)}
    ${mountain('0 600 L 260 260 L 520 600', '#7A8CA8', '<path d="M260 260 L320 340 L290 330 L260 360 L230 330 L200 340 Z" fill="#FFFFFF"/>')}
    ${mountain('300 600 L 640 180 L 980 600', '#5E6F8C', '<path d="M640 180 L720 280 L680 268 L640 300 L600 268 L560 280 Z" fill="#FFFFFF"/>')}
    ${mountain('700 600 L 900 330 L 1100 600', '#8899B5', '')}
    ${[80, 160, 860, 940].map((x, i) => pine(x, 620, 150 + (i % 2) * 40)).join('')}
    <rect y="600" width="${S}" height="${S}" fill="${lake.url}"/>
    <g opacity="0.35" transform="translate(0 1200) scale(1 -1)"><path d="M300 600 L 640 180 L 980 600 Z" fill="#5E6F8C"/></g>
    <g transform="translate(470 760)"><path d="M-120 0 L120 0 Q 100 40 0 44 Q -100 40 -120 0 Z" fill="#B5543A"/><rect x="-4" y="-130" width="8" height="130" fill="#5A3A22"/><path d="M4 -126 L90 -10 L4 -10 Z" fill="#FFFFFF"/></g>
    <path d="M0 1024 L0 880 Q 180 840 300 900 Q 360 930 380 1024 Z" fill="#4E9A3A"/>${flowerDots(900, 1010, ['#FFD34E', '#FFFFFF'], 25, 9)}`));
}
// 7) Çiçekli ağaç ve köprü
{
  const sky = lin([[0, '#FFE3EE'], [1, '#FFF7F0']]);
  let blossoms = '';
  const r = rng(21);
  for (let i = 0; i < 160; i++) blossoms += `<circle cx="${(180 + r() * 520).toFixed(0)}" cy="${(140 + r() * 300).toFixed(0)}" r="${(16 + r() * 22).toFixed(0)}" fill="${['#FFB3CF', '#FF8AB3', '#FFD1E1', '#FFFFFF'][Math.floor(r() * 4)]}" opacity="0.92"/>`;
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    ${hills(560, 80, '#B8DDB0', 31)}<rect y="640" width="${S}" height="${S}" fill="#7EC3D8"/>
    <path d="M0 640 L0 600 Q 300 580 440 640 Z" fill="#8DBE5A"/><path d="M1024 640 L1024 600 Q 760 580 620 640 Z" fill="#8DBE5A"/>
    <path d="M300 700 Q 512 520 724 700" stroke="#C8402E" stroke-width="34" fill="none"/>
    ${[360, 420, 480, 544, 604, 664].map((x) => `<rect x="${x}" y="${640 - Math.sin(((x - 300) / 424) * Math.PI) * 120}" width="10" height="70" fill="#A8301F"/>`).join('')}
    <path d="M300 680 Q 512 500 724 680" stroke="#E8505B" stroke-width="8" fill="none"/>
    <path d="M430 640 Q 400 420 330 300 M440 560 Q 520 420 620 330" stroke="#5A3A2A" stroke-width="30" fill="none" stroke-linecap="round"/>
    <rect x="410" y="560" width="50" height="120" fill="#5A3A2A"/>
    ${blossoms}${flowerDots(700, 1000, ['#FFFFFF', '#FFB3CF'], 30, 23, 6)}`));
}
// 8) Yamaçta köy evleri
{
  const sky = lin([[0, '#7FC8F8'], [1, '#E6F6FF']]);
  const walls = ['#FFF4E0', '#FFE0B5', '#FFFFFF', '#F7D6C0'];
  const roofs = ['#C8402E', '#B5543A', '#D9663F'];
  let houses = '';
  const r = rng(41);
  for (let row = 0; row < 4; row++)
    for (let i = 0; i < 6; i++) {
      const w = 110 + r() * 40;
      const x = i * 180 - 40 + (row % 2) * 80 + r() * 30;
      const y = 380 + row * 150;
      houses += house(x, y, w, walls[Math.floor(r() * 4)], roofs[Math.floor(r() * 3)], '#6B4A2E');
    }
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>${cloud(800, 120, 1)}
    ${hills(340, 60, '#8DBE5A', 41)}${houses}
    ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${120 + i * 200}" cy="${560 + (i % 2) * 150}" r="36" fill="#3F8A3A"/>`).join('')}
    ${flowerDots(950, 1024, ['#E8505B', '#FFD34E'], 30, 43)}`));
}
// 9) Ay ışığında orman gölü
{
  const sky = lin([[0, '#0E1638'], [1, '#2B3D7A']]);
  const moon = rad([[0, '#FFF7D6'], [0.6, '#FFF0B0'], [1, '#FFF0B0', 0]]);
  scenes.push(svg(`<defs>${sky.def}${moon.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    ${flowerDots(30, 520, ['#FFFFFF', '#FFF3B0'], 120, 51, 3.5)}
    <circle cx="700" cy="230" r="150" fill="${moon.url}"/><circle cx="700" cy="230" r="80" fill="#FFF7D6"/>
    <rect y="620" width="${S}" height="${S}" fill="#13224D"/>
    ${[650, 690, 740, 800].map((y, i) => `<rect x="${650 - i * 25}" y="${y}" width="${100 + i * 50}" height="5" rx="2" fill="#FFF7D6" opacity="${0.6 - i * 0.12}"/>`).join('')}
    ${[40, 130, 220, 300, 380, 860, 940, 1000].map((x, i) => pine(x, 640, 180 + (i % 3) * 50, '#0B2A26')).join('')}
    ${[70, 170, 270, 900, 980].map((x, i) => pine(x, 700, 120 + (i % 2) * 30, '#123B33')).join('')}
    <g fill="#FFE97A">${[[300, 760], [420, 820], [560, 740], [760, 880], [200, 900]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y}" r="14" opacity="0.25"/>`).join('')}</g>`));
}
// 10) Ayçiçeği tarlası
{
  const sky = lin([[0, '#5DB8F0'], [1, '#C8ECFF']]);
  const flower = (x, y, s) => {
    let p = '';
    for (let a = 0; a < 360; a += 30) p += `<ellipse cx="${x}" cy="${y - 34 * s}" rx="${12 * s}" ry="${26 * s}" fill="#FFC21F" transform="rotate(${a} ${x} ${y})"/>`;
    return `<rect x="${x - 3 * s}" y="${y}" width="${6 * s}" height="${200 * s}" fill="#3F7A2A"/><ellipse cx="${x + 20 * s}" cy="${y + 80 * s}" rx="${26 * s}" ry="${10 * s}" fill="#4E9A3A" transform="rotate(-25 ${x + 20 * s} ${y + 80 * s})"/>${p}<circle cx="${x}" cy="${y}" r="${24 * s}" fill="#6B3E1E"/><circle cx="${x}" cy="${y}" r="${14 * s}" fill="#4A2A12"/>`;
  };
  let field = '';
  const r = rng(61);
  for (let i = 0; i < 46; i++) {
    const y = 560 + Math.pow(r(), 0.8) * 420;
    const s = 0.35 + ((y - 560) / 420) * 1.3;
    field += flower(r() * S, y, s);
  }
  const sorted = field;
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>${cloud(240, 180, 1.1)}${cloud(760, 130, 0.9)}
    ${hills(540, 50, '#6FAE4A', 61)}<rect y="580" width="${S}" height="${S}" fill="#4E9A3A"/>${sorted}`));
}
// 11) Plaj, şemsiyeler ve yelkenli
{
  const sky = lin([[0, '#4FB3F0'], [1, '#BDE8FF']]);
  const sea = lin([[0, '#1FA2C8'], [1, '#5ED0D8']]);
  const umbrella = (x, y, a, b) => `<rect x="${x - 4}" y="${y}" width="8" height="140" fill="#8A6A4A"/><path d="M${x - 110} ${y + 20} Q ${x} ${y - 90} ${x + 110} ${y + 20} Z" fill="${a}"/><path d="M${x - 38} ${y + 20} Q ${x} ${y - 90} ${x + 38} ${y + 20} Z" fill="${b}"/>`;
  scenes.push(svg(`<defs>${sky.def}${sea.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    <circle cx="160" cy="150" r="70" fill="#FFF3B0"/>${cloud(620, 160, 1)}
    <rect y="460" width="${S}" height="${S}" fill="${sea.url}"/>
    <g transform="translate(720 470)"><path d="M-60 0 L60 0 L44 22 L-44 22 Z" fill="#FFFFFF"/><path d="M0 0 L0 -130 L70 -8 Z" fill="#FFFFFF"/><path d="M-6 -8 L-6 -110 L-56 -8 Z" fill="#3C8CE7"/></g>
    <path d="M0 640 Q 300 600 520 650 Q 760 700 1024 640 L1024 1024 L0 1024 Z" fill="#F5D9A0"/>
    <path d="M0 640 Q 300 600 520 650 Q 760 700 1024 640" stroke="#FFFFFF" stroke-width="10" fill="none" opacity="0.8"/>
    ${umbrella(240, 700, '#E8505B', '#FFFFFF')}${umbrella(560, 760, '#FFD34E', '#3C8CE7')}${umbrella(860, 720, '#3FBF7F', '#FFFFFF')}
    <rect x="160" y="850" width="160" height="40" rx="10" fill="#3C8CE7"/><rect x="480" y="910" width="160" height="40" rx="10" fill="#E8505B"/>
    <circle cx="820" cy="930" r="34" fill="#FFFFFF"/><path d="M786 930 L854 930 M820 896 L820 964" stroke="#E8505B" stroke-width="8"/>`));
}
// 12) Karlı çam ormanında kulübe
{
  const sky = lin([[0, '#A9C8EE'], [1, '#EAF3FF']]);
  scenes.push(svg(`<defs>${sky.def}</defs><rect width="${S}" height="${S}" fill="${sky.url}"/>
    ${flowerDots(20, 1000, ['#FFFFFF'], 140, 81, 5)}
    ${hills(560, 80, '#F4F8FF', 81)}${[60, 180, 820, 950].map((x, i) => pine(x, 600, 200 + (i % 2) * 60, '#2C6B55', true)).join('')}
    <rect y="640" width="${S}" height="${S}" fill="#FFFFFF"/>
    <g transform="translate(330 470)"><rect x="0" y="80" width="360" height="200" fill="#8A5A30"/>${[100, 140, 180, 220, 260].map((y) => `<rect x="0" y="${y}" width="360" height="6" fill="#6B4222"/>`).join('')}
      <path d="M-40 90 L180 -40 L400 90 Z" fill="#6B4222"/><path d="M-50 92 L180 -52 L410 92 L380 92 L180 -20 L-20 92 Z" fill="#FFFFFF"/>
      <rect x="150" y="170" width="70" height="110" fill="#4A2A12"/><rect x="40" y="140" width="70" height="60" fill="#FFD27A"/><rect x="260" y="140" width="70" height="60" fill="#FFD27A"/>
      <rect x="280" y="-10" width="36" height="70" fill="#7A6A60"/><circle cx="300" cy="-40" r="18" fill="#FFFFFF" opacity="0.8"/><circle cx="320" cy="-80" r="24" fill="#FFFFFF" opacity="0.6"/></g>
    ${[120, 260, 760, 900].map((x, i) => pine(x, 820, 150 + (i % 2) * 40, '#2C6B55', true)).join('')}
    <g transform="translate(560 860)"><circle cx="0" cy="0" r="56" fill="#FFFFFF" stroke="#DDE6F2" stroke-width="4"/><circle cx="0" cy="-80" r="38" fill="#FFFFFF" stroke="#DDE6F2" stroke-width="4"/><circle cx="-12" cy="-86" r="4" fill="#333"/><circle cx="12" cy="-86" r="4" fill="#333"/><path d="M0 -78 L22 -72 L0 -68 Z" fill="#FF8A3D"/><path d="M-36 -50 Q 0 -36 36 -50 L30 -40 Q 0 -28 -30 -40 Z" fill="#E8505B"/></g>`));
}

function appIcon(withBg = true) {
  const bg = withBg ? `<rect width="1024" height="1024" fill="#2E7DBA"/>` : '';
  // dört yapboz parçası, biri yerine oturuyor
  const piece = (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L40 0 C 40 -18 60 -18 60 0 L100 0 L100 40 C 118 40 118 60 100 60 L100 100 L0 100 Z" fill="${c}" stroke="#FFFFFF" stroke-width="5"/></g>`;
  return svg(`${bg}${piece(170, 260, 3.0, '#F5B82E')}${piece(500, 260, 3.0, '#E8505B')}${piece(170, 590, 3.0, '#3FBF7F')}<g transform="rotate(-12 700 700)">${piece(560, 620, 2.6, '#9A5BD8')}</g>`, 1024, 1024);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (s, file, w, h, type = 'png') => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(ROOT, 'assets', file), omitBackground: type === 'png', type, ...(type === 'jpeg' ? { quality: 86 } : {}) });
  };
  fs.mkdirSync(path.join(ROOT, 'assets', 'pictures'), { recursive: true });
  for (let i = 0; i < scenes.length; i++) await render(scenes[i], `pictures/p${i}.jpg`, 900, 900, 'jpeg');
  await render(appIcon(), 'icon.png', 1024, 1024);
  await render(appIcon(false), 'splash-icon.png', 1024, 1024);
  await render(appIcon(false), 'android-icon-foreground.png', 1024, 1024);
  await render(svg('<rect width="1024" height="1024" fill="#2E7DBA"/>'), 'android-icon-background.png', 1024, 1024);
  await render(appIcon(false).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"'), 'android-icon-monochrome.png', 1024, 1024);
  await render(appIcon(), 'favicon.png', 48, 48);
  await browser.close();
  console.log(`Huzur Jigsaw çizimleri üretildi (${scenes.length} resim).`);
})();
