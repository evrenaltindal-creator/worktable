/** Huzur Color Pop metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  goal: (left: number, allowed: number) => string;
  hammer: string;
  hammerOn: string;
  outOfHammers: string;
  outOfUndo: string;
  reward: string;
  tapTip: string;
  lone: string;
  lostTitle: string;
  lostBody: (left: number, allowed: number) => string;
  cleared: (left: number) => string;
  perfect: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Renk Patlatma',
    tagline: 'Aynı renkleri bul, dokun, patlat!',
    goal: (l, a) => `Kalan ${l} · Hedef ≤ ${a}`,
    hammer: 'Çekiç',
    hammerOn: 'Kaldırmak istediğiniz karoya dokunun.',
    outOfHammers: 'Çekiciniz kalmadı. Her kazandığınız yeni seviye 1 tane kazandırır.',
    outOfUndo: 'Geri alma hakkınız kalmadı. Her kazandığınız yeni seviye 1 tane kazandırır.',
    reward: '+1 Geri al, +1 İpucu ve +1 Çekiç kazandınız',
    tapTip: 'Aynı renkte yan yana en az 2 karoya dokunun.',
    lone: 'Tek karo patlamaz; en az 2 aynı renk komşu gerekir.',
    lostTitle: 'Hamle kalmadı',
    lostBody: (l, a) => `${l} karo kaldı, hedef en fazla ${a}. Tekrar deneyin; büyük grupları sona saklamak işe yarar.`,
    cleared: (l) => (l ? `${l} karo kaldı` : 'Tahta tertemiz!'),
    perfect: 'Tahta tertemiz!',
    rules: [
      'Aynı renkten yan yana en az 2 karoya dokunun; hepsi birlikte patlar. Grup ne kadar büyükse o kadar çok puan.',
      'Üstteki karolar aşağı düşer, boşalan sütunlar ortada birleşir.',
      'Patlatılacak grup kalmayınca oyun biter. Hedef: üstte yazan sayıdan fazla karo bırakmamak.',
      'Her rengin kendi sembolü var (kalp, damla, yaprak, güneş, ay); renkleri ayırt etmek kolaydır.',
      '"Geri al" son hamleyi geri alır, "İpucu" iyi bir grubu gösterir, "Çekiç" tek bir karoyu kaldırır. Hepsi sınırlıdır; her kazanılan yeni seviye birer tane kazandırır.',
    ],
  },
  en: {
    title: 'Huzur Color Pop',
    tagline: 'Find the colours, tap, pop!',
    goal: (l, a) => `Left ${l} · Goal ≤ ${a}`,
    hammer: 'Hammer',
    hammerOn: 'Tap the tile you want to remove.',
    outOfHammers: 'No hammers left. Every new level you win earns 1.',
    outOfUndo: 'No undos left. Every new level you win earns 1.',
    reward: 'You earned +1 undo, +1 hint and +1 hammer',
    tapTip: 'Tap at least 2 touching tiles of the same colour.',
    lone: 'A single tile does not pop; it needs at least 2 touching tiles of one colour.',
    lostTitle: 'No moves left',
    lostBody: (l, a) => `${l} tiles are left, the goal is ${a} or fewer. Try again; saving big groups for later helps.`,
    cleared: (l) => (l ? `${l} tiles left` : 'Board cleared!'),
    perfect: 'Board cleared!',
    rules: [
      'Tap at least 2 touching tiles of the same colour and they all pop together. The bigger the group, the more points.',
      'Tiles above fall down, and empty columns close up in the middle.',
      'The game ends when no group is left. Goal: leave no more tiles than the number shown at the top.',
      'Every colour has its own symbol (heart, drop, leaf, sun, moon), so colours are easy to tell apart.',
      '"Undo" takes back your last move, "Hint" shows a good group, "Hammer" removes a single tile. All are limited; every new level you win earns 1 of each.',
    ],
  },
  pt: {
    title: 'Huzur Estoura Cores',
    tagline: 'Ache as cores, toque, estoure!',
    goal: (l, a) => `Restam ${l} · Meta ≤ ${a}`,
    hammer: 'Martelo',
    hammerOn: 'Toque na peça que deseja remover.',
    outOfHammers: 'Seus martelos acabaram. Cada nível novo vencido dá 1.',
    outOfUndo: 'Seus desfazer acabaram. Cada nível novo vencido dá 1.',
    reward: 'Você ganhou +1 desfazer, +1 dica e +1 martelo',
    tapTip: 'Toque em pelo menos 2 peças vizinhas da mesma cor.',
    lone: 'Uma peça sozinha não estoura; são precisas ao menos 2 vizinhas da mesma cor.',
    lostTitle: 'Sem jogadas',
    lostBody: (l, a) => `Restaram ${l} peças, a meta é no máximo ${a}. Tente de novo; guardar grupos grandes para depois ajuda.`,
    cleared: (l) => (l ? `Restaram ${l} peças` : 'Tabuleiro limpo!'),
    perfect: 'Tabuleiro limpo!',
    rules: [
      'Toque em pelo menos 2 peças vizinhas da mesma cor e todas estouram juntas. Quanto maior o grupo, mais pontos.',
      'As peças de cima caem e as colunas vazias se juntam no meio.',
      'O jogo acaba quando não há mais grupos. Meta: não deixar mais peças do que o número mostrado em cima.',
      'Cada cor tem seu símbolo (coração, gota, folha, sol, lua), fácil de distinguir.',
      '"Desfazer" volta a última jogada, "Dica" mostra um bom grupo, "Martelo" remove uma peça. Todos são limitados; cada nível novo vencido dá 1 de cada.',
    ],
  },
  de: {
    title: 'Huzur Farbenplatzer',
    tagline: 'Farben finden, tippen, platzen!',
    goal: (l, a) => `Übrig ${l} · Ziel ≤ ${a}`,
    hammer: 'Hammer',
    hammerOn: 'Tippe auf das Feld, das du entfernen möchtest.',
    outOfHammers: 'Keine Hämmer mehr. Jedes neu gewonnene Level bringt 1.',
    outOfUndo: 'Kein Rückgängig mehr. Jedes neu gewonnene Level bringt 1.',
    reward: 'Du hast +1 Rückgängig, +1 Tipp und +1 Hammer erhalten',
    tapTip: 'Tippe auf mindestens 2 benachbarte Felder gleicher Farbe.',
    lone: 'Ein einzelnes Feld platzt nicht; es braucht mindestens 2 benachbarte gleicher Farbe.',
    lostTitle: 'Keine Züge mehr',
    lostBody: (l, a) => `${l} Felder sind übrig, das Ziel ist höchstens ${a}. Versuch es noch einmal; große Gruppen für später aufzuheben hilft.`,
    cleared: (l) => (l ? `${l} Felder übrig` : 'Spielfeld leer!'),
    perfect: 'Spielfeld leer!',
    rules: [
      'Tippe auf mindestens 2 benachbarte Felder gleicher Farbe, dann platzen alle zusammen. Je größer die Gruppe, desto mehr Punkte.',
      'Felder darüber fallen nach unten, leere Spalten rücken in der Mitte zusammen.',
      'Das Spiel endet, wenn keine Gruppe mehr übrig ist. Ziel: nicht mehr Felder übrig lassen als oben angezeigt.',
      'Jede Farbe hat ein eigenes Symbol (Herz, Tropfen, Blatt, Sonne, Mond), so sind die Farben leicht zu unterscheiden.',
      '„Rückgängig“ nimmt den letzten Zug zurück, „Tipp“ zeigt eine gute Gruppe, „Hammer“ entfernt ein einzelnes Feld. Alles ist begrenzt; jedes neu gewonnene Level bringt je 1.',
    ],
  },
  fr: {
    title: 'Huzur Pop Couleurs',
    tagline: 'Trouvez les couleurs, touchez, éclatez !',
    goal: (l, a) => `Reste ${l} · But ≤ ${a}`,
    hammer: 'Marteau',
    hammerOn: 'Touchez la case à retirer.',
    outOfHammers: 'Plus de marteaux. Chaque nouveau niveau gagné en rapporte 1.',
    outOfUndo: 'Plus d’annulations. Chaque nouveau niveau gagné en rapporte 1.',
    reward: 'Vous gagnez +1 annulation, +1 indice et +1 marteau',
    tapTip: 'Touchez au moins 2 cases voisines de la même couleur.',
    lone: 'Une case seule n’éclate pas ; il faut au moins 2 cases voisines de même couleur.',
    lostTitle: 'Plus de coups',
    lostBody: (l, a) => `Il reste ${l} cases, le but est d’en laisser ${a} au plus. Réessayez ; garder les grands groupes pour la fin aide.`,
    cleared: (l) => (l ? `Il reste ${l} cases` : 'Plateau vidé !'),
    perfect: 'Plateau vidé !',
    rules: [
      'Touchez au moins 2 cases voisines de la même couleur : elles éclatent ensemble. Plus le groupe est grand, plus il rapporte.',
      'Les cases du dessus tombent et les colonnes vides se resserrent au centre.',
      'La partie se termine quand il ne reste aucun groupe. But : ne pas laisser plus de cases que le nombre affiché en haut.',
      'Chaque couleur a son symbole (cœur, goutte, feuille, soleil, lune) : les couleurs se distinguent facilement.',
      '« Annuler » reprend le dernier coup, « Indice » montre un bon groupe, « Marteau » retire une case. Tous sont limités ; chaque nouveau niveau gagné en rapporte un de chaque.',
    ],
  },
  ja: {
    title: 'Huzur カラーポップ',
    tagline: '同じ色を見つけて、タップして、ポン！',
    goal: (l, a) => `残り ${l}・目標 ${a} 以下`,
    hammer: 'ハンマー',
    hammerOn: '取りのぞきたいタイルをタップしてください。',
    outOfHammers: 'ハンマーが残っていません。新しいレベルをクリアするたびに1つ増えます。',
    outOfUndo: '取り消しが残っていません。新しいレベルをクリアするたびに1つ増えます。',
    reward: '取り消し、ヒント、ハンマーを1つずつもらいました',
    tapTip: '同じ色でとなり合う2つ以上のタイルをタップします。',
    lone: '1つだけのタイルは消えません。同じ色が2つ以上となり合う必要があります。',
    lostTitle: '消せるタイルがありません',
    lostBody: (l, a) => `タイルが${l}個残りました。目標は${a}個以下です。大きなかたまりを後に残すとうまくいきます。もう一度挑戦しましょう。`,
    cleared: (l) => (l ? `残り ${l} 個` : '盤面がからっぽ！'),
    perfect: '盤面がからっぽ！',
    rules: [
      '同じ色でとなり合う2つ以上のタイルをタップすると、まとめて消えます。かたまりが大きいほど点数が多くなります。',
      '上のタイルは下に落ち、からになった列は真ん中に寄ります。',
      '消せるかたまりがなくなるとゲーム終了です。目標：上に表示された数より多く残さないこと。',
      '色ごとにマーク（ハート、しずく、葉、太陽、月）があり、色が見分けやすくなっています。',
      '「取り消し」で最後の手を戻し、「ヒント」で良いかたまりを教え、「ハンマー」でタイルを1つ取りのぞきます。どれも数に限りがあり、新しいレベルをクリアするたびに1つずつ増えます。',
    ],
  },
  ko: {
    title: 'Huzur 컬러팝',
    tagline: '같은 색을 찾아, 눌러서, 팡!',
    goal: (l, a) => `남은 ${l} · 목표 ${a} 이하`,
    hammer: '망치',
    hammerOn: '없애고 싶은 타일을 누르세요.',
    outOfHammers: '망치가 남아 있지 않아요. 새 레벨을 이길 때마다 1개를 받아요.',
    outOfUndo: '되돌리기가 남아 있지 않아요. 새 레벨을 이길 때마다 1개를 받아요.',
    reward: '되돌리기, 힌트, 망치를 1개씩 받았어요',
    tapTip: '같은 색으로 붙어 있는 타일 2개 이상을 누르세요.',
    lone: '타일 하나만으로는 터지지 않아요. 같은 색 타일이 2개 이상 붙어 있어야 해요.',
    lostTitle: '더 터뜨릴 수 없어요',
    lostBody: (l, a) => `타일이 ${l}개 남았어요. 목표는 ${a}개 이하예요. 큰 덩어리를 나중에 남겨 두면 도움이 돼요. 다시 도전해 보세요.`,
    cleared: (l) => (l ? `${l}개 남음` : '판이 깨끗해졌어요!'),
    perfect: '판이 깨끗해졌어요!',
    rules: [
      '같은 색으로 붙어 있는 타일 2개 이상을 누르면 함께 터져요. 덩어리가 클수록 점수가 많아요.',
      '위의 타일은 아래로 떨어지고, 빈 줄은 가운데로 모여요.',
      '터뜨릴 덩어리가 없으면 게임이 끝나요. 목표: 위에 표시된 수보다 많이 남기지 않기.',
      '색마다 모양(하트, 물방울, 잎, 해, 달)이 있어서 색을 쉽게 구별할 수 있어요.',
      '"되돌리기"는 마지막 수를 되돌리고, "힌트"는 좋은 덩어리를 보여 주고, "망치"는 타일 하나를 없애요. 모두 개수가 정해져 있고 새 레벨을 이길 때마다 1개씩 받아요.',
    ],
  },
});
