/** Oyun modları: hepsi aynı taşlarla oynanır. */
import { FaceId } from './game/tiles';

export type ModeId = 'classic' | 'timed' | 'daily' | 'sum10' | 'triple' | 'connect' | 'memory' | 'peaks';

export interface ModeInfo {
  id: ModeId;
  /** Kartta görünen taşlar */
  icons: FaceId[];
  color: string;
  edge: string;
}

export const MODES: ModeInfo[] = [
  { id: 'classic', icons: ['dr', 'dr'], color: '#2A9D8F', edge: '#1C6E64' },
  { id: 'timed', icons: ['s2', 'b7'], color: '#E07A3F', edge: '#A9542A' },
  { id: 'daily', icons: ['f2', 's1'], color: '#C8507E', edge: '#923A5C' },
  { id: 'sum10', icons: ['d3', 'c7'], color: '#3C7DE0', edge: '#2A5AA6' },
  { id: 'triple', icons: ['b5', 'b5'], color: '#7A5AC8', edge: '#563B93' },
  { id: 'connect', icons: ['we', 'we'], color: '#2F8F5B', edge: '#1F6440' },
  { id: 'memory', icons: ['back', 'd9'], color: '#B5843A', edge: '#7F5C26' },
  { id: 'peaks', icons: ['c4', 'd5'], color: '#3F5BA8', edge: '#2B3F78' },
];

/** Günlük bulmaca için bugünün anahtarı (yerel saat) */
export function todayKey(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dateSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
