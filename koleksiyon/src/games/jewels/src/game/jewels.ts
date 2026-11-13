/**
 * Mücevher (üçlü eşleştirme) motoru — çizimden bağımsız, saf TypeScript.
 *
 * Tahta SIZE x SIZE. Her hücrede bir taş: { kind: 0..KINDS-1, special }.
 * - Yan yana iki taşı yer değiştir; yatay ya da dikey 3+ aynı taş oluşursa patlar.
 * - 4'lü sıra   → "çizgi" taşı (patlayınca bütün satırı ya da sütunu temizler)
 * - L / T şekli → "bomba" taşı (patlayınca 3x3 alanı temizler)
 * - 5'li sıra   → "yıldız" taşı (yer değiştirdiği taşın rengindeki bütün taşları temizler)
 * Boşluklar yukarıdan düşen taşlarla dolar; zincirleme patlamalar olur.
 */
import { createRng, randInt } from '../kit/rng';

export const SIZE = 8;
export const KINDS = 6;

export type Special = 'none' | 'row' | 'col' | 'bomb' | 'star';
export interface Gem {
  id: number;
  kind: number; // yıldızda -1
  special: Special;
}
export type Board = (Gem | null)[];

export const idx = (r: number, c: number) => r * SIZE + c;
export const rc = (i: number) => [Math.floor(i / SIZE), i % SIZE] as const;
export const adjacent = (a: number, b: number) => {
  const [ar, ac] = rc(a);
  const [br, bc] = rc(b);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

export interface LevelGoal {
  kind: number;
  count: number;
}
export interface Level {
  number: number;
  kinds: number;
  moves: number;
  /** Hedef: belirli taşlardan şu kadar topla (ya da yalnız puan) */
  goals: LevelGoal[];
  score: number;
  seed: number;
}

/** Seviye tanımı: renk sayısı, hamle ve hedefler seviyeyle yavaşça artar. */
export function makeLevel(n: number, variant = 0): Level {
  const rng = createRng(n * 7919 + 13 + variant * 104729);
  const kinds = n <= 6 ? 5 : KINDS;
  const goalCount = n <= 3 ? 1 : 2;
  const used = new Set<number>();
  const goals: LevelGoal[] = [];
  for (let g = 0; g < goalCount; g++) {
    let k = randInt(rng, kinds);
    while (used.has(k)) k = (k + 1) % kinds;
    used.add(k);
    goals.push({ kind: k, count: Math.min(20, 8 + Math.floor(n * 0.4) + randInt(rng, 3)) });
  }
  const moves = Math.max(23, 26 - Math.floor(n / 10));
  return { number: n, kinds, moves, goals, score: 1000 + n * 150, seed: n * 31 + variant * 977 + 1 };
}

export class Game {
  board: Board = [];
  private rng: () => number;
  private nextId = 1;
  constructor(
    public kinds: number,
    seed: number,
  ) {
    this.rng = createRng(seed);
    this.fill();
  }

  private gem(kind?: number): Gem {
    return { id: this.nextId++, kind: kind ?? randInt(this.rng, this.kinds), special: 'none' };
  }

  /** Başlangıçta hazır eşleşme olmasın ve en az bir hamle olsun */
  fill() {
    for (let tries = 0; tries < 200; tries++) {
      this.board = [];
      for (let i = 0; i < SIZE * SIZE; i++) {
        const [r, c] = rc(i);
        let g = this.gem();
        for (let k = 0; k < 10; k++) {
          const left2 = c >= 2 && this.board[i - 1]!.kind === g.kind && this.board[i - 2]!.kind === g.kind;
          const up2 = r >= 2 && this.board[i - SIZE]!.kind === g.kind && this.board[i - 2 * SIZE]!.kind === g.kind;
          if (!left2 && !up2) break;
          g = this.gem();
        }
        this.board.push(g);
      }
      if (findMatches(this.board).length === 0 && findMove(this.board)) return;
    }
  }

  /** Hamle yoksa taşları karıştır (özel taşlar korunur) */
  shuffle() {
    const gems = this.board.filter((g): g is Gem => !!g);
    for (let t = 0; t < 100; t++) {
      for (let i = gems.length - 1; i > 0; i--) {
        const j = randInt(this.rng, i + 1);
        [gems[i], gems[j]] = [gems[j], gems[i]];
      }
      const b = gems.slice();
      if (findMatches(b).length === 0 && findMove(b)) {
        this.board = b;
        return;
      }
    }
    this.fill();
  }

  /**
   * Bir hamle yapar. Geçersizse null döner (taşlar geri döner).
   * Dönen adımlar ekranda sırayla canlandırılır.
   */
  swap(a: number, b: number): Step[] | null {
    if (!adjacent(a, b)) return null;
    const ga = this.board[a];
    const gb = this.board[b];
    if (!ga || !gb) return null;
    const next = this.board.slice();
    next[a] = gb;
    next[b] = ga;
    // Yıldız: değiştirildiği taşın rengini (ya da iki yıldızda her şeyi) temizler
    const starA = ga.special === 'star';
    const starB = gb.special === 'star';
    if (starA || starB) {
      this.board = next;
      const clear = new Set<number>();
      const target = starA ? gb.kind : ga.kind;
      next.forEach((g, i) => {
        if (!g) return;
        if ((starA && starB) || g.kind === target) clear.add(i);
      });
      clear.add(a);
      clear.add(b);
      return this.resolve(clear, new Map());
    }
    const m = findMatches(next);
    if (!m.length) return null;
    this.board = next;
    return this.resolve(null, new Map(), [a, b]);
  }

  /** Patlamaları, düşmeleri ve zincirleri çözer */
  private resolve(first: Set<number> | null, created: Map<number, Gem>, moved: number[] = []): Step[] {
    const steps: Step[] = [];
    let pending = first;
    let chain = 0;
    for (let guard = 0; guard < 60; guard++) {
      let clear: Set<number>;
      const make = new Map<number, Gem>(created);
      created = new Map();
      if (pending) {
        clear = pending;
        pending = null;
      } else {
        const groups = findMatches(this.board);
        if (!groups.length) break;
        clear = new Set<number>();
        for (const grp of groups) {
          grp.cells.forEach((i) => clear.add(i));
          // Özel taş oluştur: oyuncunun oynattığı taşın yerinde (yoksa grubun ortasında)
          const special: Special | null = grp.shape === 'five' ? 'star' : grp.shape === 'lt' ? 'bomb' : grp.shape === 'four' ? grp.dir : null;
          if (special) {
            const at = grp.cells.find((i) => moved.includes(i)) ?? grp.cells[Math.floor(grp.cells.length / 2)];
            const kind = this.board[at]!.kind;
            make.set(at, { id: this.nextId++, kind: special === 'star' ? -1 : kind, special });
          }
        }
      }
      // Patlayan özel taşlar alanlarını da temizler (zincirleme)
      const queue = [...clear];
      for (let k = 0; k < queue.length; k++) {
        const g = this.board[queue[k]];
        if (!g || g.special === 'none' || make.has(queue[k])) continue;
        for (const j of blast(this.board, queue[k], g)) {
          if (!clear.has(j)) {
            clear.add(j);
            queue.push(j);
          }
        }
      }
      for (const at of make.keys()) clear.delete(at);
      const removed: { i: number; gem: Gem }[] = [];
      clear.forEach((i) => {
        const g = this.board[i];
        if (g) removed.push({ i, gem: g });
        this.board[i] = null;
      });
      make.forEach((g, at) => (this.board[at] = g));
      chain++;
      const falls = this.collapse();
      steps.push({ removed, created: [...make.entries()].map(([i, gem]) => ({ i, gem })), falls, chain, board: this.board.slice() });
      moved = [];
    }
    if (!findMove(this.board)) {
      this.shuffle();
      steps.push({ removed: [], created: [], falls: [], chain, shuffled: true, board: this.board.slice() });
    }
    return steps;
  }

  /** Taşları aşağı düşür, üstten yenilerini getir. Her taşın kaç satır düştüğünü döner. */
  private collapse(): Fall[] {
    const falls: Fall[] = [];
    for (let c = 0; c < SIZE; c++) {
      let write = SIZE - 1;
      for (let r = SIZE - 1; r >= 0; r--) {
        const g = this.board[idx(r, c)];
        if (!g) continue;
        if (write !== r) {
          this.board[idx(write, c)] = g;
          this.board[idx(r, c)] = null;
          falls.push({ id: g.id, to: idx(write, c), from: r - write });
        }
        write--;
      }
      const fresh = write + 1;
      for (let r = write; r >= 0; r--) {
        const g = this.gem();
        this.board[idx(r, c)] = g;
        falls.push({ id: g.id, to: idx(r, c), from: -fresh, fresh: true });
      }
    }
    return falls;
  }

  /** Çekiç: tek bir taşı kırar (özel taşsa etkisi de çalışır) */
  hammer(i: number): Step[] {
    if (!this.board[i]) return [];
    return this.resolve(new Set([i]), new Map());
  }
}

export interface Fall {
  id: number;
  to: number;
  /** satır farkı (from < 0 ise yukarıdan yeni gelen) */
  from: number;
  fresh?: boolean;
}
export interface Step {
  removed: { i: number; gem: Gem }[];
  created: { i: number; gem: Gem }[];
  falls: Fall[];
  chain: number;
  shuffled?: boolean;
  /** bu adımdan sonraki tahta (ekranda canlandırmak için) */
  board: Board;
}

interface MatchGroup {
  cells: number[];
  shape: 'three' | 'four' | 'five' | 'lt';
  dir: 'row' | 'col';
}

const kindAt = (b: Board, i: number) => (b[i] ? b[i]!.kind : -2);

/** Tüm eşleşme grupları (kesişen yatay ve dikey sıralar L/T olarak birleşir) */
export function findMatches(b: Board): MatchGroup[] {
  const runs: { cells: number[]; dir: 'row' | 'col' }[] = [];
  for (let r = 0; r < SIZE; r++) {
    let c = 0;
    while (c < SIZE) {
      const k = kindAt(b, idx(r, c));
      let e = c + 1;
      while (e < SIZE && k >= 0 && kindAt(b, idx(r, e)) === k) e++;
      if (k >= 0 && e - c >= 3) runs.push({ cells: Array.from({ length: e - c }, (_, j) => idx(r, c + j)), dir: 'row' });
      c = e;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let r = 0;
    while (r < SIZE) {
      const k = kindAt(b, idx(r, c));
      let e = r + 1;
      while (e < SIZE && k >= 0 && kindAt(b, idx(e, c)) === k) e++;
      if (k >= 0 && e - r >= 3) runs.push({ cells: Array.from({ length: e - r }, (_, j) => idx(r + j, c)), dir: 'col' });
      r = e;
    }
  }
  // Kesişen sıraları birleştir
  const groups: MatchGroup[] = [];
  const used = new Set<number>();
  runs.forEach((run, i) => {
    if (used.has(i)) return;
    used.add(i);
    const cells = new Set(run.cells);
    let crossed = false;
    let longest = run.cells.length;
    let dir = run.dir;
    runs.forEach((other, j) => {
      if (used.has(j)) return;
      if (other.cells.some((x) => cells.has(x))) {
        used.add(j);
        other.cells.forEach((x) => cells.add(x));
        crossed = true;
        if (other.cells.length > longest) {
          longest = other.cells.length;
          dir = other.dir;
        }
      }
    });
    const shape = longest >= 5 ? 'five' : crossed ? 'lt' : longest === 4 ? 'four' : 'three';
    // 4'lü yatay sıra dikey çizgi taşı değil, satır temizleyen taş verir
    groups.push({ cells: [...cells], shape, dir });
  });
  return groups;
}

/** Özel taşın etki alanı */
export function blast(b: Board, i: number, g: Gem): number[] {
  const [r, c] = rc(i);
  const out: number[] = [];
  if (g.special === 'row') for (let x = 0; x < SIZE; x++) out.push(idx(r, x));
  else if (g.special === 'col') for (let y = 0; y < SIZE; y++) out.push(idx(y, c));
  else if (g.special === 'bomb') {
    for (let y = r - 1; y <= r + 1; y++) for (let x = c - 1; x <= c + 1; x++) if (y >= 0 && x >= 0 && y < SIZE && x < SIZE) out.push(idx(y, x));
  } else if (g.special === 'star') {
    // patlatılan yıldız: tahtadaki en kalabalık rengi temizler
    const counts = new Map<number, number>();
    b.forEach((x) => x && x.kind >= 0 && counts.set(x.kind, (counts.get(x.kind) ?? 0) + 1));
    const top = [...counts.entries()].sort((p, q) => q[1] - p[1])[0]?.[0];
    b.forEach((x, j) => x && x.kind === top && out.push(j));
  }
  return out;
}

/** Geçerli bir hamle (ipucu için) — hedef renklerini ve en çok taş patlatanı tercih eder */
export function findMove(b: Board, goalKinds: number[] = []): [number, number] | null {
  let best: [number, number] | null = null;
  let bestScore = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const [r, c] = rc(i);
    for (const j of [c < SIZE - 1 ? i + 1 : -1, r < SIZE - 1 ? i + SIZE : -1]) {
      if (j < 0 || !b[i] || !b[j]) continue;
      if (b[i]!.special === 'star' || b[j]!.special === 'star') {
        if (bestScore < 20) {
          best = [i, j];
          bestScore = 20;
        }
        continue;
      }
      const t = b.slice();
      t[i] = b[j];
      t[j] = b[i];
      const m = findMatches(t);
      if (!m.length) continue;
      const score = m.reduce((s, g) => s + g.cells.length * (goalKinds.includes(t[g.cells[0]]!.kind) ? 3 : 1) + (g.shape === 'three' ? 0 : 5), 0);
      if (score > bestScore) {
        bestScore = score;
        best = [i, j];
      }
    }
  }
  return best;
}

/** Puan: patlayan taş başına 10, zincir çarpanlı */
export const stepScore = (s: Step) => s.removed.length * 10 * s.chain;
