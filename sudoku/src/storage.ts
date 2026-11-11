import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './game/sudoku';
import type { LangSetting } from './i18n';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  showMistakes: boolean;
  highlightSame: boolean;
  language: LangSetting;
}

export interface Progress {
  /** Her zorlukta oynanacak sıradaki bulmaca numarası */
  next: Record<Difficulty, number>;
  /** "easy-3" -> en iyi yıldız */
  stars: Record<string, number>;
  hints: number;
  /** Günün sudokusu: tarih -> yıldız */
  daily: Record<string, number>;
  settings: Settings;
}

/** Yarım kalan bulmaca: uygulama kapansa da kaldığı yerden devam eder */
export interface SavedGame {
  difficulty: Difficulty;
  number: number;
  /** Günün sudokusu ise tarih */
  dailyKey?: string;
  values: number[];
  notes: number[];
  mistakes: number;
  hintsUsed: number;
  elapsed: number;
}

const PROGRESS_KEY = 'huzur-sudoku:progress:v1';
const GAME_KEY = 'huzur-sudoku:game:v1';
export const START_HINTS = 3;
export const MAX_HINTS = 99;

export const DEFAULT_PROGRESS: Progress = {
  next: { easy: 1, medium: 1, hard: 1, expert: 1 },
  stars: {},
  hints: START_HINTS,
  daily: {},
  settings: { sound: true, haptics: true, showMistakes: true, highlightSame: true, language: 'auto' },
};

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      next: { ...DEFAULT_PROGRESS.next, ...(p.next ?? {}) },
      stars: p.stars ?? {},
      hints: p.hints ?? START_HINTS,
      daily: p.daily ?? {},
      settings: { ...DEFAULT_PROGRESS.settings, ...(p.settings ?? {}) },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // kaydedilemezse oyun yine de devam etsin
  }
}

export async function loadGame(): Promise<SavedGame | null> {
  try {
    const raw = await AsyncStorage.getItem(GAME_KEY);
    return raw ? (JSON.parse(raw) as SavedGame) : null;
  } catch {
    return null;
  }
}

export async function saveGame(g: SavedGame | null): Promise<void> {
  try {
    if (g) await AsyncStorage.setItem(GAME_KEY, JSON.stringify(g));
    else await AsyncStorage.removeItem(GAME_KEY);
  } catch {
    // yok say
  }
}

/** Hata ve ipucu sayısına göre yıldız */
export function starsFor(mistakes: number, hints: number): number {
  const help = mistakes + hints;
  if (help === 0) return 3;
  if (help <= 2) return 2;
  return 1;
}
