/** Koleksiyondaki oyunlar: ana menüde sırasıyla görünür (Küp, Mahjong'un içinden açılır). */
import type { ImageSourcePropType } from 'react-native';
import type { Lang } from '../games/mines/src/kit/i18n';
import type { GameId } from './HubContext';

export interface CatalogEntry {
  id: GameId;
  icon: ImageSourcePropType;
  color: string;
  edge: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'mahjong',
    icon: require('../games/mahjong/assets/icon.png'),
    color: '#2A9D8F',
    edge: '#1C6E64',
    name: { tr: 'Mahjong', en: 'Mahjong', pt: 'Mahjong', de: 'Mahjong', fr: 'Mahjong', ja: '麻雀ソリティア', ko: '마작' },
    desc: {
      tr: '9 mod, yüzlerce seviye',
      en: '9 modes, hundreds of levels',
      pt: '9 modos, centenas de níveis',
      de: '9 Modi, Hunderte Level',
      fr: '9 modes, des centaines de niveaux',
      ja: '9つのモード・数百のレベル',
      ko: '9가지 모드, 수백 개 레벨',
    },
  },
  {
    id: 'sudoku',
    icon: require('../games/sudoku/assets/icon.png'),
    color: '#3C7DE0',
    edge: '#2A5AA6',
    name: { tr: 'Sudoku', en: 'Sudoku', pt: 'Sudoku', de: 'Sudoku', fr: 'Sudoku', ja: '数独', ko: '스도쿠' },
    desc: {
      tr: '4 zorluk, not alma',
      en: '4 difficulties, pencil notes',
      pt: '4 dificuldades, anotações',
      de: '4 Stufen, Notizen',
      fr: '4 niveaux, notes',
      ja: '4つの難易度・メモ機能',
      ko: '4단계 난이도, 메모',
    },
  },
  {
    id: 'words',
    icon: require('../games/words/assets/icon.png'),
    color: '#7A5AC8',
    edge: '#563B93',
    name: { tr: 'Kelime Avı', en: 'Word Search', pt: 'Caça-Palavras', de: 'Wortsuche', fr: 'Mots Mêlés', ja: '単語さがし', ko: '단어 찾기' },
    desc: {
      tr: 'Harflerin arasında kelime bul',
      en: 'Find words in the letter grid',
      pt: 'Encontre palavras na grade',
      de: 'Finde Wörter im Buchstabengitter',
      fr: 'Trouvez les mots dans la grille',
      ja: '文字の中から単語を探そう',
      ko: '글자 속에서 단어를 찾으세요',
    },
  },
  {
    id: 'jigsaw',
    icon: require('../games/jigsaw/assets/icon.png'),
    color: '#E07A3F',
    edge: '#A9542A',
    name: { tr: 'Yapboz', en: 'Jigsaw', pt: 'Quebra-Cabeça', de: 'Puzzle', fr: 'Puzzle', ja: 'ジグソーパズル', ko: '직소 퍼즐' },
    desc: {
      tr: 'Parçaları birleştir, resmi tamamla',
      en: 'Fit the pieces, finish the picture',
      pt: 'Encaixe as peças e complete a imagem',
      de: 'Teile einsetzen, Bild vollenden',
      fr: 'Assemblez les pièces',
      ja: 'ピースをはめて絵を完成',
      ko: '조각을 맞춰 그림을 완성',
    },
  },
  {
    id: 'mines',
    icon: require('../games/mines/assets/icon.png'),
    color: '#3F5BA8',
    edge: '#2B3F78',
    name: { tr: 'Mayın Tarlası', en: 'Minesweeper', pt: 'Campo Minado', de: 'Minensuche', fr: 'Démineur', ja: 'マインスイーパー', ko: '지뢰 찾기' },
    desc: {
      tr: 'Tahmin yok, yalnız mantık',
      en: 'No guessing, pure logic',
      pt: 'Sem chute, só lógica',
      de: 'Kein Raten, reine Logik',
      fr: 'Pas de hasard, que de la logique',
      ja: '運に頼らない論理パズル',
      ko: '추측 없이 논리로만',
    },
  },
  {
    id: 'bubbles',
    icon: require('../games/bubbles/assets/icon.png'),
    color: '#2F8FC8',
    edge: '#1F6490',
    name: { tr: 'Balon Patlatma', en: 'Bubble Pop', pt: 'Estourar Bolhas', de: 'Blasen Platzen', fr: 'Bulles', ja: 'バブルシューター', ko: '버블 팝' },
    desc: {
      tr: 'Nişan al, renkleri eşleştir',
      en: 'Aim and match the colours',
      pt: 'Mire e combine as cores',
      de: 'Zielen und Farben verbinden',
      fr: 'Visez et associez les couleurs',
      ja: '狙って同じ色をそろえよう',
      ko: '조준해서 같은 색을 맞추세요',
    },
  },
  {
    id: 'jewels',
    icon: require('../games/jewels/assets/icon.png'),
    color: '#C8507E',
    edge: '#923A5C',
    name: { tr: 'Mücevher', en: 'Jewels', pt: 'Joias', de: 'Juwelen', fr: 'Joyaux', ja: 'ジュエル', ko: '보석' },
    desc: {
      tr: 'Yer değiştir, üçlü yap',
      en: 'Swap and match three',
      pt: 'Troque e combine três',
      de: 'Tauschen, drei verbinden',
      fr: 'Échangez, alignez-en trois',
      ja: '入れ替えて3つそろえよう',
      ko: '바꿔서 3개를 맞추세요',
    },
  },
  {
    id: 'colorpop',
    icon: require('../games/colorpop/assets/icon.png'),
    color: '#2F8F5B',
    edge: '#1F6440',
    name: { tr: 'Renk Patlatma', en: 'Color Pop', pt: 'Estoura Cores', de: 'Farbknall', fr: 'Pop Couleurs', ja: 'カラーポップ', ko: '컬러 팝' },
    desc: {
      tr: 'Aynı renk grupları temizle',
      en: 'Clear groups of one colour',
      pt: 'Limpe grupos da mesma cor',
      de: 'Gleichfarbige Gruppen räumen',
      fr: 'Videz les groupes de même couleur',
      ja: '同じ色のかたまりを消そう',
      ko: '같은 색 묶음을 없애세요',
    },
  },
];

export const HUB_TEXT: Record<Lang, { title: string; tagline: string; games: string }> = {
  tr: { title: 'Huzur', tagline: 'Bulmaca Koleksiyonu', games: 'Oyunlar' },
  en: { title: 'Huzur', tagline: 'Puzzle Collection', games: 'Games' },
  pt: { title: 'Huzur', tagline: 'Coleção de Quebra-Cabeças', games: 'Jogos' },
  de: { title: 'Huzur', tagline: 'Rätselsammlung', games: 'Spiele' },
  fr: { title: 'Huzur', tagline: 'Collection de casse-têtes', games: 'Jeux' },
  ja: { title: 'Huzur', tagline: 'パズルコレクション', games: 'ゲーム一覧' },
  ko: { title: 'Huzur', tagline: '퍼즐 컬렉션', games: '게임 목록' },
};
