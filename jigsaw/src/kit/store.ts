/** Cihazda kalıcı kayıt (ilerleme, ayarlar, yarım oyun) */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LangSetting } from './i18n';

export interface BaseSettings {
  sound: boolean;
  haptics: boolean;
  language: LangSetting;
  /** Uygulamaya özel açık/kapalı ayarlar */
  [key: string]: boolean | LangSetting;
}

export const START_HINTS = 3;
export const MAX_HINTS = 99;

export async function load<T>(key: string, defaults: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaults;
    const v = JSON.parse(raw);
    if (defaults && typeof defaults === 'object' && !Array.isArray(defaults)) return { ...defaults, ...v };
    return v as T;
  } catch {
    return defaults;
  }
}

export async function save<T>(key: string, value: T | null): Promise<void> {
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // kaydedilemezse oyun yine de devam etsin
  }
}

/** Yardım kullanımına göre yıldız: hiç = 3, 1-2 = 2, daha fazla = 1 */
export function starsFor(help: number): number {
  if (help <= 0) return 3;
  if (help <= 2) return 2;
  return 1;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

export function dateSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
