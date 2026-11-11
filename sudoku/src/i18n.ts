/**
 * Huzur Sudoku metinleri: Türkçe, İngilizce, Portekizce (Brezilya), Almanca,
 * Fransızca, Japonca, Korece. Dil telefon diline göre seçilir; Ayarlar'dan değişir.
 */
import { getLocales } from 'expo-localization';
import type { Difficulty } from './game/sudoku';

export type Lang = 'tr' | 'en' | 'pt' | 'de' | 'fr' | 'ja' | 'ko';
export type LangSetting = Lang | 'auto';

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
  appName: 'Huzur Sudoku',
  tagline: 'Büyük rakamlı, sakin sudoku',
  continueGame: 'Devam et',
  difficulty: { easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman' } as Record<Difficulty, string>,
  puzzle: (n: number) => `Bulmaca ${n}`,
  daily: 'Günün Sudokusu',
  dailyDone: 'Bugün tamamlandı',
  dailyNew: 'Yeni bulmaca',
  dailySolved: 'Günün sudokusu tamam! Yarın yenisi gelecek.',
  howToPlay: 'Nasıl oynanır?',
  settings: 'Ayarlar',
  close: 'Kapat',
  home: 'Ana sayfa',
  back: 'Geri',
  restart: 'Baştan',
  undo: 'Geri al',
  erase: 'Sil',
  notes: 'Not',
  hint: 'İpucu',
  outOfHints: 'İpucu hakkınız kalmadı. Her çözdüğünüz bulmaca 1 ipucu kazandırır.',
  selectCell: 'Önce boş bir kareye dokunun.',
  mistakes: (n: number) => `Hata: ${n}`,
  time: (s: string) => `Süre: ${s}`,
  winTitle: 'Tebrikler!',
  solved: 'Bulmaca çözüldü',
  nextPuzzle: 'Sonraki bulmaca',
  reward: '+1 İpucu kazandınız',
  restartTitle: 'Baştan başlansın mı?',
  restartBody: 'Bu bulmacadaki tüm hamleleriniz silinir.',
  restartYes: 'Evet, baştan başla',
  cancel: 'Vazgeç',
  sound: 'Ses efektleri',
  haptics: 'Titreşim',
  showMistakes: 'Hatalı rakamları kırmızı göster',
  highlightSame: 'Aynı rakamları vurgula',
  language: 'Dil',
  languageAuto: 'Telefonun dili',
  rules: [
    'Her satıra, her sütuna ve her 3x3 kutuya 1\'den 9\'a kadar rakamları birer kez yerleştirin.',
    'Bir kareye dokunun, sonra alttaki rakamlardan birine dokunun.',
    '"Not" açıkken yazdığınız rakamlar küçük not olarak girer; aklınızdaki adayları işaretlemek için kullanın.',
    'Yanlış rakamlar kırmızı görünür. "Geri al" ve "Sil" her zaman ücretsizdir.',
    'İpucu sınırlıdır; her çözdüğünüz bulmaca 1 ipucu kazandırır. Hatasız ve ipuçsuz bitirirseniz 3 yıldız alırsınız.',
  ],
};

export type Strings = typeof tr;

const en: Strings = {
  appName: 'Huzur Sudoku',
  tagline: 'Calm sudoku with big numbers',
  continueGame: 'Continue',
  difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' },
  puzzle: (n) => `Puzzle ${n}`,
  daily: 'Daily Sudoku',
  dailyDone: 'Done today',
  dailyNew: 'New puzzle',
  dailySolved: "Today's sudoku is done! A new one arrives tomorrow.",
  howToPlay: 'How to play',
  settings: 'Settings',
  close: 'Close',
  home: 'Home',
  back: 'Back',
  restart: 'Restart',
  undo: 'Undo',
  erase: 'Erase',
  notes: 'Notes',
  hint: 'Hint',
  outOfHints: 'No hints left. Every puzzle you solve earns 1 hint.',
  selectCell: 'First tap an empty square.',
  mistakes: (n) => `Mistakes: ${n}`,
  time: (s) => `Time: ${s}`,
  winTitle: 'Well done!',
  solved: 'Puzzle solved',
  nextPuzzle: 'Next puzzle',
  reward: 'You earned +1 hint',
  restartTitle: 'Start over?',
  restartBody: 'All your moves in this puzzle will be cleared.',
  restartYes: 'Yes, start over',
  cancel: 'Cancel',
  sound: 'Sound effects',
  haptics: 'Vibration',
  showMistakes: 'Show wrong numbers in red',
  highlightSame: 'Highlight matching numbers',
  language: 'Language',
  languageAuto: 'Phone language',
  rules: [
    'Place the numbers 1 to 9 once in every row, every column and every 3x3 box.',
    'Tap a square, then tap one of the numbers below.',
    'With "Notes" on, numbers go in as small notes; use them to mark the candidates you are considering.',
    'Wrong numbers show in red. "Undo" and "Erase" are always free.',
    'Hints are limited; every puzzle you solve earns 1 hint. Finish with no mistakes and no hints for 3 stars.',
  ],
};

