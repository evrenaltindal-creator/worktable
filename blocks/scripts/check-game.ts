/* Blok Bulmaca motoru testleri:  npm run check:game */
import { Dealer, N, SHAPES, STONE, bestMove, emptyBoard, fits, fullCells, isStuck, makeLevel, place } from '../src/game/blocks';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};

// 1) Parçalar geçerli ve birbirinden farklı
const keys = new Set(SHAPES.map((s) => JSON.stringify(s.cells)));
if (keys.size !== SHAPES.length) fail('aynı parça iki kez tanımlı');
SHAPES.forEach((s, i) => {
  if (!s.cells.some(([r]) => r === 0) || !s.cells.some(([, c]) => c === 0)) fail(`parça ${i} sol üste yaslı değil`);
});

// 2) Satır, sütun ve kutu temizleme
{
  const b = emptyBoard();
  for (let c = 0; c < N - 1; c++) b[4 * N + c] = 1;
  const res = place(b, { id: 1, shape: 0, color: 2 }, 4, N - 1, 0);
  if (!res || res.lines !== 1 || res.cleared.length !== N || res.board.some((x) => x >= 0)) fail('satır temizlenmedi');
  const k = emptyBoard();
  [0, 1, 2, 9, 10, 11, 18, 19].forEach((i) => (k[i] = 3));
  const r2 = place(k, { id: 2, shape: 0, color: 3 }, 2, 2, 0);
  if (!r2 || r2.lines !== 1) fail('3x3 kutu temizlenmedi');
  if (fits(b, 3, 4, 0)) fail('dolu hücreye parça kondu');
  if (fits(emptyBoard(), 7, 0, 5)) fail('tahta dışına taşan parça kabul edildi');
}

// 3) Adil dağıtım: verilen üçlüden en az biri sığar (tahta tamamen kapanmadıkça)
{
  const d = new Dealer(7);
  for (let t = 0; t < 300; t++) {
    const b = emptyBoard();
    for (let i = 0; i < N * N; i++) if ((i * 7 + t) % 5 !== 0) b[i] = 1;
    fullCells(b).cells.forEach((i) => (b[i] = -1));
    const hand = d.deal(b);
    const anyEmpty = b.some((x) => x < 0);
    if (anyEmpty && isStuck(b, hand)) fail(`dağıtım ${t}: hiçbir parça sığmıyor`);
  }
}

// 4) İpucu oyuncusu seviyeleri bitirebiliyor mu
let wins = 0;
const LEVELS = 40;
for (let n = 1; n <= LEVELS; n++) {
  const lv = makeLevel(n);
  if (fullCells(lv.board).lines) fail(`seviye ${n}: başlangıçta dolu bölge var`);
  if (lv.board.filter((x) => x === STONE).length === 0 && n > 1) fail(`seviye ${n}: taş yok`);
  const d = new Dealer(lv.seed);
  let b = lv.board.slice();
  let hand = d.deal(b) as (ReturnType<Dealer['deal']>[number] | null)[];
  let score = 0;
  let combo = 0;
  for (let turn = 0; turn < 400 && score < lv.target; turn++) {
    if (isStuck(b, hand)) break;
    const mv = bestMove(b, hand);
    if (!mv) break;
    const res = place(b, hand[mv.slot]!, mv.r, mv.c, combo);
    if (!res) {
      fail(`seviye ${n}: ipucu geçersiz yerleşim verdi`);
      break;
    }
    combo = res.lines ? combo + 1 : 0;
    score += res.points;
    b = res.board;
    hand[mv.slot] = null;
    if (hand.every((p) => !p)) hand = d.deal(b);
  }
  if (score >= lv.target) wins++;
  else console.log(`  kaybedilen ${n}: ${score}/${lv.target}`);
}
console.log(`İpucu oyuncusu ${LEVELS} seviyenin ${wins} tanesini bitirdi`);
if (wins < LEVELS * 0.85) fail('seviyeler fazla zor');

// 5) Klasik oyunda ortalama skor (bilgi için)
{
  let total = 0;
  for (let s = 1; s <= 10; s++) {
    const d = new Dealer(s * 101);
    let b = emptyBoard();
    let hand = d.deal(b) as (ReturnType<Dealer['deal']>[number] | null)[];
    let score = 0;
    let combo = 0;
    for (let turn = 0; turn < 3000; turn++) {
      if (isStuck(b, hand)) break;
      const mv = bestMove(b, hand)!;
      const res = place(b, hand[mv.slot]!, mv.r, mv.c, combo)!;
      combo = res.lines ? combo + 1 : 0;
      score += res.points;
      b = res.board;
      hand[mv.slot] = null;
      if (hand.every((p) => !p)) hand = d.deal(b);
    }
    total += score;
  }
  console.log(`Klasik oyunda ipucu oyuncusunun ortalama puanı: ${Math.round(total / 10)}`);
}

if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
