/**
 * Oyunun tüm metinleri: Türkçe, İngilizce, Portekizce (Brezilya), Almanca,
 * Fransızca, Japonca, Korece.
 *
 * Dil, telefonun diline göre otomatik seçilir; oyuncu Ayarlar'dan değiştirebilir.
 * Desteklenmeyen bir telefon dilinde İngilizce açılır.
 */
import { getLocales } from 'expo-localization';

export type Lang = 'tr' | 'en' | 'pt' | 'de' | 'fr' | 'ja' | 'ko';
export type LangSetting = Lang | 'auto';

/** Ayarlar'daki dil listesi: her dil kendi adıyla yazılır. */
export const LANGUAGES: { code: Lang; name: string }[] = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

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
  outOf: {
    hint: 'İpucu hakkınız kalmadı. Yeni seviyeleri bitirerek kazanırsınız.',
    shuffle: 'Karıştırma hakkınız kalmadı. Yeni seviyeleri bitirerek kazanırsınız.',
    undo: 'Geri alma hakkınız kalmadı. Yeni seviyeleri bitirerek kazanırsınız.',
  },
  reward: 'Ödül',
  rewardItem: (name: string, n: number) => `+${n} ${name}`,
  replayNoReward: 'Bu seviyenin ödülünü daha önce aldınız.',
  sound: 'Ses efektleri',
  haptics: 'Titreşim',
  highlightFree: 'Seçilebilir taşları belirgin yap',
  language: 'Dil',
  languageAuto: 'Telefonun dili',
  on: 'Açık',
  off: 'Kapalı',
  rules: [
    'Aynı resme sahip iki taşa dokunun; ikisi birden kalkar.',
    'Sadece serbest taşlar seçilebilir: üstünde taş olmamalı ve sağ ya da sol yanı boş olmalı.',
    'Herhangi iki çiçek taşı ve herhangi iki mevsim taşı birbiriyle eşleşir.',
    'İpucu, Karıştır ve Geri al haklarınız sınırlıdır; sayıları düğmelerin köşesinde yazar. Yeni seviyeleri bitirdikçe yeni haklar kazanırsınız.',
    'Art arda hızlı eşleştirirseniz kombo yapar, daha çok puan alırsınız.',
    'İpucu ve karıştırma kullanmadan bitirirseniz 3 yıldız ve ek ipucu kazanırsınız. Süre sınırı yok.',
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
  outOf: {
    hint: 'No hints left. Finish new levels to earn more.',
    shuffle: 'No shuffles left. Finish new levels to earn more.',
    undo: 'No undos left. Finish new levels to earn more.',
  },
  reward: 'Reward',
  rewardItem: (name, n) => `+${n} ${name}`,
  replayNoReward: "You already collected this level's reward.",
  sound: 'Sound effects',
  haptics: 'Vibration',
  highlightFree: 'Highlight playable tiles',
  language: 'Language',
  languageAuto: 'Phone language',
  on: 'On',
  off: 'Off',
  rules: [
    'Tap two tiles with the same picture to remove them.',
    'Only free tiles can be picked: nothing on top, and an open left or right side.',
    'Any two flower tiles match, and any two season tiles match.',
    'Hints, shuffles and undos are limited; the count is on each button. Finish new levels to earn more.',
    'Match quickly in a row to build a combo and score more points.',
    'Finish without hints or shuffles for 3 stars and a bonus hint. There is no timer.',
  ],
  locked: 'Locked',
};