const pt: Strings = {
  appName: 'Huzur Sudoku',
  tagline: 'Sudoku tranquilo com números grandes',
  continueGame: 'Continuar',
  difficulty: { easy: 'Fácil', medium: 'Médio', hard: 'Difícil', expert: 'Especialista' },
  puzzle: (n) => `Desafio ${n}`,
  daily: 'Sudoku do Dia',
  dailyDone: 'Feito hoje',
  dailyNew: 'Novo desafio',
  dailySolved: 'O sudoku de hoje está feito! Amanhã tem outro.',
  howToPlay: 'Como jogar?',
  settings: 'Configurações',
  close: 'Fechar',
  home: 'Início',
  back: 'Voltar',
  restart: 'Reiniciar',
  undo: 'Desfazer',
  erase: 'Apagar',
  notes: 'Notas',
  hint: 'Dica',
  outOfHints: 'Suas dicas acabaram. Cada desafio resolvido dá 1 dica.',
  selectCell: 'Primeiro toque em um quadrado vazio.',
  mistakes: (n) => `Erros: ${n}`,
  time: (s) => `Tempo: ${s}`,
  winTitle: 'Parabéns!',
  solved: 'Desafio resolvido',
  nextPuzzle: 'Próximo desafio',
  reward: 'Você ganhou +1 dica',
  restartTitle: 'Começar de novo?',
  restartBody: 'Todas as suas jogadas neste desafio serão apagadas.',
  restartYes: 'Sim, começar de novo',
  cancel: 'Cancelar',
  sound: 'Efeitos sonoros',
  haptics: 'Vibração',
  showMistakes: 'Mostrar números errados em vermelho',
  highlightSame: 'Destacar números iguais',
  language: 'Idioma',
  languageAuto: 'Idioma do telefone',
  rules: [
    'Coloque os números de 1 a 9 uma vez em cada linha, cada coluna e cada quadrado 3x3.',
    'Toque em um quadrado e depois em um dos números abaixo.',
    'Com "Notas" ligado, os números entram como anotações pequenas; use para marcar os candidatos.',
    'Números errados aparecem em vermelho. "Desfazer" e "Apagar" são sempre grátis.',
    'As dicas são limitadas; cada desafio resolvido dá 1 dica. Termine sem erros e sem dicas para ganhar 3 estrelas.',
  ],
};

