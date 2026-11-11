/** Huzur Mines metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';
import type { Difficulty } from './game/mines';

type T = {
  title: string;
  tagline: string;
  difficulty: Record<Difficulty, string>;
  game: (n: number) => string;
  flag: string;
  minesLeft: (n: number) => string;
  lostTitle: string;
  lostBody: string;
  firstTap: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Mayın Tarlası',
    tagline: 'Sakin, tahmin gerektirmeyen mayın tarlası',
    difficulty: { easy: 'Kolay', medium: 'Orta', hard: 'Zor' },
    game: (n) => `Oyun ${n}`,
    flag: 'Bayrak',
    minesLeft: (n) => `Mayın: ${n}`,
    lostTitle: 'Mayına bastınız!',
    lostBody: 'Olsun! Her tahta mantıkla çözülebilir; tekrar deneyin.',
    firstTap: 'Önce tahtada bir kareye dokunun.',
    cleared: 'Tarla temizlendi',
    rules: [
      'Gizli mayınlara basmadan, mayın olmayan tüm kareleri açın.',
      'Bir kareye dokununca açılır. İçindeki sayı, çevresindeki 8 karede kaç mayın olduğunu gösterir.',
      'Mayın olduğundan emin olduğunuz kareye bayrak koyun: "Bayrak" düğmesini açın ya da kareye basılı tutun.',
      'Bayraklarla çevrili bir sayıya dokunursanız etrafındaki diğer kareler açılır.',
      'İlk dokunuş her zaman güvenlidir ve her tahta tahmin gerektirmeden çözülebilir.',
    ],
  },
  en: {
    title: 'Huzur Mines',
    tagline: 'Calm minesweeping with no guessing',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    game: (n) => `Game ${n}`,
    flag: 'Flag',
    minesLeft: (n) => `Mines: ${n}`,
    lostTitle: 'You hit a mine!',
    lostBody: 'No worries! Every board can be solved by logic, so try again.',
    firstTap: 'First tap a square on the board.',
    cleared: 'Field cleared',
    rules: [
      'Open every square that is not a mine, without stepping on the hidden mines.',
      'Tap a square to open it. Its number shows how many mines are in the 8 squares around it.',
      'Put a flag on squares you know are mines: turn on "Flag" or press and hold the square.',
      'Tap a number whose mines are all flagged to open the squares around it.',
      'Your first tap is always safe, and every board can be solved without guessing.',
    ],
  },
  pt: {
    title: 'Huzur Campo Minado',
    tagline: 'Campo minado tranquilo, sem chutes',
    difficulty: { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' },
    game: (n) => `Jogo ${n}`,
    flag: 'Bandeira',
    minesLeft: (n) => `Minas: ${n}`,
    lostTitle: 'Você pisou numa mina!',
    lostBody: 'Tudo bem! Todo campo pode ser resolvido com lógica; tente de novo.',
    firstTap: 'Primeiro toque em um quadrado do campo.',
    cleared: 'Campo limpo',
    rules: [
      'Abra todos os quadrados sem mina, sem pisar nas minas escondidas.',
      'Toque em um quadrado para abri-lo. O número mostra quantas minas há nos 8 quadrados ao redor.',
      'Marque com bandeira os quadrados que você sabe que são minas: ligue "Bandeira" ou segure o dedo no quadrado.',
      'Toque em um número com todas as minas marcadas para abrir os quadrados ao redor.',
      'O primeiro toque é sempre seguro, e todo campo pode ser resolvido sem chutar.',
    ],
  },
  de: {
    title: 'Huzur Minensuche',
    tagline: 'Entspannte Minensuche ganz ohne Raten',
    difficulty: { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' },
    game: (n) => `Spiel ${n}`,
    flag: 'Flagge',
    minesLeft: (n) => `Minen: ${n}`,
    lostTitle: 'Auf eine Mine getreten!',
    lostBody: 'Kein Problem! Jedes Feld ist mit Logik lösbar, versuch es noch einmal.',
    firstTap: 'Tippe zuerst ein Feld auf dem Spielbrett an.',
    cleared: 'Feld geräumt',
    rules: [
      'Decke alle Felder ohne Mine auf, ohne auf die versteckten Minen zu treten.',
      'Tippe ein Feld an, um es aufzudecken. Die Zahl zeigt, wie viele Minen in den 8 Nachbarfeldern liegen.',
      'Setze eine Flagge auf Felder, die sicher Minen sind: „Flagge“ einschalten oder das Feld gedrückt halten.',
      'Tippe eine Zahl an, deren Minen alle markiert sind, um die übrigen Nachbarfelder aufzudecken.',
      'Der erste Tipp ist immer sicher, und jedes Spiel ist ohne Raten lösbar.',
    ],
  },
  fr: {
    title: 'Huzur Démineur',
    tagline: 'Un démineur apaisant, sans hasard',
    difficulty: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' },
    game: (n) => `Partie ${n}`,
    flag: 'Drapeau',
    minesLeft: (n) => `Mines : ${n}`,
    lostTitle: 'Une mine !',
    lostBody: 'Pas grave ! Chaque grille se résout par la logique, réessayez.',
    firstTap: 'Touchez d’abord une case de la grille.',
    cleared: 'Terrain déminé',
    rules: [
      'Ouvrez toutes les cases sans mine, sans marcher sur les mines cachées.',
      'Touchez une case pour l’ouvrir. Son chiffre indique combien de mines se trouvent dans les 8 cases voisines.',
      'Posez un drapeau sur les cases que vous savez minées : activez « Drapeau » ou gardez le doigt appuyé.',
      'Touchez un chiffre dont toutes les mines sont marquées pour ouvrir les cases autour.',
      'La première case touchée est toujours sûre et chaque grille se résout sans deviner.',
    ],
  },
  ja: {
    title: 'Huzur マインスイーパー',
    tagline: '運まかせなし、ゆったりマインスイーパー',
    difficulty: { easy: 'かんたん', medium: 'ふつう', hard: 'むずかしい' },
    game: (n) => `ゲーム ${n}`,
    flag: '旗',
    minesLeft: (n) => `地雷 ${n}`,
    lostTitle: '地雷を踏みました！',
    lostBody: '大丈夫！どの盤面も推理だけで解けます。もう一度挑戦しましょう。',
    firstTap: 'まず盤面のマスをタップしてください。',
    cleared: 'クリア',
    rules: [
      '隠れた地雷を踏まないように、地雷のないマスをすべて開けます。',
      'マスをタップすると開きます。数字はまわり8マスにある地雷の数です。',
      '地雷だとわかったマスには旗を立てます。「旗」をオンにするか、マスを長押しします。',
      'まわりの地雷に全部旗が立った数字をタップすると、残りのマスが開きます。',
      '最初のタップは必ず安全で、どの盤面も当て推量なしで解けます。',
    ],
  },
  ko: {
    title: 'Huzur 지뢰찾기',
    tagline: '찍지 않아도 되는 편안한 지뢰찾기',
    difficulty: { easy: '쉬움', medium: '보통', hard: '어려움' },
    game: (n) => `게임 ${n}`,
    flag: '깃발',
    minesLeft: (n) => `지뢰 ${n}`,
    lostTitle: '지뢰를 밟았어요!',
    lostBody: '괜찮아요! 모든 판은 논리만으로 풀 수 있어요. 다시 도전해 보세요.',
    firstTap: '먼저 판의 칸을 누르세요.',
    cleared: '지뢰밭 완료',
    rules: [
      '숨은 지뢰를 밟지 않고, 지뢰가 없는 칸을 모두 여세요.',
      '칸을 누르면 열려요. 숫자는 주변 8칸에 있는 지뢰의 개수예요.',
      '지뢰가 확실한 칸에는 깃발을 꽂으세요. "깃발"을 켜거나 칸을 길게 누르세요.',
      '주변 지뢰에 모두 깃발이 꽂힌 숫자를 누르면 나머지 칸이 열려요.',
      '첫 번째 칸은 항상 안전하고, 모든 판은 찍지 않고 풀 수 있어요.',
    ],
  },
});
