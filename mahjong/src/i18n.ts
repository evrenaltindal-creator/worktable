import { getLocales } from 'expo-localization';

const tr = {
  appName: 'Huzur Mahjong',
  tagline: 'Sakin, büyük taşlı eşleştirme oyunu',
  play: 'Oyna',
  continueLevel: (n: number) => `Seviye ${n}`,
  levels: 'Seviyeler',
  settings: 'Ayarlar',
  howToPlay: 'Nasıl oynanır?',
  level: (n: number) => `Seviye ${n}`,
  tilesLeft: (n: number) => `${n} taş`,
  undo: 'Geri al',
  hint: 'İpucu',
  shuffle: 'Karıştır',
  restart: 'Baştan',
  home: 'Ana sayfa',
  back: 'Geri',
  close: 'Kapat',
  winTitle: 'Tebrikler!',
  winBody: (n: number) => `Seviye ${n} tamamlandı`,
  time: (t: string) => `Süre: ${t}`,
  nextLevel: 'Sonraki seviye',
  allDone: 'Tüm seviyeleri bitirdiniz!',
  stuckTitle: 'Eşleşme kalmadı',
  stuckBody: 'Taşları karıştırarak devam edebilirsiniz.',
  noHint: 'Şu an eşleşme yok, karıştırmayı deneyin.',
  sound: 'Ses efektleri',
  haptics: 'Titreşim',
  highlightFree: 'Seçilebilir taşları belirgin yap',
  on: 'Açık',
  off: 'Kapalı',
  rules: [
    'Aynı resme sahip iki taşa dokunun; ikisi birden kalkar.',
    'Sadece serbest taşlar seçilebilir: üstünde taş olmamalı ve sağ ya da sol yanı boş olmalı.',
    'Herhangi iki çiçek taşı ve herhangi iki mevsim taşı birbiriyle eşleşir.',
    'Takılırsanız İpucu, Geri al ve Karıştır düğmelerini dilediğiniz kadar kullanabilirsiniz.',
    'Tüm taşları kaldırınca seviye biter. Acele yok, süre sınırı yok.',
  ],
  locked: 'Kilitli',
};

export type Strings = typeof tr;

const en: Strings = {
  appName: 'Huzur Mahjong',
  tagline: 'A calm tile-matching game with big tiles',
  play: 'Play',
  continueLevel: (n) => `Level ${n}`,
  levels: 'Levels',
  settings: 'Settings',
  howToPlay: 'How to play',
  level: (n) => `Level ${n}`,
  tilesLeft: (n) => `${n} tiles`,
  undo: 'Undo',
  hint: 'Hint',
  shuffle: 'Shuffle',
  restart: 'Restart',
  home: 'Home',
  back: 'Back',
  close: 'Close',
  winTitle: 'Well done!',
  winBody: (n) => `Level ${n} complete`,
  time: (t) => `Time: ${t}`,
  nextLevel: 'Next level',
  allDone: 'You finished every level!',
  stuckTitle: 'No matches left',
  stuckBody: 'Shuffle the tiles to keep playing.',
  noHint: 'No matches right now, try shuffling.',
  sound: 'Sound effects',
  haptics: 'Vibration',
  highlightFree: 'Highlight playable tiles',
  on: 'On',
  off: 'Off',
  rules: [
    'Tap two tiles with the same picture to remove them.',
    'Only free tiles can be picked: nothing on top, and an open left or right side.',
    'Any two flower tiles match, and any two season tiles match.',
    'Stuck? Hint, Undo and Shuffle are always free to use.',
    'Clear every tile to finish the level. No rush, no timer pressure.',
  ],
  locked: 'Locked',
};

function pick(): Strings {
  try {
    const lang = getLocales()[0]?.languageCode ?? 'tr';
    return lang === 'tr' ? tr : en;
  } catch {
    return tr;
  }
}

export const t: Strings = pick();

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
