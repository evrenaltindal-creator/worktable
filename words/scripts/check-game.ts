/* Kelime Avı motoru testleri:  npm run check:game */
import type { Lang } from '../src/kit/i18n';
import { THEMES, THEME_NAMES, WORDS } from '../src/game/wordlists';
import { cellsOf, levelParams, lineBetween, makePuzzle, match, occurrences } from '../src/game/words';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error('HATA:', m);
};
const LANGS: Lang[] = ['tr', 'en', 'pt', 'de', 'fr', 'ja', 'ko'];

// 1) Kelime listeleri: her dilde her tema dolu, büyük harf, tekrar yok
for (const lang of LANGS) {
  if (WORDS[lang].length !== THEMES || THEME_NAMES[lang].length !== THEMES) fail(`${lang}: tema sayısı`);
  WORDS[lang].forEach((list, k) => {
    const usable = list.filter((w) => cellsOf(w, lang).length >= (lang === 'ja' || lang === 'ko' ? 2 : 3) && cellsOf(w, lang).length <= 8);
    if (usable.length < 9) fail(`${lang} tema ${k}: yalnız ${usable.length} kullanılabilir kelime`);
    if (new Set(list).size !== list.length) fail(`${lang} tema ${k}: tekrar eden kelime`);
    if (lang !== 'ja' && lang !== 'ko') list.forEach((w) => w !== w.toLocaleUpperCase(lang) && fail(`${lang}: küçük harf "${w}"`));
  });
}

// 2) Her dilde 40 seviye: tüm kelimeler yerleşir, her biri tam bir kez geçer, tablo dolu
let puzzles = 0;
for (const lang of LANGS) {
  for (let level = 1; level <= 40; level++) {
    const p = makePuzzle(lang, level);
    puzzles++;
    const { size, count } = levelParams(level, lang);
    if (p.grid.length !== size * size || p.grid.some((x) => !x)) fail(`${lang} ${level}: boş hücre`);
    if (p.words.length < Math.min(count, 5)) fail(`${lang} ${level}: az kelime (${p.words.length})`);
    for (const w of p.words) {
      const cs = cellsOf(w.word, lang);
      if (w.cells.map((i) => p.grid[i]).join('') !== cs.join('')) fail(`${lang} ${level}: "${w.word}" yanlış yazılmış`);
      if (occurrences(p.grid, size, cs) !== 1) fail(`${lang} ${level}: "${w.word}" birden çok kez geçiyor`);
      const line = lineBetween(w.cells[0], w.cells[w.cells.length - 1], size);
      if (!line || line.join() !== w.cells.join()) fail(`${lang} ${level}: "${w.word}" düz çizgide değil`);
      // tersten çekilen çizgi de kabul edilir
      if (match(p, [...w.cells].reverse(), p.words.map(() => false)) < 0) fail(`${lang} ${level}: ters seçim tanınmadı`);
    }
    if (level <= 4 && p.words.some((w) => w.cells[1] - w.cells[0] !== 1 && w.cells[1] - w.cells[0] !== size)) fail(`${lang} ${level}: kolay seviyede çapraz/ters kelime`);
  }
}
if (lineBetween(0, 10, 8) !== null) fail('eğri çizgi kabul edildi');
if (lineBetween(0, 20, 9)?.join() !== '0,10,20') fail('çapraz çizgi yanlış');
// aynı seviye her seferinde aynı tablo
if (makePuzzle('tr', 9).grid.join() !== makePuzzle('tr', 9).grid.join()) fail('seviye deterministik değil');
console.log(`${puzzles} bulmaca denendi (7 dil x 40 seviye).`);
if (failed) process.exit(1);
console.log('Tüm kontroller geçti.');
