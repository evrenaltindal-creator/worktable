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
  stuckBody: 'Taşları ücretsiz karıştırıp devam edebilirsiniz.',
  freeShuffle: 'Ücretsiz karıştır',
  noHint: 'Şu an eşleşme yok, karıştırmayı deneyin.',
  points: (n: number) => `${n} puan`,
  combo: (c: number) => `${c >= 5 ? 'Muhteşem!' : c === 4 ? 'Süper!' : c === 3 ? 'Harika!' : 'Güzel!'} x${c}`,
  booster: { hint: 'İpucu', shuffle: 'Karıştır', undo: 'Geri al' },
  outOf: (name: string) => `${name} hakkınız kalmadı. Yeni seviyeleri bitirerek kazanırsınız.`,
  reward: 'Ödül',
  rewardItem: (name: string, n: number) => `+${n} ${name}`,
  replayNoReward: 'Bu seviyenin ödülünü daha önce aldınız.',
  sound: 'Ses efektleri',
  haptics: 'Titreşim',
  highlightFree: 'Seçilebilir taşları belirgin yap',
  on: 'Açık',
  off: 'Kapalı',
  rules: [
    'Aynı resme sahip iki taşa dokunun; ikisi birden kalkar.',
    'Sadece serbest taşlar seçilebilir: üstünde taş olmamalı ve sağ ya da sol yanı boş olmalı.',
    'Herhangi iki çiçek taşı ve herhangi iki mevsim taşı birbiriyle eşleşir.',
    'İpucu, Karıştır ve Geri al haklarınız sınırlıdır; sayıları düğmelerin köşesinde yazar. Yeni seviyeleri bitirdikçe yeni haklar kazanırsınız.',
    'Art arda hızlı eşleştirirseniz kombo yapar, daha çok puan alırsınız.',
    'Hiç yardım almadan bitirirseniz 3 yıldız ve ek ipucu kazanırsınız. Süre sınırı yok.',
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
  stuckBody: 'Shuffle the tiles for free to keep playing.',
  freeShuffle: 'Free shuffle',
  noHint: 'No matches right now, try shuffling.',
  points: (n) => `${n} pts`,
  combo: (c) => `${c >= 5 ? 'Amazing!' : c === 4 ? 'Super!' : c === 3 ? 'Great!' : 'Nice!'} x${c}`,
  booster: { hint: 'Hint', shuffle: 'Shuffle', undo: 'Undo' },
  outOf: (name) => `No ${name} left. Finish new levels to earn more.`,
  reward: 'Reward',
  rewardItem: (name, n) => `+${n} ${name}`,
  replayNoReward: 'You already collected this level\'s reward.',
  sound: 'Sound effects',
  haptics: 'Vibration',
  highlightFree: 'Highlight playable tiles',
  on: 'On',
  off: 'Off',
  rules: [
    'Tap two tiles with the same picture to remove them.',
    'Only free tiles can be picked: nothing on top, and an open left or right side.',
    'Any two flower tiles match, and any two season tiles match.',
    'Hints, shuffles and undos are limited; the count is on each button. Finish new levels to earn more.',
    'Match quickly in a row to build a combo and score more points.',
    'Finish without any help for 3 stars and a bonus hint. There is no timer.',
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