/** Portekizce (Brezilya) */
const pt: Strings = {
  appName: 'Huzur Mahjong',
  tagline: 'Um jogo tranquilo de combinar peças grandes',
  play: 'Jogar',
  continueLevel: (n) => `Nível ${n}`,
  levels: 'Níveis',
  settings: 'Configurações',
  howToPlay: 'Como jogar?',
  level: (n) => `Nível ${n}`,
  tilesLeft: (n) => `${n} peças`,
  undo: 'Desfazer',
  hint: 'Dica',
  shuffle: 'Misturar',
  restart: 'Reiniciar',
  home: 'Início',
  back: 'Voltar',
  close: 'Fechar',
  winTitle: 'Parabéns!',
  winBody: (n) => `Nível ${n} concluído`,
  time: (t) => `Tempo: ${t}`,
  nextLevel: 'Próximo nível',
  allDone: 'Você concluiu todos os níveis!',
  stuckTitle: 'Sem pares disponíveis',
  stuckBody: 'Misture as peças de graça para continuar.',
  freeShuffle: 'Misturar grátis',
  noHint: 'Nenhum par agora. Tente misturar.',
  points: (n) => `${n} pontos`,
  combo: (c) => `${c >= 5 ? 'Fantástico!' : c === 4 ? 'Incrível!' : c === 3 ? 'Ótimo!' : 'Boa!'} x${c}`,
  booster: { hint: 'Dica', shuffle: 'Misturar', undo: 'Desfazer' },
  outOf: {
    hint: 'Suas dicas acabaram. Conclua novos níveis para ganhar mais.',
    shuffle: 'Suas misturas acabaram. Conclua novos níveis para ganhar mais.',
    undo: 'Suas jogadas de desfazer acabaram. Conclua novos níveis para ganhar mais.',
  },
  reward: 'Recompensa',
  rewardItem: (name, n) => `+${n} ${name}`,
  replayNoReward: 'Você já recebeu a recompensa deste nível.',
  sound: 'Efeitos sonoros',
  haptics: 'Vibração',
  highlightFree: 'Destacar peças jogáveis',
  language: 'Idioma',
  languageAuto: 'Idioma do telefone',
  on: 'Ligado',
  off: 'Desligado',
  rules: [
    'Toque em duas peças com o mesmo desenho para removê-las.',
    'Só é possível escolher peças livres: sem nada por cima e com o lado esquerdo ou direito livre.',
    'Quaisquer duas peças de flor combinam entre si, assim como quaisquer duas peças de estação.',
    'Dicas, misturas e desfazer são limitados; a quantidade aparece no canto de cada botão. Conclua novos níveis para ganhar mais.',
    'Combine pares rapidamente em sequência para fazer combos e ganhar mais pontos.',
    'Termine sem dicas nem misturar para ganhar 3 estrelas e uma dica extra. Não há limite de tempo.',
  ],
  locked: 'Bloqueado',
};

