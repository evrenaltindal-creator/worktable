/**
 * Kelime Avı motoru — çizimden bağımsız, saf TypeScript.
 *
 * Kare bir harf tablosuna temalı kelimeler gizlenir. Oyuncu ilk harften son harfe düz bir çizgi çeker.
 * İlk seviyelerde kelimeler yalnız sağa ve aşağı yazılır; sonra çaprazlar, en sonda tersler eklenir.
 * Her kelime tabloda tam bir kez geçer (yanlışlıkla ikinci kez oluşmaz).
 */
import type { Lang } from '../kit/i18n';
import { createRng, randInt, shuffleInPlace } from '../kit/rng';
import { FILLERS, THEMES, WORDS } from './wordlists';

export type Dir = [number, number];
const RIGHT: Dir = [0, 1];
const DOWN: Dir = [1, 0];
const DIAG: Dir = [1, 1];
const UPDIAG: Dir = [-1, 1];
const ALL: Dir[] = [RIGHT, DOWN, DIAG, UPDIAG, [0, -1], [-1, 0], [-1, -1], [1, -1]];

/** Kelimeyi hücrelere böler (Fransızca/Portekizcede aksanlar kaldırılır) */
export function cellsOf(word: string, lang: Lang): string[] {
  let w = word;
  if (lang === 'fr' || lang === 'pt') w = w.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return Array.from(w);
}

export interface Placed {
  word: string; // gösterilecek hali (aksanlı)
  cells: number[]; // tablo dizinleri, ilk harften son harfe
}

export interface Puzzle {
  size: number;
  grid: string[];
  words: Placed[];
  theme: number;
}

export function levelParams(level: number, lang: Lang) {
  const cjk = lang === 'ja' || lang === 'ko';
  const size = cjk ? (level <= 6 ? 7 : 8) : level <= 4 ? 8 : level <= 12 ? 9 : 10;
  const count = Math.min(9, 5 + Math.floor((level - 1) / 4));
  const dirs: Dir[] = level <= 4 ? [RIGHT, DOWN] : level <= 12 ? [RIGHT, DOWN, DIAG, UPDIAG] : ALL;
  return { size, count, dirs };
}

/** Bir kelimenin tabloda kaç kez geçtiği (8 yönde) */
export function occurrences(grid: string[], size: number, cells: string[]): number {
  let n = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      for (const [dr, dc] of ALL) {
        let ok = true;
        for (let k = 0; k < cells.length && ok; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          ok = rr >= 0 && cc >= 0 && rr < size && cc < size && grid[rr * size + cc] === cells[k];
        }
        if (ok) n++;
      }
  // tek harfli ya da kendi tersine eşit (palindrom) kelimeler iki yönde sayılır
  const pal = cells.join('') === [...cells].reverse().join('');
  return pal ? n / 2 : n;
}

export function makePuzzle(lang: Lang, level: number, variant = 0): Puzzle {
  const { size, count, dirs } = levelParams(level, lang);
  const theme = variant ? variant % THEMES : (level - 1) % THEMES;
  const min = lang === 'ja' || lang === 'ko' ? 2 : 3;
  const pool = WORDS[lang][theme].filter((w) => {
    const n = cellsOf(w, lang).length;
    return n >= min && n <= size;
  });
  for (let attempt = 0; attempt < 200; attempt++) {
    const rng = createRng(level * 7349 + variant * 911 + attempt * 37 + 1);
    const chosen: string[] = [];
    for (const w of shuffleInPlace(pool.slice(), rng)) {
      if (chosen.length >= count) break;
      const cw = cellsOf(w, lang).join('');
      // bir kelime diğerinin içinde geçmesin (iki kez sayılır)
      if (chosen.some((o) => cellsOf(o, lang).join('').includes(cw) || cw.includes(cellsOf(o, lang).join('')))) continue;
      chosen.push(w);
    }
    // uzunlar önce yerleşsin
    chosen.sort((a, b) => cellsOf(b, lang).length - cellsOf(a, lang).length);
    const grid: string[] = Array(size * size).fill('');
    const words: Placed[] = [];
    let failed = false;
    for (const w of chosen) {
      const cs = cellsOf(w, lang);
      let placed: number[] | null = null;
      for (let t = 0; t < 300 && !placed; t++) {
        const [dr, dc] = dirs[randInt(rng, dirs.length)];
        const r0 = randInt(rng, size);
        const c0 = randInt(rng, size);
        const idx: number[] = [];
        let ok = true;
        for (let k = 0; k < cs.length && ok; k++) {
          const r = r0 + dr * k;
          const c = c0 + dc * k;
          if (r < 0 || c < 0 || r >= size || c >= size) ok = false;
          else {
            const i = r * size + c;
            if (grid[i] && grid[i] !== cs[k]) ok = false;
            idx.push(i);
          }
        }
        if (ok) placed = idx;
      }
      if (!placed) {
        failed = true;
        break;
      }
      placed.forEach((i, k) => (grid[i] = cs[k]));
      words.push({ word: w, cells: placed });
    }
    if (failed) continue;
    const filler = Array.from(FILLERS[lang]);
    for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = filler[randInt(rng, filler.length)];
    if (words.every((p) => occurrences(grid, size, cellsOf(p.word, lang)) === 1)) {
      words.sort((a, b) => a.word.localeCompare(b.word, lang));
      return { size, grid, words, theme };
    }
  }
  throw new Error(`Kelime avı üretilemedi: ${lang} ${level}`);
}

/** İki hücre arasındaki düz çizgi (8 yön); değilse null */
export function lineBetween(a: number, b: number, size: number): number[] | null {
  const r0 = Math.floor(a / size);
  const c0 = a % size;
  const r1 = Math.floor(b / size);
  const c1 = b % size;
  const dr = Math.sign(r1 - r0);
  const dc = Math.sign(c1 - c0);
  const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  if (r1 - r0 !== dr * n || c1 - c0 !== dc * n) return null;
  return Array.from({ length: n + 1 }, (_, k) => (r0 + dr * k) * size + c0 + dc * k);
}

/** Seçilen çizgi bulunmamış bir kelimeye denk geliyor mu (iki yönden de) */
export function match(p: Puzzle, line: number[], found: boolean[]): number {
  const key = line.join(',');
  const rev = [...line].reverse().join(',');
  return p.words.findIndex((w, k) => !found[k] && (w.cells.join(',') === key || w.cells.join(',') === rev));
}
