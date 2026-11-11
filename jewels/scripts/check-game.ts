/* Mücevher motoru testleri:  npm run check:game */
import { Board, Game, SIZE, adjacent, findMatches, findMove, makeLevel, rc, stepScore } from '../src/game/jewels';

/** Hedefe bakan oyuncu: hedef renklerini patlatan hamleleri öne alır (yalnız ilk patlamaya bakar) */
function goalMove(b: Board, need: Map<number, number>): [number, number] | null {
  let best: [number, number] | null = null;
  let bestScore = -1;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const [r, c] = rc(i);
    for (const j of [c < SIZE - 1 ? i + 1 : -1, r < SIZE - 1 ? i + SIZE : -1]) {
      if (j < 0) continue;
      const t = b.slice();
      [t[i], t[j]] = [t[j], t[i]];
      const star = b[i]!.special === 'star' || b[j]!.special === 'star';
      const m = findMatches(t);
      if (!m.length && !star) continue;
      let score = star ? 30 : 0;
      for (const g of m) {
        const k = t[g.cells[0]]!.kind;
        score += g.cells.length * ((need.get(k) ?? 0) > 0 ? 3 : 1) + (g.shape === 'three' ? 0 : 6);
        score += g.cells.filter((x) => t[x]!.special !== 'none').length * 8;
      }
      // aşağıdaki hamleler daha çok zincir yaratır
      score += Math.max(r, rc(j)[0]) * 0.1;
      if (score > bestScore) {
        bestScore = score;
        best = [i, j];
      }
    }
  }
  return best;
}

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};

// 1) Başlangıç tahtası: hazır eşleşme yok, en az bir hamle var
for (let s = 1; s <= 200; s++) {
  const g = new Game(6, s);
  if (findMatches(g.board).length) fail(`tohum ${s}: başlangıçta eşleşme var`);
  if (!findMove(g.board)) fail(`tohum ${s}: başlangıçta hamle yok`);
}

// 2) Geçersiz hamle tahtayı değiştirmez
{
  const g = new Game(6, 5);
  const before = g.board.map((x) => x!.id).join();
  let invalid = 0;
  for (let i = 0; i < SIZE * SIZE - 1 && invalid < 5; i++) {
    const j = i + 1;
    if (!adjacent(i, j)) continue;
    const t = g.board.slice();
    [t[i], t[j]] = [t[j], t[i]];
    if (findMatches(t).length || g.board[i]!.special === 'star' || g.board[j]!.special === 'star') continue;
    if (g.swap(i, j) !== null) fail('geçersiz hamle kabul edildi');
    invalid++;
  }
  if (g.board.map((x) => x!.id).join() !== before) fail('geçersiz hamle tahtayı değiştirdi');
  if (adjacent(0, 9) || adjacent(7, 8) || !adjacent(0, 8)) fail('komşuluk yanlış');
}

// 3) Basit oyuncu (en çok patlatan hamle) seviyeleri bitirebiliyor mu; her adımdan sonra tahta tutarlı mı
let wins = 0;
const LEVELS = 60;
const movesLeftPct: number[] = [];
for (let n = 1; n <= LEVELS; n++) {
  const lv = makeLevel(n);
  const g = new Game(lv.kinds, lv.seed);
  const need = new Map(lv.goals.map((x) => [x.kind, x.count]));
  let score = 0;
  let moves = lv.moves;
  while (moves > 0 && [...need.values()].some((v) => v > 0)) {
    const mv = goalMove(g.board, need);
    if (!mv) {
      fail(`seviye ${n}: hamle yok (karıştırma çalışmadı)`);
      break;
    }
    const steps = g.swap(mv[0], mv[1]);
    if (!steps) {
      fail(`seviye ${n}: ipucu hamlesi geçersiz çıktı`);
      break;
    }
    moves--;
    for (const st of steps) {
      score += stepScore(st);
      st.removed.forEach(({ gem }) => need.has(gem.kind) && need.set(gem.kind, (need.get(gem.kind) as number) - 1));
    }
    if (g.board.some((x) => !x)) fail(`seviye ${n}: tahtada boşluk kaldı`);
    if (findMatches(g.board).length) fail(`seviye ${n}: çözülmemiş eşleşme kaldı`);
    const ids = new Set(g.board.map((x) => x!.id));
    if (ids.size !== SIZE * SIZE) fail(`seviye ${n}: aynı taş iki yerde`);
  }
  if (![...need.values()].every((v) => v <= 0)) console.log(`  kaybedilen ${n}: kalan ${[...need.values()].join(",")} / hedef ${lv.goals.map((x) => x.count).join(",")} renk ${lv.kinds} hamle ${lv.moves}`);
  if ([...need.values()].every((v) => v <= 0)) {
    wins++;
    movesLeftPct.push(moves / lv.moves);
  }
  if (n === 1) console.log(`seviye 1: hedef ${lv.goals.map((x) => x.count).join('+')} taş, ${lv.moves - moves} hamlede, ${score} puan`);
}
const avg = movesLeftPct.reduce((a, b) => a + b, 0) / Math.max(1, movesLeftPct.length);
// İpucu oyuncusu: yalnız ipucu düğmesinin önerdiği hamleleri yapan biri de çoğu seviyeyi bitirebilmeli
let hintWins = 0;
for (let n = 1; n <= 20; n++) {
  const lv = makeLevel(n);
  const g = new Game(lv.kinds, lv.seed);
  const need = lv.goals.map((x) => x.count);
  for (let m = 0; m < lv.moves && need.some((v) => v > 0); m++) {
    const mv = findMove(g.board, lv.goals.filter((_, k) => need[k] > 0).map((x) => x.kind));
    if (!mv) break;
    g.swap(mv[0], mv[1])?.forEach((st) => st.removed.forEach(({ gem }) => lv.goals.forEach((x, k) => x.kind === gem.kind && need[k]--)));
  }
  if (need.every((v) => v <= 0)) hintWins++;
}
console.log(`Yalnız ipucuyla oynayan 20 seviyenin ${hintWins} tanesini bitirdi`);
if (hintWins < 14) fail('ipucu hamleleri seviyeleri bitirmeye yetmiyor');
console.log(`Basit oyuncu ${LEVELS} seviyenin ${wins} tanesini bitirdi (ortalama kalan hamle %${Math.round(avg * 100)})`);
if (wins < LEVELS * 0.8) fail('seviyeler basit oyuncu için fazla zor');

// 4) Özel taşlar gerçekten oluşuyor mu
{
  let specials = 0;
  for (let s = 1; s <= 20; s++) {
    const g = new Game(6, s * 3);
    for (let k = 0; k < 25; k++) {
      const mv = findMove(g.board);
      if (!mv) break;
      g.swap(mv[0], mv[1])?.forEach((st) => (specials += st.created.length));
    }
  }
  console.log(`20 oyunda ${specials} özel taş oluştu`);
  if (specials < 20) fail('özel taş neredeyse hiç oluşmuyor');
}

// 5) Çekiç
{
  const g = new Game(6, 9);
  const st = g.hammer(27);
  if (!st.length || st[0].removed.length < 1) fail('çekiç taş kırmadı');
  if (g.board.some((x) => !x)) fail('çekiçten sonra boşluk kaldı');
}

if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