const de: Strings = {
  appName: 'Huzur Mahjong',
  tagline: 'Ein entspanntes Legespiel mit großen Steinen',
  play: 'Spielen',
  continueLevel: (n) => `Level ${n}`,
  levels: 'Levelauswahl',
  settings: 'Einstellungen',
  howToPlay: 'Spielanleitung',
  level: (n) => `Level ${n}`,
  tilesLeft: (n) => `${n} Steine`,
  undo: 'Zurück',
  hint: 'Tipp',
  shuffle: 'Mischen',
  restart: 'Neustart',
  home: 'Startseite',
  back: 'Zurück',
  close: 'Schließen',
  winTitle: 'Glückwunsch!',
  winBody: (n) => `Level ${n} geschafft`,
  time: (t) => `Zeit: ${t}`,
  nextLevel: 'Nächstes Level',
  allDone: 'Du hast alle Level geschafft!',
  stuckTitle: 'Keine Paare mehr',
  stuckBody: 'Mische die Steine kostenlos, um weiterzuspielen.',
  freeShuffle: 'Gratis mischen',
  noHint: 'Gerade ist kein Paar möglich. Versuche zu mischen.',
  points: (n) => `${n} Punkte`,
  combo: (c) => `${c >= 5 ? 'Fantastisch!' : c === 4 ? 'Super!' : c === 3 ? 'Klasse!' : 'Gut!'} x${c}`,
  booster: { hint: 'Tipp', shuffle: 'Mischen', undo: 'Zurück' },
  outOf: {
    hint: 'Keine Tipps mehr. Schaffe neue Level, um mehr zu bekommen.',
    shuffle: 'Kein Mischen mehr übrig. Schaffe neue Level, um mehr zu bekommen.',
    undo: 'Kein Zurück mehr übrig. Schaffe neue Level, um mehr zu bekommen.',
  },
  reward: 'Belohnung',
  rewardItem: (name, n) => `+${n} ${name}`,
  replayNoReward: 'Die Belohnung für dieses Level hast du schon erhalten.',
  sound: 'Soundeffekte',
  haptics: 'Vibration',
  highlightFree: 'Spielbare Steine hervorheben',
  language: 'Sprache',
  languageAuto: 'Sprache des Telefons',
  on: 'An',
  off: 'Aus',
  rules: [
    'Tippe zwei Steine mit demselben Bild an, um sie zu entfernen.',
    'Nur freie Steine sind wählbar: Nichts darf darauf liegen, und die linke oder rechte Seite muss frei sein.',
    'Zwei beliebige Blumensteine passen zusammen, ebenso zwei beliebige Jahreszeitensteine.',
    'Tipps, Mischen und Zurück sind begrenzt; die Anzahl steht in der Ecke jedes Knopfes. Mit neuen Leveln verdienst du mehr.',
    'Finde Paare schnell hintereinander für Kombos und mehr Punkte.',
    'Schaffe ein Level ohne Tipp und ohne Mischen für 3 Sterne und einen Extra-Tipp. Es gibt kein Zeitlimit.',
  ],
  locked: 'Gesperrt',
};

/** Fransızcada ünlem/iki nokta öncesi boşluk bölünmesin diye bölünmez boşluk ( ) */
const fr: Strings = {
  appName: 'Huzur Mahjong',
  tagline: 'Un jeu d’association apaisant aux grandes tuiles',
  play: 'Jouer',
  continueLevel: (n) => `Niveau ${n}`,
  levels: 'Niveaux',
  settings: 'Réglages',
  howToPlay: 'Comment jouer ?',
  level: (n) => `Niveau ${n}`,
  tilesLeft: (n) => `${n} tuiles`,
  undo: 'Annuler',
  hint: 'Indice',
  shuffle: 'Mélanger',
  restart: 'Recommencer',
  home: 'Accueil',
  back: 'Retour',
  close: 'Fermer',
  winTitle: 'Bravo !',
  winBody: (n) => `Niveau ${n} terminé`,
  time: (t) => `Temps : ${t}`,
  nextLevel: 'Niveau suivant',
  allDone: 'Vous avez terminé tous les niveaux !',
  stuckTitle: 'Plus de paires',
  stuckBody: 'Mélangez les tuiles gratuitement pour continuer.',
  freeShuffle: 'Mélange gratuit',
  noHint: 'Aucune paire pour le moment. Essayez de mélanger.',
  points: (n) => `${n} points`,
  combo: (c) => `${c >= 5 ? 'Incroyable !' : c === 4 ? 'Super !' : c === 3 ? 'Génial !' : 'Bien !'} x${c}`,
  booster: { hint: 'Indice', shuffle: 'Mélange', undo: 'Annulation' },
  outOf: {
    hint: 'Plus d’indices. Terminez de nouveaux niveaux pour en gagner.',
    shuffle: 'Plus de mélanges. Terminez de nouveaux niveaux pour en gagner.',
    undo: 'Plus d’annulations. Terminez de nouveaux niveaux pour en gagner.',
  },
  reward: 'Récompense',
  rewardItem: (name, n) => `+${n} ${name}`,
  replayNoReward: 'Vous avez déjà reçu la récompense de ce niveau.',
  sound: 'Effets sonores',
  haptics: 'Vibrations',
  highlightFree: 'Mettre en évidence les tuiles jouables',
  language: 'Langue',
  languageAuto: 'Langue du téléphone',
  on: 'Activé',
  off: 'Désactivé',
  rules: [
    'Touchez deux tuiles identiques pour les retirer.',
    'Seules les tuiles libres peuvent être choisies : rien dessus, et un côté gauche ou droit dégagé.',
    'Deux tuiles fleur quelconques vont ensemble, tout comme deux tuiles saison quelconques.',
    'Les indices, mélanges et annulations sont limités ; leur nombre est indiqué sur chaque bouton. Terminez de nouveaux niveaux pour en gagner.',
    'Enchaînez les paires rapidement pour faire des combos et gagner plus de points.',
    'Terminez sans indice ni mélange pour obtenir 3 étoiles et un indice bonus. Pas de limite de temps.',
  ],
  locked: 'Verrouillé',
};

