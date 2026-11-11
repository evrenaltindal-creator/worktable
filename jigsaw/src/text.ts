/** Huzur Jigsaw metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  pieces: (n: number) => string;
  placed: (a: number, b: number) => string;
  wrong: string;
  dragTip: string;
  preview: string;
  reward: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Yapboz',
    tagline: 'Parçaları yerleştir, resmi tamamla!',
    pieces: (n) => `${n} parça`,
    placed: (a, b) => `${a} / ${b} parça`,
    wrong: 'Bu parça oraya ait değil. Soluk resme bakarak yerini bulun.',
    dragTip: 'Alttaki bir parçayı sürükleyip resimde ait olduğu yere bırakın ya da parçaya, sonra yerine dokunun.',
    preview: 'Resmi göster',
    reward: '+1 İpucu kazandınız',
    cleared: 'Resim tamamlandı',
    rules: [
      'Alttaki parçalardan birini sürükleyip resimdeki yerine bırakın. İsterseniz önce parçaya, sonra tahtadaki yerine dokunun.',
      'Tahtadaki soluk resim parçaların yerini bulmanıza yardım eder. Doğru yere yakın bırakılan parça kendiliğinden oturur.',
      'Tepside bir seferde birkaç parça görünür; parça yerleştikçe yenisi gelir.',
      'İpucu, seçili parçanın yerini gösterir. Sınırlıdır; her kazanılan yeni seviye 1 tane kazandırır.',
      'Seviyeler ilerledikçe parça sayısı 9\'dan 36\'ya çıkar. Süre sınırı yoktur.',
    ],
  },
  en: {
    title: 'Huzur Jigsaw',
    tagline: 'Place the pieces, complete the picture!',
    pieces: (n) => `${n} pieces`,
    placed: (a, b) => `${a} / ${b} pieces`,
    wrong: 'This piece does not go there. Use the faint picture to find its place.',
    dragTip: 'Drag a piece from below to its place in the picture, or tap a piece and then its place.',
    preview: 'Show picture',
    reward: 'You earned +1 hint',
    cleared: 'Picture complete',
    rules: [
      'Drag one of the pieces below to its place in the picture. You can also tap a piece first and then its place on the board.',
      'The faint picture on the board helps you find where pieces go. A piece dropped close to its place snaps in by itself.',
      'The tray shows a few pieces at a time; a new one appears as you place them.',
      'Hint shows where the selected piece goes. Hints are limited; every new level you win earns 1.',
      'As you progress, the number of pieces grows from 9 to 36. There is no time limit.',
    ],
  },
  pt: {
    title: 'Huzur Quebra-Cabeça',
    tagline: 'Encaixe as peças, complete a imagem!',
    pieces: (n) => `${n} peças`,
    placed: (a, b) => `${a} / ${b} peças`,
    wrong: 'Esta peça não vai aí. Use a imagem clara para achar o lugar dela.',
    dragTip: 'Arraste uma peça de baixo até o lugar dela na imagem, ou toque na peça e depois no lugar.',
    preview: 'Mostrar imagem',
    reward: 'Você ganhou +1 dica',
    cleared: 'Imagem completa',
    rules: [
      'Arraste uma das peças de baixo até o lugar dela na imagem. Você também pode tocar primeiro na peça e depois no lugar.',
      'A imagem clara no tabuleiro ajuda a achar o lugar das peças. Uma peça solta perto do lugar certo se encaixa sozinha.',
      'A bandeja mostra algumas peças por vez; uma nova aparece conforme você encaixa.',
      'A dica mostra onde vai a peça selecionada. As dicas são limitadas; cada nível novo vencido dá 1.',
      'Com o avanço, o número de peças cresce de 9 para 36. Não há limite de tempo.',
    ],
  },
  de: {
    title: 'Huzur Puzzle',
    tagline: 'Teile legen, Bild vollenden!',
    pieces: (n) => `${n} Teile`,
    placed: (a, b) => `${a} / ${b} Teile`,
    wrong: 'Dieses Teil gehört nicht dorthin. Das blasse Bild hilft, seinen Platz zu finden.',
    dragTip: 'Ziehe ein Teil von unten an seinen Platz im Bild, oder tippe auf ein Teil und dann auf seinen Platz.',
    preview: 'Bild zeigen',
    reward: 'Du hast +1 Tipp erhalten',
    cleared: 'Bild vollständig',
    rules: [
      'Ziehe eines der Teile unten an seinen Platz im Bild. Du kannst auch zuerst auf das Teil und dann auf seinen Platz tippen.',
      'Das blasse Bild auf dem Spielfeld hilft dir, den Platz der Teile zu finden. Ein Teil, das nahe an seinem Platz losgelassen wird, rastet von selbst ein.',
      'Unten liegen immer ein paar Teile bereit; für jedes gelegte Teil kommt ein neues.',
      'Der Tipp zeigt, wohin das gewählte Teil gehört. Tipps sind begrenzt; jedes neu gewonnene Level bringt 1.',
      'Mit der Zeit steigt die Zahl der Teile von 9 auf 36. Es gibt kein Zeitlimit.',
    ],
  },
  fr: {
    title: 'Huzur Puzzle',
    tagline: 'Posez les pièces, complétez l’image !',
    pieces: (n) => `${n} pièces`,
    placed: (a, b) => `${a} / ${b} pièces`,
    wrong: 'Cette pièce ne va pas là. Aidez-vous de l’image pâle pour trouver sa place.',
    dragTip: 'Faites glisser une pièce du bas jusqu’à sa place dans l’image, ou touchez une pièce puis sa place.',
    preview: 'Voir l’image',
    reward: 'Vous gagnez +1 indice',
    cleared: 'Image terminée',
    rules: [
      'Faites glisser une des pièces du bas jusqu’à sa place dans l’image. Vous pouvez aussi toucher d’abord la pièce puis sa place.',
      'L’image pâle du plateau vous aide à trouver la place des pièces. Une pièce lâchée près de sa place s’y emboîte toute seule.',
      'Le plateau du bas montre quelques pièces à la fois ; une nouvelle arrive à chaque pièce posée.',
      'L’indice montre où va la pièce choisie. Les indices sont limités ; chaque nouveau niveau gagné en rapporte 1.',
      'Au fil des niveaux, le nombre de pièces passe de 9 à 36. Il n’y a pas de limite de temps.',
    ],
  },
  ja: {
    title: 'Huzur ジグソー',
    tagline: 'ピースをはめて、絵を完成させよう！',
    pieces: (n) => `${n} ピース`,
    placed: (a, b) => `${a} / ${b} ピース`,
    wrong: 'このピースはそこではありません。うすい絵を見て場所を探しましょう。',
    dragTip: '下のピースを絵の正しい場所までドラッグするか、ピースをタップしてから場所をタップします。',
    preview: '絵を見る',
    reward: 'ヒントを1つもらいました',
    cleared: '絵が完成しました',
    rules: [
      '下のピースを1つ、絵の正しい場所までドラッグします。ピースをタップしてから場所をタップしても置けます。',
      '盤面のうすい絵が、ピースの場所を探す手がかりになります。正しい場所の近くで離すと、自動でぴったりはまります。',
      '下には一度にいくつかのピースが並び、はめるたびに新しいピースが出てきます。',
      'ヒントは選んだピースの場所を教えます。数に限りがあり、新しいレベルをクリアするたびに1つ増えます。',
      'レベルが進むと、ピースの数が9から36まで増えます。時間制限はありません。',
    ],
  },
  ko: {
    title: 'Huzur 직소 퍼즐',
    tagline: '조각을 맞춰 그림을 완성하세요!',
    pieces: (n) => `${n}조각`,
    placed: (a, b) => `${a} / ${b}조각`,
    wrong: '이 조각은 그 자리가 아니에요. 흐린 그림을 보며 자리를 찾아보세요.',
    dragTip: '아래 조각을 그림의 제자리로 끌어다 놓거나, 조각을 누른 뒤 제자리를 누르세요.',
    preview: '그림 보기',
    reward: '힌트 1개를 받았어요',
    cleared: '그림 완성',
    rules: [
      '아래 조각 중 하나를 그림의 제자리로 끌어다 놓으세요. 조각을 먼저 누르고 제자리를 눌러도 돼요.',
      '판에 흐리게 보이는 그림이 조각의 자리를 찾는 데 도움이 돼요. 제자리 가까이에 놓으면 저절로 맞춰져요.',
      '아래에는 한 번에 몇 개의 조각이 보이고, 조각을 맞출 때마다 새 조각이 나와요.',
      '힌트는 고른 조각의 자리를 보여 줘요. 개수가 정해져 있고 새 레벨을 이길 때마다 1개를 받아요.',
      '레벨이 오를수록 조각 수가 9개에서 36개까지 늘어나요. 시간 제한은 없어요.',
    ],
  },
});
