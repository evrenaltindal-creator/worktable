/* Renk Patlatma motoru testleri:  npm run check:game */
import { COLS, ROWS, bestMove, groupAt, groups, makeBoard, makeLevel, pop, settle, smash, tilesLeft } from '../src/game/colorpop';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};

// 1) Patlatma, yerçekimi ve sütun kaydırma
{
  const b = makeBoard(4, 3);
  const g = groups(b)[0];
  const res = pop(b, g[0][0], g[0][1]);
  if (!res || res.removed.length !== g.length) fail('grup patlamadı');
  if (res && tilesLeft(res.board) !== COLS * ROWS - g.length) fail('karo sayısı yanlış');
  // yerçekimi: hiçbir sütunda boşluğun üstünde karo yok
  res?.board.forEach((col, c) => col.forEach((t, r) => r > 0 && t && !col[r - 1] && fail(`sütun ${c}: havada karo`)));
  // tek karo patlamaz
  const lone = b.findIndex((col, c) => col.some((_, r) => groupAt(b, c, r).length === 1));
  if (lone >= 0) {
    const r = b[lone].findIndex((_, rr) => groupAt(b, lone, rr).length === 1);
    if (pop(b, lone, r) !== null) fail('tek karo patladı');
  }
  // boş sütunlar kenara gider, dolu sütunlar ortada bitişik kalır
  const t = makeBoard(3, 9).map((col, c) => (c === 2 || c === 5 ? col.map(() => null) : col));
  const s = settle(t);
  const filled = s.map((col) => !!col[0]);
  const first = filled.indexOf(true);
  const last = filled.lastIndexOf(true);
  if (filled.slice(first, last + 1).some((x) => !x)) fail('dolu sütunlar arasında boşluk kaldı');
  const sm = smash(b, 0, 0);
  if (!sm || tilesLeft(sm.board) !== COLS * ROWS - 1) fail('çekiç çalışmadı');
}

// 2) Her seviye kazanılabilir ve ipucu oyuncusu hedefe ulaşabiliyor
let wins = 0;
const LEVELS = 30;
let sumAllowed = 0;
for (let n = 1; n <= LEVELS; n++) {
  const lv = makeLevel(n);
  sumAllowed += lv.allowed;
  if (lv.allowed < 0 || lv.allowed > COLS * ROWS / 2) fail(`seviye ${n}: hedef anlamsız (${lv.allowed})`);
  let b = lv.board;
  for (let k = 0; k < 200; k++) {
    const mv = bestMove(b, n * 13 + k, 4);
    if (!mv) break;
    b = (pop(b, mv[0], mv[1]) as { board: typeof b }).board;
  }
  const left = tilesLeft(b);
  if (left <= lv.allowed) wins++;
  else console.log(`  kaybedilen ${n}: ${left} karo kaldı, hedef ≤ ${lv.allowed}`);
}
console.log(`İpucu oyuncusu ${LEVELS} seviyenin ${wins} tanesini bitirdi (ortalama hedef ≤ ${Math.round(sumAllowed / LEVELS)} karo)`);
if (wins < LEVELS * 0.9) fail('ipucu oyuncusu yeterince seviye bitiremiyor');

// 3) Seviyeler deterministik (aynı numara aynı tahta)
if (JSON.stringify(makeLevel(7).board) !== JSON.stringify(makeLevel(7).board)) fail('seviye her seferinde farklı');

if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