const ja: Strings = {
  appName: 'Huzur Mahjong',
  tagline: '大きな牌でゆったり遊べる牌合わせゲーム',
  play: 'プレイ',
  continueLevel: (n) => `レベル ${n}`,
  levels: 'レベル選択',
  settings: '設定',
  howToPlay: '遊び方',
  level: (n) => `レベル ${n}`,
  tilesLeft: (n) => `残り ${n} 枚`,
  undo: '戻す',
  hint: 'ヒント',
  shuffle: 'シャッフル',
  restart: 'やり直す',
  home: 'ホーム',
  back: '戻る',
  close: '閉じる',
  winTitle: 'おめでとう！',
  winBody: (n) => `レベル ${n} クリア`,
  time: (t) => `タイム: ${t}`,
  nextLevel: '次のレベル',
  allDone: '全レベルクリア！',
  stuckTitle: 'ペアがありません',
  stuckBody: '無料でシャッフルして続けられます。',
  freeShuffle: '無料シャッフル',
  noHint: '今はペアがありません。シャッフルしてみましょう。',
  points: (n) => `${n} 点`,
  combo: (c) => `${c >= 5 ? '完璧！' : c === 4 ? '最高！' : c === 3 ? 'すごい！' : 'いいね！'} x${c}`,
  booster: { hint: 'ヒント', shuffle: 'シャッフル', undo: '戻す' },
  outOf: {
    hint: 'ヒントが残っていません。新しいレベルをクリアすると増えます。',
    shuffle: 'シャッフルが残っていません。新しいレベルをクリアすると増えます。',
    undo: '戻すが残っていません。新しいレベルをクリアすると増えます。',
  },
  reward: 'ごほうび',
  rewardItem: (name, n) => `${name} +${n}`,
  replayNoReward: 'このレベルのごほうびは受け取り済みです。',
  sound: '効果音',
  haptics: '振動',
  highlightFree: '選べる牌を目立たせる',
  language: '言語',
  languageAuto: '端末の言語',
  on: 'オン',
  off: 'オフ',
  rules: [
    '同じ絵柄の牌を2つタップすると消えます。',
    '選べるのは自由な牌だけです。上に牌がなく、左か右が空いている必要があります。',
    '花の牌はどれ同士でも、季節の牌もどれ同士でもペアになります。',
    'ヒント・シャッフル・戻すは回数に限りがあり、残り回数はボタンの角に表示されます。新しいレベルをクリアすると増えます。',
    'すばやく続けてペアを消すとコンボになり、点数が増えます。',
    'ヒントとシャッフルを使わずにクリアすると、星3つとヒント1回分がもらえます。時間制限はありません。',
  ],
  locked: 'ロック中',
};

