/**
 * Tüm Huzur oyunlarının ortak dil altyapısı ve ortak metinleri (7 dil).
 * Her uygulama kendi metinlerini texts() ile ekler.
 */
import { getLocales } from 'expo-localization';

export type Lang = 'tr' | 'en' | 'pt' | 'de' | 'fr' | 'ja' | 'ko';
export type LangSetting = Lang | 'auto';
export const LANGS: Lang[] = ['tr', 'en', 'pt', 'de', 'fr', 'ja', 'ko'];

export const LANGUAGES: { code: Lang; name: string }[] = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

export function deviceLanguage(): Lang {
  try {
    for (const l of getLocales()) {
      const code = l.languageCode as Lang | null;
      if (code && LANGS.includes(code)) return code;
    }
  } catch {
    // okunamazsa İngilizce
  }
  return 'en';
}

let currentLang: Lang = deviceLanguage();

export function setLanguage(choice: LangSetting): Lang {
  currentLang = choice === 'auto' ? deviceLanguage() : choice;
  return currentLang;
}

export function currentLanguage(): Lang {
  return currentLang;
}

/** Dile göre metin tablosu: her okuma o anki dili kullanır */
export function texts<T extends object>(table: Record<Lang, T>): T {
  return new Proxy({} as T, { get: (_t, key: string) => (table[currentLang] as Record<string, unknown>)[key] });
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${h ? `${h}:` : ''}${h ? `${m}`.padStart(2, '0') : m}:${`${r}`.padStart(2, '0')}`;
}

/** Ortak metinler */
export const c = texts({
  tr: {
    play: 'Oyna',
    continueGame: 'Devam et',
    level: (n: number) => `Seviye ${n}`,
    howToPlay: 'Nasıl oynanır?',
    settings: 'Ayarlar',
    close: 'Kapat',
    home: 'Ana sayfa',
    back: 'Geri',
    restart: 'Baştan',
    restartTitle: 'Baştan başlansın mı?',
    restartBody: 'Bu oyundaki ilerlemeniz silinir.',
    restartYes: 'Evet, baştan başla',
    cancel: 'Vazgeç',
    undo: 'Geri al',
    hint: 'İpucu',
    outOfHints: 'İpucu hakkınız kalmadı. Her kazandığınız oyun 1 ipucu kazandırır.',
    winTitle: 'Tebrikler!',
    next: 'Sonraki',
    tryAgain: 'Tekrar dene',
    time: (s: string) => `Süre: ${s}`,
    score: (n: number) => `${n} puan`,
    reward: '+1 İpucu kazandınız',
    daily: 'Günün Oyunu',
    dailyDone: 'Bugün tamamlandı',
    dailyNew: 'Yeni oyun',
    sound: 'Ses efektleri',
    haptics: 'Titreşim',
    language: 'Dil',
    languageAuto: 'Telefonun dili',
    best: (n: number) => `En iyi: ${n}`,
  },
  en: {
    play: 'Play',
    continueGame: 'Continue',
    level: (n: number) => `Level ${n}`,
    howToPlay: 'How to play',
    settings: 'Settings',
    close: 'Close',
    home: 'Home',
    back: 'Back',
    restart: 'Restart',
    restartTitle: 'Start over?',
    restartBody: 'Your progress in this game will be cleared.',
    restartYes: 'Yes, start over',
    cancel: 'Cancel',
    undo: 'Undo',
    hint: 'Hint',
    outOfHints: 'No hints left. Every game you win earns 1 hint.',
    winTitle: 'Well done!',
    next: 'Next',
    tryAgain: 'Try again',
    time: (s: string) => `Time: ${s}`,
    score: (n: number) => `${n} pts`,
    reward: 'You earned +1 hint',
    daily: 'Daily Game',
    dailyDone: 'Done today',
    dailyNew: 'New game',
    sound: 'Sound effects',
    haptics: 'Vibration',
    language: 'Language',
    languageAuto: 'Phone language',
    best: (n: number) => `Best: ${n}`,
  },
  pt: {
    play: 'Jogar',
    continueGame: 'Continuar',
    level: (n: number) => `Nível ${n}`,
    howToPlay: 'Como jogar?',
    settings: 'Configurações',
    close: 'Fechar',
    home: 'Início',
    back: 'Voltar',
    restart: 'Reiniciar',
    restartTitle: 'Começar de novo?',
    restartBody: 'Seu progresso neste jogo será apagado.',
    restartYes: 'Sim, começar de novo',
    cancel: 'Cancelar',
    undo: 'Desfazer',
    hint: 'Dica',
    outOfHints: 'Suas dicas acabaram. Cada vitória dá 1 dica.',
    winTitle: 'Parabéns!',
    next: 'Próximo',
    tryAgain: 'Tentar de novo',
    time: (s: string) => `Tempo: ${s}`,
    score: (n: number) => `${n} pontos`,
    reward: 'Você ganhou +1 dica',
    daily: 'Jogo do Dia',
    dailyDone: 'Feito hoje',
    dailyNew: 'Novo jogo',
    sound: 'Efeitos sonoros',
    haptics: 'Vibração',
    language: 'Idioma',
    languageAuto: 'Idioma do telefone',
    best: (n: number) => `Recorde: ${n}`,
  },
  de: {
    play: 'Spielen',
    continueGame: 'Weiterspielen',
    level: (n: number) => `Level ${n}`,
    howToPlay: 'Spielanleitung',
    settings: 'Einstellungen',
    close: 'Schließen',
    home: 'Startseite',
    back: 'Zurück',
    restart: 'Neustart',
    restartTitle: 'Neu beginnen?',
    restartBody: 'Dein Fortschritt in diesem Spiel wird gelöscht.',
    restartYes: 'Ja, neu beginnen',
    cancel: 'Abbrechen',
    undo: 'Zurück',
    hint: 'Tipp',
    outOfHints: 'Keine Tipps mehr. Jeder Sieg bringt 1 Tipp.',
    winTitle: 'Glückwunsch!',
    next: 'Weiter',
    tryAgain: 'Nochmal',
    time: (s: string) => `Zeit: ${s}`,
    score: (n: number) => `${n} Punkte`,
    reward: 'Du erhältst +1 Tipp',
    daily: 'Tagesspiel',
    dailyDone: 'Heute geschafft',
    dailyNew: 'Neues Spiel',
    sound: 'Soundeffekte',
    haptics: 'Vibration',
    language: 'Sprache',
    languageAuto: 'Sprache des Telefons',
    best: (n: number) => `Rekord: ${n}`,
  },
  fr: {
    play: 'Jouer',
    continueGame: 'Continuer',
    level: (n: number) => `Niveau ${n}`,
    howToPlay: 'Comment jouer ?',
    settings: 'Réglages',
    close: 'Fermer',
    home: 'Accueil',
    back: 'Retour',
    restart: 'Recommencer',
    restartTitle: 'Recommencer ?',
    restartBody: 'Votre progression dans cette partie sera effacée.',
    restartYes: 'Oui, recommencer',
    cancel: 'Annuler',
    undo: 'Annuler',
    hint: 'Indice',
    outOfHints: 'Plus d’indices. Chaque victoire rapporte 1 indice.',
    winTitle: 'Bravo !',
    next: 'Suivant',
    tryAgain: 'Réessayer',
    time: (s: string) => `Temps : ${s}`,
    score: (n: number) => `${n} points`,
    reward: 'Vous gagnez +1 indice',
    daily: 'Jeu du jour',
    dailyDone: 'Fait aujourd’hui',
    dailyNew: 'Nouvelle partie',
    sound: 'Effets sonores',
    haptics: 'Vibrations',
    language: 'Langue',
    languageAuto: 'Langue du téléphone',
    best: (n: number) => `Record : ${n}`,
  },
  ja: {
    play: 'プレイ',
    continueGame: '続きから',
    level: (n: number) => `レベル ${n}`,
    howToPlay: '遊び方',
    settings: '設定',
    close: '閉じる',
    home: 'ホーム',
    back: '戻る',
    restart: 'やり直す',
    restartTitle: '最初からやり直しますか？',
    restartBody: 'このゲームの進行状況は消えます。',
    restartYes: 'はい、やり直す',
    cancel: 'キャンセル',
    undo: '戻す',
    hint: 'ヒント',
    outOfHints: 'ヒントが残っていません。勝つたびにヒントが1回増えます。',
    winTitle: 'おめでとう！',
    next: '次へ',
    tryAgain: 'もう一度',
    time: (s: string) => `タイム ${s}`,
    score: (n: number) => `${n} 点`,
    reward: 'ヒントが1回増えました',
    daily: '今日のゲーム',
    dailyDone: '今日はクリア済み',
    dailyNew: '新しいゲーム',
    sound: '効果音',
    haptics: '振動',
    language: '言語',
    languageAuto: '端末の言語',
    best: (n: number) => `ベスト ${n}`,
  },
  ko: {
    play: '플레이',
    continueGame: '이어하기',
    level: (n: number) => `레벨 ${n}`,
    howToPlay: '게임 방법',
    settings: '설정',
    close: '닫기',
    home: '홈',
    back: '뒤로',
    restart: '다시 시작',
    restartTitle: '처음부터 다시 할까요?',
    restartBody: '이 게임의 진행 상황이 지워져요.',
    restartYes: '네, 다시 시작',
    cancel: '취소',
    undo: '되돌리기',
    hint: '힌트',
    outOfHints: '힌트가 남아 있지 않아요. 이길 때마다 힌트 1개를 받아요.',
    winTitle: '축하해요!',
    next: '다음',
    tryAgain: '다시 하기',
    time: (s: string) => `시간 ${s}`,
    score: (n: number) => `${n}점`,
    reward: '힌트 1개를 받았어요',
    daily: '오늘의 게임',
    dailyDone: '오늘 완료',
    dailyNew: '새 게임',
    sound: '효과음',
    haptics: '진동',
    language: '언어',
    languageAuto: '휴대폰 언어',
    best: (n: number) => `최고 ${n}`,
  },
});