const de: Strings = {
  appName: 'Huzur Sudoku',
  tagline: 'Entspanntes Sudoku mit großen Zahlen',
  continueGame: 'Weiterspielen',
  difficulty: { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', expert: 'Experte' },
  puzzle: (n) => `Rätsel ${n}`,
  daily: 'Tages-Sudoku',
  dailyDone: 'Heute gelöst',
  dailyNew: 'Neues Rätsel',
  dailySolved: 'Das heutige Sudoku ist gelöst! Morgen kommt ein neues.',
  howToPlay: 'Spielanleitung',
  settings: 'Einstellungen',
  close: 'Schließen',
  home: 'Startseite',
  back: 'Zurück',
  restart: 'Neustart',
  undo: 'Zurück',
  erase: 'Löschen',
  notes: 'Notizen',
  hint: 'Tipp',
  outOfHints: 'Keine Tipps mehr. Jedes gelöste Rätsel bringt 1 Tipp.',
  selectCell: 'Tippe zuerst ein leeres Feld an.',
  mistakes: (n) => `Fehler: ${n}`,
  time: (s) => `Zeit: ${s}`,
  winTitle: 'Glückwunsch!',
  solved: 'Rätsel gelöst',
  nextPuzzle: 'Nächstes Rätsel',
  reward: 'Du erhältst +1 Tipp',
  restartTitle: 'Neu beginnen?',
  restartBody: 'Alle deine Züge in diesem Rätsel werden gelöscht.',
  restartYes: 'Ja, neu beginnen',
  cancel: 'Abbrechen',
  sound: 'Soundeffekte',
  haptics: 'Vibration',
  showMistakes: 'Falsche Zahlen rot anzeigen',
  highlightSame: 'Gleiche Zahlen hervorheben',
  language: 'Sprache',
  languageAuto: 'Sprache des Telefons',
  rules: [
    'Setze die Zahlen 1 bis 9 in jede Zeile, jede Spalte und jedes 3x3-Feld genau einmal.',
    'Tippe ein Feld an und dann eine der Zahlen unten.',
    'Wenn „Notizen“ an ist, werden Zahlen als kleine Notizen eingetragen; so markierst du mögliche Zahlen.',
    'Falsche Zahlen werden rot angezeigt. „Zurück“ und „Löschen“ sind immer kostenlos.',
    'Tipps sind begrenzt; jedes gelöste Rätsel bringt 1 Tipp. Ohne Fehler und ohne Tipp gibt es 3 Sterne.',
  ],
};

const fr: Strings = {
  appName: 'Huzur Sudoku',
  tagline: 'Un sudoku apaisant aux grands chiffres',
  continueGame: 'Continuer',
  difficulty: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', expert: 'Expert' },
  puzzle: (n) => `Grille ${n}`,
  daily: 'Sudoku du jour',
  dailyDone: 'Fait aujourd’hui',
  dailyNew: 'Nouvelle grille',
  dailySolved: 'Le sudoku du jour est terminé ! Une nouvelle grille arrive demain.',
  howToPlay: 'Comment jouer ?',
  settings: 'Réglages',
  close: 'Fermer',
  home: 'Accueil',
  back: 'Retour',
  restart: 'Recommencer',
  undo: 'Annuler',
  erase: 'Effacer',
  notes: 'Notes',
  hint: 'Indice',
  outOfHints: 'Plus d’indices. Chaque grille résolue rapporte 1 indice.',
  selectCell: 'Touchez d’abord une case vide.',
  mistakes: (n) => `Erreurs : ${n}`,
  time: (s) => `Temps : ${s}`,
  winTitle: 'Bravo !',
  solved: 'Grille résolue',
  nextPuzzle: 'Grille suivante',
  reward: 'Vous gagnez +1 indice',
  restartTitle: 'Recommencer ?',
  restartBody: 'Tous vos coups dans cette grille seront effacés.',
  restartYes: 'Oui, recommencer',
  cancel: 'Annuler',
  sound: 'Effets sonores',
  haptics: 'Vibrations',
  showMistakes: 'Afficher les erreurs en rouge',
  highlightSame: 'Mettre en évidence les chiffres identiques',
  language: 'Langue',
  languageAuto: 'Langue du téléphone',
  rules: [
    'Placez les chiffres de 1 à 9 une fois dans chaque ligne, chaque colonne et chaque carré 3x3.',
    'Touchez une case, puis l’un des chiffres en bas.',
    'Quand « Notes » est activé, les chiffres sont notés en petit ; utilisez-les pour marquer les candidats.',
    'Les erreurs s’affichent en rouge. « Annuler » et « Effacer » sont toujours gratuits.',
    'Les indices sont limités ; chaque grille résolue en rapporte 1. Sans erreur ni indice, vous gagnez 3 étoiles.',
  ],
};

const ja: Strings = {
  appName: 'Huzur Sudoku',
  tagline: '大きな数字でゆったりナンプレ',
  continueGame: '続きから',
  difficulty: { easy: 'かんたん', medium: 'ふつう', hard: 'むずかしい', expert: '上級' },
  puzzle: (n) => `問題 ${n}`,
  daily: '今日のナンプレ',
  dailyDone: '今日はクリア済み',
  dailyNew: '新しい問題',
  dailySolved: '今日のナンプレをクリアしました！明日は新しい問題です。',
  howToPlay: '遊び方',
  settings: '設定',
  close: '閉じる',
  home: 'ホーム',
  back: '戻る',
  restart: 'やり直す',
  undo: '戻す',
  erase: '消す',
  notes: 'メモ',
  hint: 'ヒント',
  outOfHints: 'ヒントが残っていません。問題を1つ解くとヒントが1回増えます。',
  selectCell: 'まず空いているマスをタップしてください。',
  mistakes: (n) => `ミス ${n}`,
  time: (s) => `タイム ${s}`,
  winTitle: 'おめでとう！',
  solved: 'クリア',
  nextPuzzle: '次の問題',
  reward: 'ヒントが1回増えました',
  restartTitle: '最初からやり直しますか？',
  restartBody: 'この問題で入力した内容はすべて消えます。',
  restartYes: 'はい、やり直す',
  cancel: 'キャンセル',
  sound: '効果音',
  haptics: '振動',
  showMistakes: '間違った数字を赤く表示',
  highlightSame: '同じ数字を強調表示',
  language: '言語',
  languageAuto: '端末の言語',
  rules: [
    'どの行・列・3×3のブロックにも、1〜9の数字を1つずつ入れます。',
    'マスをタップしてから、下の数字をタップします。',
    '「メモ」をオンにすると、数字が小さなメモとして入ります。候補を書き込むのに使いましょう。',
    '間違った数字は赤く表示されます。「戻す」と「消す」はいつでも無料です。',
    'ヒントは回数に限りがあり、問題を1つ解くと1回増えます。ミスなし・ヒントなしでクリアすると星3つです。',
  ],
};

const ko: Strings = {
  appName: 'Huzur Sudoku',
  tagline: '큰 숫자로 편안하게 즐기는 스도쿠',
  continueGame: '이어하기',
  difficulty: { easy: '쉬움', medium: '보통', hard: '어려움', expert: '전문가' },
  puzzle: (n) => `퍼즐 ${n}`,
  daily: '오늘의 스도쿠',
  dailyDone: '오늘 완료',
  dailyNew: '새 퍼즐',
  dailySolved: '오늘의 스도쿠 완료! 내일 새 퍼즐이 나와요.',
  howToPlay: '게임 방법',
  settings: '설정',
  close: '닫기',
  home: '홈',
  back: '뒤로',
  restart: '다시 시작',
  undo: '되돌리기',
  erase: '지우기',
  notes: '메모',
  hint: '힌트',
  outOfHints: '힌트가 남아 있지 않아요. 퍼즐을 하나 풀 때마다 힌트 1개를 받아요.',
  selectCell: '먼저 빈칸을 누르세요.',
  mistakes: (n) => `실수 ${n}`,
  time: (s) => `시간 ${s}`,
  winTitle: '축하해요!',
  solved: '퍼즐 완료',
  nextPuzzle: '다음 퍼즐',
  reward: '힌트 1개를 받았어요',
  restartTitle: '처음부터 다시 할까요?',
  restartBody: '이 퍼즐에서 입력한 내용이 모두 지워져요.',
  restartYes: '네, 다시 시작',
  cancel: '취소',
  sound: '효과음',
  haptics: '진동',
  showMistakes: '틀린 숫자를 빨간색으로 표시',
  highlightSame: '같은 숫자 강조',
  language: '언어',
  languageAuto: '휴대폰 언어',
  rules: [
    '모든 가로줄, 세로줄, 3x3 칸에 1부터 9까지 숫자를 한 번씩 넣으세요.',
    '칸을 누른 다음 아래 숫자를 누르세요.',
    '"메모"를 켜면 숫자가 작은 메모로 들어가요. 후보 숫자를 표시할 때 쓰세요.',
    '틀린 숫자는 빨간색으로 보여요. "되돌리기"와 "지우기"는 언제나 무료예요.',
    '힌트는 횟수가 정해져 있고, 퍼즐을 하나 풀 때마다 1개를 받아요. 실수와 힌트 없이 끝내면 별 3개예요.',
  ],
};

const STRINGS: Record<Lang, Strings> = { tr, en, pt, de, fr, ja, ko };

export function deviceLanguage(): Lang {
  try {
    for (const l of getLocales()) {
      const code = l.languageCode as Lang | null;
      if (code && code in STRINGS) return code;
    }
  } catch {
    // okunamazsa İngilizce
  }
  return 'en';
}

let currentLang: Lang = deviceLanguage();
let current: Strings = STRINGS[currentLang];

export function setLanguage(choice: LangSetting): Lang {
  currentLang = choice === 'auto' ? deviceLanguage() : choice;
  current = STRINGS[currentLang];
  return currentLang;
}

export function currentLanguage(): Lang {
  return currentLang;
}

/** Her okuma o anki dili kullanır */
export const t: Strings = new Proxy({} as Strings, {
  get: (_target, key: string) => current[key as keyof Strings],
});

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h ? `${m}`.padStart(2, '0') : `${m}`;
  return `${h ? `${h}:` : ''}${mm}:${`${r}`.padStart(2, '0')}`;
}