const ko: Strings = {
  appName: 'Huzur Mahjong',
  tagline: '큰 타일로 편안하게 즐기는 짝 맞추기 게임',
  play: '플레이',
  continueLevel: (n) => `레벨 ${n}`,
  levels: '레벨 선택',
  settings: '설정',
  howToPlay: '게임 방법',
  level: (n) => `레벨 ${n}`,
  tilesLeft: (n) => `${n}개 남음`,
  undo: '되돌리기',
  hint: '힌트',
  shuffle: '섞기',
  restart: '다시 시작',
  home: '홈',
  back: '뒤로',
  close: '닫기',
  winTitle: '축하해요!',
  winBody: (n) => `레벨 ${n} 완료`,
  time: (t) => `시간: ${t}`,
  nextLevel: '다음 레벨',
  allDone: '모든 레벨을 완료했어요!',
  stuckTitle: '맞출 짝이 없어요',
  stuckBody: '무료로 섞고 계속할 수 있어요.',
  freeShuffle: '무료 섞기',
  noHint: '지금은 짝이 없어요. 섞어 보세요.',
  points: (n) => `${n}점`,
  combo: (c) => `${c >= 5 ? '완벽해요!' : c === 4 ? '최고예요!' : c === 3 ? '훌륭해요!' : '좋아요!'} x${c}`,
  booster: { hint: '힌트', shuffle: '섞기', undo: '되돌리기' },
  outOf: {
    hint: '힌트가 남아 있지 않아요. 새 레벨을 완료하면 더 받을 수 있어요.',
    shuffle: '섞기가 남아 있지 않아요. 새 레벨을 완료하면 더 받을 수 있어요.',
    undo: '되돌리기가 남아 있지 않아요. 새 레벨을 완료하면 더 받을 수 있어요.',
  },
  reward: '보상',
  rewardItem: (name, n) => `${name} +${n}`,
  replayNoReward: '이 레벨의 보상은 이미 받았어요.',
  sound: '효과음',
  haptics: '진동',
  highlightFree: '선택 가능한 타일 강조',
  language: '언어',
  languageAuto: '휴대폰 언어',
  on: '켜짐',
  off: '꺼짐',
  rules: [
    '같은 그림의 타일 두 개를 누르면 사라집니다.',
    '자유로운 타일만 고를 수 있어요. 위에 다른 타일이 없고, 왼쪽이나 오른쪽이 비어 있어야 합니다.',
    '꽃 타일끼리는 어떤 것이든 짝이 되고, 계절 타일끼리도 마찬가지입니다.',
    '힌트, 섞기, 되돌리기는 횟수가 정해져 있고, 남은 횟수는 버튼 모서리에 표시됩니다. 새 레벨을 완료하면 더 받을 수 있어요.',
    '빠르게 연속으로 짝을 맞추면 콤보가 되어 점수가 더 올라갑니다.',
    '힌트와 섞기 없이 완료하면 별 3개와 보너스 힌트를 받아요. 시간 제한은 없습니다.',
  ],
  locked: '잠김',
};

const STRINGS: Record<Lang, Strings> = { tr, en, pt, de, fr, ja, ko };

/** Telefonun tercih ettiği diller arasından desteklenen ilkini seçer; yoksa İngilizce. */
export function deviceLanguage(): Lang {
  try {
    for (const l of getLocales()) {
      const code = l.languageCode as Lang | null;
      if (code && code in STRINGS) return code;
    }
  } catch {
    // dil okunamazsa İngilizce
  }
  return 'en';
}

let current: Strings = STRINGS[deviceLanguage()];
let currentLang: Lang = deviceLanguage();

/** Ayarlardan dil değiştirme ('auto' = telefonun dili) */
export function setLanguage(choice: LangSetting): Lang {
  currentLang = choice === 'auto' ? deviceLanguage() : choice;
  current = STRINGS[currentLang];
  return currentLang;
}

export function currentLanguage(): Lang {
  return currentLang;
}

/**
 * Metinler: her okuma o anki dili kullanır, böylece dil değişince
 * ekranlar yeniden çizildiğinde yeni dil görünür.
 */
export const t: Strings = new Proxy({} as Strings, {
  get: (_target, key: string) => current[key as keyof Strings],
});

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
