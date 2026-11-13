/** Huzur Words metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  found: (a: number, b: number) => string;
  theme: string;
  dragTip: string;
  hintShown: string;
  reward: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Kelime Avı',
    tagline: 'Harflerin arasındaki kelimeleri bul!',
    found: (a, b) => `${a} / ${b} kelime`,
    theme: 'Tema',
    dragTip: 'Parmağınızı kelimenin ilk harfinden son harfine kaydırın.',
    hintShown: 'Bir kelimenin ilk harfi parlıyor.',
    reward: '+1 İpucu kazandınız',
    cleared: 'Tüm kelimeleri buldunuz',
    rules: [
      'Alttaki listede yazan kelimeler harf tablosunda gizli. Parmağınızı kelimenin ilk harfinden son harfine kaydırın.',
      'Kelimeler düz bir çizgi üzerindedir. İlk seviyelerde yalnız soldan sağa ve yukarıdan aşağı yazılır; sonra çapraz ve ters kelimeler de gelir.',
      'Bulduğunuz kelime renkli bir şeritle işaretlenir ve listede üstü çizilir.',
      'İpucu, bulunmamış bir kelimenin ilk harfini gösterir. Sınırlıdır; her kazanılan yeni seviye 1 tane kazandırır.',
      'Kelimeler oyunun dilinde gelir; dili Ayarlar\'dan değiştirebilirsiniz. Süre sınırı yoktur.',
    ],
  },
  en: {
    title: 'Huzur Word Search',
    tagline: 'Find the words among the letters!',
    found: (a, b) => `${a} / ${b} words`,
    theme: 'Theme',
    dragTip: 'Slide your finger from the first letter of a word to its last letter.',
    hintShown: 'The first letter of a word is glowing.',
    reward: 'You earned +1 hint',
    cleared: 'You found every word',
    rules: [
      'The words in the list below are hidden in the letter grid. Slide your finger from the first letter of a word to its last letter.',
      'Words lie on a straight line. In the first levels they only run left to right and top to bottom; later, diagonal and backwards words appear too.',
      'A word you find is marked with a coloured band and crossed out in the list.',
      'Hint shows the first letter of a word you have not found yet. Hints are limited; every new level you win earns 1.',
      'Words come in the game language; you can change it in Settings. There is no time limit.',
    ],
  },
  pt: {
    title: 'Huzur Caça-Palavras',
    tagline: 'Encontre as palavras entre as letras!',
    found: (a, b) => `${a} / ${b} palavras`,
    theme: 'Tema',
    dragTip: 'Deslize o dedo da primeira até a última letra da palavra.',
    hintShown: 'A primeira letra de uma palavra está brilhando.',
    reward: 'Você ganhou +1 dica',
    cleared: 'Você encontrou todas as palavras',
    rules: [
      'As palavras da lista abaixo estão escondidas no quadro de letras. Deslize o dedo da primeira até a última letra da palavra.',
      'As palavras ficam em linha reta. Nos primeiros níveis vão só da esquerda para a direita e de cima para baixo; depois aparecem também na diagonal e de trás para frente.',
      'A palavra encontrada é marcada com uma faixa colorida e riscada na lista.',
      'A dica mostra a primeira letra de uma palavra que falta. As dicas são limitadas; cada nível novo vencido dá 1.',
      'As palavras vêm no idioma do jogo; você pode mudá-lo em Ajustes. Não há limite de tempo. Os acentos são omitidos no quadro.',
    ],
  },
  de: {
    title: 'Huzur Wortsuche',
    tagline: 'Finde die Wörter zwischen den Buchstaben!',
    found: (a, b) => `${a} / ${b} Wörter`,
    theme: 'Thema',
    dragTip: 'Fahre mit dem Finger vom ersten bis zum letzten Buchstaben eines Wortes.',
    hintShown: 'Der erste Buchstabe eines Wortes leuchtet.',
    reward: 'Du hast +1 Tipp erhalten',
    cleared: 'Du hast alle Wörter gefunden',
    rules: [
      'Die Wörter aus der Liste unten sind im Buchstabengitter versteckt. Fahre mit dem Finger vom ersten bis zum letzten Buchstaben eines Wortes.',
      'Wörter liegen auf einer geraden Linie. In den ersten Levels laufen sie nur von links nach rechts und von oben nach unten; später kommen schräge und rückwärts geschriebene Wörter dazu.',
      'Ein gefundenes Wort wird mit einem farbigen Band markiert und in der Liste durchgestrichen.',
      'Der Tipp zeigt den ersten Buchstaben eines noch nicht gefundenen Wortes. Tipps sind begrenzt; jedes neu gewonnene Level bringt 1.',
      'Die Wörter erscheinen in der Spielsprache; du kannst sie in den Einstellungen ändern. Es gibt kein Zeitlimit.',
    ],
  },
  fr: {
    title: 'Huzur Mots Cachés',
    tagline: 'Trouvez les mots parmi les lettres !',
    found: (a, b) => `${a} / ${b} mots`,
    theme: 'Thème',
    dragTip: 'Faites glisser le doigt de la première à la dernière lettre d’un mot.',
    hintShown: 'La première lettre d’un mot brille.',
    reward: 'Vous gagnez +1 indice',
    cleared: 'Vous avez trouvé tous les mots',
    rules: [
      'Les mots de la liste du bas sont cachés dans la grille. Faites glisser le doigt de la première à la dernière lettre d’un mot.',
      'Les mots sont en ligne droite. Aux premiers niveaux, ils vont seulement de gauche à droite et de haut en bas ; ensuite viennent aussi les diagonales et les mots à l’envers.',
      'Un mot trouvé est marqué d’une bande colorée et barré dans la liste.',
      'L’indice montre la première lettre d’un mot pas encore trouvé. Les indices sont limités ; chaque nouveau niveau gagné en rapporte 1.',
      'Les mots sont dans la langue du jeu ; vous pouvez la changer dans les Réglages. Il n’y a pas de limite de temps. Les accents sont omis dans la grille.',
    ],
  },
  ja: {
    title: 'Huzur ことばさがし',
    tagline: '文字のなかから ことばを見つけよう！',
    found: (a, b) => `${a} / ${b} 語`,
    theme: 'テーマ',
    dragTip: 'ことばの最初の文字から最後の文字まで指をすべらせます。',
    hintShown: 'ことばの最初の文字が光っています。',
    reward: 'ヒントを1つもらいました',
    cleared: 'すべてのことばを見つけました',
    rules: [
      '下のリストのことばが、文字の表にかくれています。ことばの最初の文字から最後の文字まで指をすべらせます。',
      'ことばはまっすぐ一列に並んでいます。はじめのレベルでは左から右、上から下だけです。あとでななめや逆向きのことばも出てきます。',
      '見つけたことばには色の帯がつき、リストで線が引かれます。',
      'ヒントは、まだ見つけていないことばの最初の文字を教えます。数に限りがあり、新しいレベルをクリアするたびに1つ増えます。',
      'ことばはゲームの言語で出てきます。言語は「設定」で変えられます。時間制限はありません。',
    ],
  },
  ko: {
    title: 'Huzur 낱말 찾기',
    tagline: '글자 사이에서 낱말을 찾아보세요!',
    found: (a, b) => `${a} / ${b} 낱말`,
    theme: '주제',
    dragTip: '낱말의 첫 글자부터 마지막 글자까지 손가락을 미세요.',
    hintShown: '한 낱말의 첫 글자가 빛나고 있어요.',
    reward: '힌트 1개를 받았어요',
    cleared: '모든 낱말을 찾았어요',
    rules: [
      '아래 목록의 낱말이 글자판에 숨어 있어요. 낱말의 첫 글자부터 마지막 글자까지 손가락을 미세요.',
      '낱말은 곧은 줄 위에 있어요. 처음 레벨에서는 왼쪽에서 오른쪽, 위에서 아래로만 쓰여 있고, 나중에는 대각선과 거꾸로 쓴 낱말도 나와요.',
      '찾은 낱말에는 색 띠가 표시되고 목록에서 줄이 그어져요.',
      '힌트는 아직 못 찾은 낱말의 첫 글자를 보여 줘요. 개수가 정해져 있고 새 레벨을 이길 때마다 1개를 받아요.',
      '낱말은 게임 언어로 나와요. 언어는 설정에서 바꿀 수 있어요. 시간 제한은 없어요.',
    ],
  },
});
