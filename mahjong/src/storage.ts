import AsyncStorage from '@react-native-async-storage/async-storage';
import { Boosters, START_BOOSTERS } from './boosters';
import { FaceId } from './game/tiles';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  highlightFree: boolean;
}

export interface Progress {
  /** Açılmış en yüksek seviye */
  unlocked: number;
  /** Bitirilen seviyeler -> en iyi süre (saniye) */
  best: Record<number, number>;
  /** Bitirilen seviyeler -> en iyi yıldız (1-3) */
  stars: Record<number, number>;
  boosters: Boosters;
  settings: Settings;
}

/** Yarım kalan oyun: uygulama kapansa bile kaldığı yerden devam eder. */
export interface SavedGame {
  level: number;
  faces: FaceId[];
  present: boolean[];
  history: [number, number][];
  elapsed: number;
  shuffles: number;
  score?: number;
  /** Her eşleşmenin kazandırdığı puan (geri alınca düşülür) */
  gains?: number[];
  hintsUsed?: number;
  shufflesUsed?: number;
}

const PROGRESS_KEY = 'huzur:progress:v1';
const GAME_KEY = 'huzur:game:v1';

export const DEFAULT_PROGRESS: Progress = {
  unlocked: 1,
  best: {},
  stars: {},
  boosters: START_BOOSTERS,
  settings: { sound: true, haptics: true, highlightFree: true },
};

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      unlocked: Math.max(1, p.unlocked ?? 1),
      best: p.best ?? {},
      stars: p.stars ?? {},
      boosters: { ...START_BOOSTERS, ...(p.boosters ?? {}) },
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
    // Kaydedilemezse oyun yine de devam etsin
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
