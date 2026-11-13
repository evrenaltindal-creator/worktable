import { FxName, SCENES } from './images';

/**
 * Tema sahneleri: her 10 seviyede bir değişir. Her temanın arka plan resmi ve
 * üzerinde süzülen parçacıkları vardır.
 */
export type Motion = 'fall' | 'rise' | 'glide' | 'twinkle';

export interface ParticleSpec {
  sprite: FxName;
  motion: Motion;
  count: number;
  /** Ekran genişliğine göre boyut (0-1) */
  size: [number, number];
  /** Bir tur süresi (ms) */
  duration: [number, number];
  /** Dikey bant (0 = üst, 1 = alt) — glide/twinkle için */
  band?: [number, number];
  opacity?: number;
}

export interface Theme {
  id: keyof typeof SCENES;
  /** Resim yüklenene kadar görünen renkler */
  top: string;
  bottom: string;
  particles: ParticleSpec[];
}

export const THEMES: Theme[] = [
  {
    id: 'spring',
    top: '#2C8FC9',
    bottom: '#3C8C46',
    particles: [
      { sprite: 'petal', motion: 'fall', count: 10, size: [0.035, 0.06], duration: [9000, 15000], opacity: 0.95 },
      { sprite: 'sparkle', motion: 'twinkle', count: 4, size: [0.05, 0.08], duration: [2200, 3600], band: [0.05, 0.4], opacity: 0.9 },
    ],
  },
  {
    id: 'sunset',
    top: '#24164F',
    bottom: '#1B0B26',
    particles: [
      { sprite: 'gull', motion: 'glide', count: 3, size: [0.07, 0.11], duration: [16000, 26000], band: [0.08, 0.4], opacity: 0.9 },
      { sprite: 'glow', motion: 'rise', count: 8, size: [0.04, 0.07], duration: [12000, 20000], opacity: 0.85 },
    ],
  },
  {
    id: 'dawn',
    top: '#34477F',
    bottom: '#7A3A2E',
    particles: [
      { sprite: 'balloonRed', motion: 'rise', count: 2, size: [0.08, 0.12], duration: [22000, 32000] },
      { sprite: 'balloonBlue', motion: 'rise', count: 2, size: [0.06, 0.1], duration: [24000, 34000] },
      { sprite: 'balloonGreen', motion: 'rise', count: 2, size: [0.05, 0.09], duration: [26000, 36000] },
    ],
  },
  {
    id: 'sea',
    top: '#1976D2',
    bottom: '#063F6E',
    particles: [
      { sprite: 'boat', motion: 'glide', count: 2, size: [0.09, 0.13], duration: [30000, 42000], band: [0.8, 0.9] },
      { sprite: 'gull', motion: 'glide', count: 2, size: [0.06, 0.09], duration: [18000, 26000], band: [0.1, 0.35], opacity: 0.95 },
      { sprite: 'sparkle', motion: 'twinkle', count: 6, size: [0.03, 0.06], duration: [1800, 3200], band: [0.8, 0.98], opacity: 0.9 },
    ],
  },
];

export function themeForLevel(level: number): Theme {
  return THEMES[Math.floor((Math.max(1, level) - 1) / 10) % THEMES.length];
}
