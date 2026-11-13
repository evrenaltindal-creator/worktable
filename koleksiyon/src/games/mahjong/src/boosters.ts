/**
 * Güçlendiriciler (ipucu, karıştır, geri al) sınırlıdır ve seviye bitirerek kazanılır.
 */
export type BoosterKind = 'hint' | 'shuffle' | 'undo';
export type Boosters = Record<BoosterKind, number>;

export const START_BOOSTERS: Boosters = { hint: 3, shuffle: 2, undo: 5 };
export const BOOSTER_MAX = 99;

/** Yardım kullanımına göre yıldız: hiç yardım yok = 3, 1-2 = 2, daha fazla = 1 */
export function starsFor(helpUsed: number): number {
  if (helpUsed <= 0) return 3;
  if (helpUsed <= 2) return 2;
  return 1;
}

/**
 * Bir seviye İLK kez bitirildiğinde verilen ödül.
 * - her seviye: +1 geri al
 * - 3 yıldız: +1 ipucu
 * - her 5. seviye: +1 karıştır ve +1 ipucu
 */
export function levelRewards(level: number, stars: number): Partial<Boosters> {
  const r: Partial<Boosters> = { undo: 1 };
  if (stars >= 3) r.hint = 1;
  if (level % 5 === 0) {
    r.shuffle = 1;
    r.hint = (r.hint ?? 0) + 1;
  }
  return r;
}

export function addBoosters(a: Boosters, b: Partial<Boosters>): Boosters {
  return {
    hint: Math.min(BOOSTER_MAX, a.hint + (b.hint ?? 0)),
    shuffle: Math.min(BOOSTER_MAX, a.shuffle + (b.shuffle ?? 0)),
    undo: Math.min(BOOSTER_MAX, a.undo + (b.undo ?? 0)),
  };
}

/** Kombo: hızlı ardışık eşleşmeler daha çok puan verir */
export const COMBO_WINDOW_MS = 6000;
export const BASE_POINTS = 10;
export const MAX_COMBO_MULTIPLIER = 5;
export const COMPLETE_BONUS = 100;
