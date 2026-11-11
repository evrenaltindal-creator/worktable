/** Huzur Jewels metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  moves: (n: number) => string;
  goal: string;
  hammer: string;
  hammerOn: string;
  outOfHammers: string;
  reward: string;
  shuffled: string;
  swapTip: string;
  lostTitle: string;
  lostBody: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Mücevher',
    tagline: 'Yer değiştir, üçle, parılda!',
    moves: (n) => `${n} hamle`,
    goal: 'Hedef',
    hammer: 'Çekiç',
    hammerOn: 'Kırmak istediğiniz taşa dokunun.',
    outOfHammers: 'Çekiciniz kalmadı. Her kazandığınız yeni seviye 1 tane kazandırır.',
    reward: '+1 Çekiç kazandınız',
    shuffled: 'Hamle kalmadı, taşlar karıştırıldı.',
    swapTip: 'Yan yana iki taşı yer değiştirin: önce birine, sonra yanındakine dokunun ya da kaydırın.',
    lostTitle: 'Hamleler bitti',
    lostBody: 'Olsun! Tekrar deneyin; dörtlü ve L şekilli eşleşmeler güçlü taşlar verir.',
    cleared: 'Hedef tamamlandı',
    rules: [
      'Yan yana iki taşı yer değiştirin. Aynı taştan 3 veya daha fazlası yatay ya da dikey sıralanırsa patlar.',
      'Üstteki hedefte gösterilen taşları, hamleleriniz bitmeden toplayın.',
      '4 taş sıralarsanız ok işaretli taş oluşur: patlayınca bütün satırı ya da sütunu temizler.',
      'L ya da T şekli bomba taşı verir (çevresini temizler). 5 taş sıralarsanız gökkuşağı yıldızı oluşur: bir taşla yer değiştirince o renkteki tüm taşları temizler.',
      'İpucu iyi bir hamleyi gösterir. Çekiç tek bir taşı hamle harcamadan kırar. İkisi de sınırlıdır; her kazanılan yeni seviye 1 tane kazandırır.',
    ],
  },
  en: {
    title: 'Huzur Jewels',
    tagline: 'Swap, match three, sparkle!',
    moves: (n) => `${n} moves`,
    goal: 'Goal',
    hammer: 'Hammer',
    hammerOn: 'Tap the jewel you want to break.',
    outOfHammers: 'No hammers left. Every new level you win earns 1.',
    reward: 'You earned +1 hammer',
    shuffled: 'No moves left, the jewels were shuffled.',
    swapTip: 'Swap two neighbouring jewels: tap one, then the one next to it, or swipe.',
    lostTitle: 'Out of moves',
    lostBody: 'No worries! Try again; matches of four and L shapes make powerful jewels.',
    cleared: 'Goal complete',
    rules: [
      'Swap two neighbouring jewels. Three or more of the same jewel in a row or column pop.',
      'Collect the jewels shown in the goal before you run out of moves.',
      'Line up 4 jewels to make an arrow jewel: when it pops it clears its whole row or column.',
      'An L or T shape makes a bomb jewel (clears around it). Line up 5 to make a rainbow star: swap it with a jewel to clear every jewel of that colour.',
      'Hint shows a good move. Hammer breaks one jewel without using a move. Both are limited; every new level you win earns 1.',
    ],
  },
  pt: {
    title: 'Huzur Joias',
    tagline: 'Troque, junte três, brilhe!',
    moves: (n) => `${n} jogadas`,
    goal: 'Meta',
    hammer: 'Martelo',
    hammerOn: 'Toque na joia que deseja quebrar.',
    outOfHammers: 'Seus martelos acabaram. Cada nível novo vencido dá 1.',
    reward: 'Você ganhou +1 martelo',
    shuffled: 'Sem jogadas, as joias foram embaralhadas.',
    swapTip: 'Troque duas joias vizinhas: toque em uma e depois na do lado, ou deslize.',
    lostTitle: 'As jogadas acabaram',
    lostBody: 'Tudo bem! Tente de novo; grupos de quatro e em L criam joias poderosas.',
    cleared: 'Meta concluída',
    rules: [
      'Troque duas joias vizinhas. Três ou mais joias iguais em linha ou coluna estouram.',
      'Colete as joias mostradas na meta antes que as jogadas acabem.',
      'Alinhe 4 joias para criar uma joia de seta: ao estourar, limpa a linha ou coluna inteira.',
      'Um L ou T cria uma joia bomba (limpa ao redor). Alinhe 5 para criar uma estrela arco-íris: troque-a com uma joia para limpar todas daquela cor.',
      'A dica mostra uma boa jogada. O martelo quebra uma joia sem gastar jogada. Ambos são limitados; cada nível novo vencido dá 1.',
    ],
  },
  de: {
    title: 'Huzur Juwelen',
    tagline: 'Tauschen, drei verbinden, funkeln!',
    moves: (n) => `${n} Züge`,
    goal: 'Ziel',
    hammer: 'Hammer',
    hammerOn: 'Tippe auf das Juwel, das du zerschlagen möchtest.',
    outOfHammers: 'Keine Hämmer mehr. Jedes neu gewonnene Level bringt 1.',
    reward: 'Du hast +1 Hammer erhalten',
    shuffled: 'Keine Züge mehr, die Juwelen wurden gemischt.',
    swapTip: 'Tausche zwei benachbarte Juwelen: tippe auf eines und dann auf das daneben, oder wische.',
    lostTitle: 'Keine Züge mehr',
    lostBody: 'Kein Problem! Versuch es noch einmal; Vierer und L-Formen ergeben starke Juwelen.',
    cleared: 'Ziel erreicht',
    rules: [
      'Tausche zwei benachbarte Juwelen. Drei oder mehr gleiche Juwelen in einer Reihe oder Spalte platzen.',
      'Sammle die im Ziel gezeigten Juwelen, bevor die Züge ausgehen.',
      'Vier in einer Reihe ergeben ein Pfeil-Juwel: Es räumt beim Platzen die ganze Reihe oder Spalte.',
      'Eine L- oder T-Form ergibt ein Bomben-Juwel (räumt die Umgebung). Fünf in einer Reihe ergeben einen Regenbogenstern: Tausche ihn mit einem Juwel, um alle Juwelen dieser Farbe zu räumen.',
      'Der Tipp zeigt einen guten Zug. Der Hammer zerschlägt ein Juwel ohne Zug. Beide sind begrenzt; jedes neu gewonnene Level bringt 1.',
    ],
  },
  fr: {
    title: 'Huzur Joyaux',
    tagline: 'Échangez, alignez trois, brillez !',
    moves: (n) => `${n} coups`,
    goal: 'Objectif',
    hammer: 'Marteau',
    hammerOn: 'Touchez le joyau à briser.',
    outOfHammers: 'Plus de marteaux. Chaque nouveau niveau gagné en rapporte 1.',
    reward: 'Vous gagnez +1 marteau',
    shuffled: 'Plus de coups possibles, les joyaux ont été mélangés.',
    swapTip: 'Échangez deux joyaux voisins : touchez-en un puis celui d’à côté, ou faites glisser.',
    lostTitle: 'Plus de coups',
    lostBody: 'Pas grave ! Réessayez ; les alignements de quatre et en L créent des joyaux puissants.',
    cleared: 'Objectif atteint',
    rules: [
      'Échangez deux joyaux voisins. Trois joyaux identiques ou plus alignés en ligne ou en colonne éclatent.',
      'Récoltez les joyaux de l’objectif avant d’avoir épuisé vos coups.',
      'Alignez 4 joyaux pour créer un joyau flèche : en éclatant, il vide toute sa ligne ou sa colonne.',
      'Une forme en L ou en T crée un joyau bombe (vide les alentours). Alignez-en 5 pour créer une étoile arc-en-ciel : échangez-la avec un joyau pour retirer tous ceux de cette couleur.',
      'L’indice montre un bon coup. Le marteau brise un joyau sans utiliser de coup. Les deux sont limités ; chaque nouveau niveau gagné en rapporte 1.',
    ],
  },
  ja: {
    title: 'Huzur ジュエル',
    tagline: '入れ替えて、3つそろえて、きらり！',
    moves: (n) => `残り ${n} 手`,
    goal: '目標',
    hammer: 'ハンマー',
    hammerOn: 'こわしたい宝石をタップしてください。',
    outOfHammers: 'ハンマーが残っていません。新しいレベルをクリアするたびに1つ増えます。',
    reward: 'ハンマーを1つもらいました',
    shuffled: '動かせる手がないので、宝石を混ぜました。',
    swapTip: 'となり合う2つの宝石を入れ替えます。1つをタップしてからとなりをタップするか、スワイプします。',
    lostTitle: '手数がなくなりました',
    lostBody: '大丈夫！もう一度挑戦しましょう。4つそろえやL字は強い宝石になります。',
    cleared: '目標達成',
    rules: [
      'となり合う2つの宝石を入れ替えます。同じ宝石が縦か横に3つ以上並ぶと消えます。',
      '手数がなくなる前に、目標に表示された宝石を集めましょう。',
      '4つ並べると矢印の宝石ができます。消えると横一列か縦一列をまとめて消します。',
      'L字やT字はボムの宝石になり、まわりを消します。5つ並べるとにじの星ができ、宝石と入れ替えるとその色をすべて消します。',
      'ヒントは良い手を教えます。ハンマーは手数を使わずに宝石を1つこわします。どちらも数に限りがあり、新しいレベルをクリアするたびに1つ増えます。',
    ],
  },
  ko: {
    title: 'Huzur 보석',
    tagline: '바꾸고, 셋을 맞추고, 반짝!',
    moves: (n) => `${n}번 남음`,
    goal: '목표',
    hammer: '망치',
    hammerOn: '깨고 싶은 보석을 누르세요.',
    outOfHammers: '망치가 남아 있지 않아요. 새 레벨을 이길 때마다 1개를 받아요.',
    reward: '망치 1개를 받았어요',
    shuffled: '움직일 수 있는 수가 없어 보석을 섞었어요.',
    swapTip: '이웃한 두 보석을 바꾸세요. 하나를 누르고 옆의 보석을 누르거나 밀어 주세요.',
    lostTitle: '이동 횟수를 다 썼어요',
    lostBody: '괜찮아요! 다시 도전해 보세요. 4개 맞추기와 L자 모양은 강한 보석을 만들어요.',
    cleared: '목표 달성',
    rules: [
      '이웃한 두 보석을 바꾸세요. 같은 보석이 가로나 세로로 3개 이상 이어지면 터져요.',
      '이동 횟수가 끝나기 전에 목표에 표시된 보석을 모으세요.',
      '4개를 맞추면 화살표 보석이 생겨요. 터지면 그 줄 전체를 지워요.',
      'L자나 T자는 폭탄 보석을 만들어요(주변을 지워요). 5개를 맞추면 무지개 별이 생겨요. 보석과 바꾸면 그 색 보석을 모두 지워요.',
      '힌트는 좋은 수를 보여 줘요. 망치는 이동 횟수를 쓰지 않고 보석 하나를 깨요. 둘 다 개수가 정해져 있고 새 레벨을 이길 때마다 1개를 받아요.',
    ],
  },
});
