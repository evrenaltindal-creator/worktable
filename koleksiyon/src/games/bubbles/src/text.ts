/** Huzur Bubbles metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  swap: string;
  rainbow: string;
  outOfRainbow: string;
  reward: string;
  shotsToCeiling: (n: number) => string;
  ceilingDown: string;
  aimTip: string;
  lostTitle: string;
  lostBody: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Balonlar',
    tagline: 'Nişan al, aynı renkleri buluştur, patlat!',
    swap: 'Değiştir',
    rainbow: 'Gökkuşağı',
    reward: '+1 Gökkuşağı balonu kazandınız',
    outOfRainbow: 'Gökkuşağı balonunuz kalmadı. Her kazandığınız seviye 1 tane kazandırır.',
    shotsToCeiling: (n) => `Tavan: ${n} atış`,
    ceilingDown: 'Tavan indi!',
    aimTip: 'Parmağınızı tahtada gezdirerek nişan alın, bırakınca balon fırlar.',
    lostTitle: 'Balonlar aşağı ulaştı',
    lostBody: 'Olsun! Tekrar deneyin; balonları kümeler halinde düşürmeye çalışın.',
    cleared: 'Tüm balonlar patladı',
    rules: [
      'Parmağınızı tahtada gezdirerek nişan alın; bıraktığınızda balon fırlar ve duvarlardan seker.',
      'Aynı renkten en az 3 balon bir araya gelince patlar. Askıda kalan balonlar da düşer.',
      'Her balonun içinde ayrı bir şekil vardır (kalp, yıldız, yaprak, güneş, elmas, çiçek); renkleri ayırt etmek kolaydır.',
      'Patlatmadan yapılan birkaç atıştan sonra tavan iner. Balonlar alt çizgiye ulaşırsa oyun biter.',
      '"Değiştir" sıradaki balonla yer değiştirir. "Gökkuşağı" balonu her renge uyar; sınırlıdır ve her kazanılan seviye 1 tane kazandırır.',
    ],
  },
  en: {
    title: 'Huzur Bubbles',
    tagline: 'Aim, match the colours and pop!',
    swap: 'Swap',
    rainbow: 'Rainbow',
    reward: 'You earned +1 rainbow bubble',
    outOfRainbow: 'No rainbow bubbles left. Every level you win earns 1.',
    shotsToCeiling: (n) => `Ceiling: ${n} shots`,
    ceilingDown: 'The ceiling moved down!',
    aimTip: 'Move your finger over the board to aim, then lift it to shoot.',
    lostTitle: 'The bubbles reached the bottom',
    lostBody: 'No worries! Try again and aim to drop whole clusters.',
    cleared: 'All bubbles popped',
    rules: [
      'Move your finger over the board to aim; lift it to shoot. Bubbles bounce off the walls.',
      'Three or more bubbles of the same colour pop. Bubbles left hanging fall too.',
      'Each bubble has its own symbol (heart, star, leaf, sun, diamond, flower), so colours are easy to tell apart.',
      'After a few shots without popping, the ceiling moves down. If the bubbles reach the bottom line, the game ends.',
      '"Swap" trades places with the next bubble. A "Rainbow" bubble matches any colour; they are limited and every level you win earns 1.',
    ],
  },
  pt: {
    title: 'Huzur Bolhas',
    tagline: 'Mire, junte as cores e estoure!',
    swap: 'Trocar',
    rainbow: 'Arco-íris',
    reward: 'Você ganhou +1 bolha arco-íris',
    outOfRainbow: 'Suas bolhas arco-íris acabaram. Cada nível vencido dá 1.',
    shotsToCeiling: (n) => `Teto: ${n} tiros`,
    ceilingDown: 'O teto desceu!',
    aimTip: 'Passe o dedo pelo tabuleiro para mirar e solte para atirar.',
    lostTitle: 'As bolhas chegaram ao fundo',
    lostBody: 'Tudo bem! Tente de novo e procure derrubar grupos inteiros.',
    cleared: 'Todas as bolhas estouradas',
    rules: [
      'Passe o dedo pelo tabuleiro para mirar; solte para atirar. As bolhas quicam nas paredes.',
      'Três ou mais bolhas da mesma cor estouram. As que ficarem soltas também caem.',
      'Cada bolha tem um símbolo (coração, estrela, folha, sol, diamante, flor), fácil de distinguir.',
      'Depois de alguns tiros sem estourar, o teto desce. Se as bolhas chegarem à linha de baixo, o jogo acaba.',
      '"Trocar" troca com a próxima bolha. A bolha "Arco-íris" combina com qualquer cor; é limitada e cada nível vencido dá 1.',
    ],
  },
  de: {
    title: 'Huzur Blasen',
    tagline: 'Zielen, Farben verbinden, platzen lassen!',
    swap: 'Tauschen',
    rainbow: 'Regenbogen',
    reward: 'Du hast +1 Regenbogenblase erhalten',
    outOfRainbow: 'Keine Regenbogenblasen mehr. Jedes gewonnene Level bringt 1.',
    shotsToCeiling: (n) => `Decke: ${n} Schüsse`,
    ceilingDown: 'Die Decke ist gesunken!',
    aimTip: 'Bewege den Finger über das Spielfeld zum Zielen und lass los zum Schießen.',
    lostTitle: 'Die Blasen sind unten angekommen',
    lostBody: 'Kein Problem! Versuch es noch einmal und lass ganze Gruppen fallen.',
    cleared: 'Alle Blasen geplatzt',
    rules: [
      'Bewege den Finger über das Spielfeld zum Zielen; lass los zum Schießen. Blasen prallen von den Wänden ab.',
      'Drei oder mehr gleichfarbige Blasen platzen. Blasen ohne Halt fallen ebenfalls herunter.',
      'Jede Blase hat ein eigenes Symbol (Herz, Stern, Blatt, Sonne, Raute, Blume), so sind die Farben leicht zu unterscheiden.',
      'Nach einigen Schüssen ohne Treffer sinkt die Decke. Erreichen die Blasen die untere Linie, ist das Spiel vorbei.',
      '„Tauschen“ wechselt mit der nächsten Blase. Die „Regenbogen“-Blase passt zu jeder Farbe; sie ist begrenzt und jedes gewonnene Level bringt 1.',
    ],
  },
  fr: {
    title: 'Huzur Bulles',
    tagline: 'Visez, réunissez les couleurs, éclatez !',
    swap: 'Échanger',
    rainbow: 'Arc-en-ciel',
    reward: 'Vous gagnez +1 bulle arc-en-ciel',
    outOfRainbow: 'Plus de bulles arc-en-ciel. Chaque niveau gagné en rapporte 1.',
    shotsToCeiling: (n) => `Plafond : ${n} tirs`,
    ceilingDown: 'Le plafond est descendu !',
    aimTip: 'Faites glisser le doigt sur le plateau pour viser, relâchez pour tirer.',
    lostTitle: 'Les bulles ont atteint le bas',
    lostBody: 'Pas grave ! Réessayez en faisant tomber des groupes entiers.',
    cleared: 'Toutes les bulles ont éclaté',
    rules: [
      'Faites glisser le doigt pour viser ; relâchez pour tirer. Les bulles rebondissent sur les murs.',
      'Trois bulles de même couleur ou plus éclatent. Les bulles qui ne tiennent plus tombent aussi.',
      'Chaque bulle a son symbole (cœur, étoile, feuille, soleil, losange, fleur) : les couleurs se distinguent facilement.',
      'Après quelques tirs sans éclater de bulle, le plafond descend. Si les bulles atteignent la ligne du bas, la partie est finie.',
      '« Échanger » inverse avec la bulle suivante. La bulle « Arc-en-ciel » va avec toutes les couleurs ; elle est limitée et chaque niveau gagné en rapporte 1.',
    ],
  },
  ja: {
    title: 'Huzur バブル',
    tagline: 'ねらって、同じ色をそろえて、パチン！',
    swap: '入れ替え',
    rainbow: 'にじ玉',
    reward: 'にじ玉を1つもらいました',
    outOfRainbow: 'にじ玉が残っていません。レベルをクリアするたびに1つ増えます。',
    shotsToCeiling: (n) => `天井まで ${n} 発`,
    ceilingDown: '天井が下がりました！',
    aimTip: '盤面の上で指を動かしてねらい、離すと発射します。',
    lostTitle: 'バブルが下まで来ました',
    lostBody: '大丈夫！かたまりごと落とすようにねらって、もう一度挑戦しましょう。',
    cleared: 'すべてのバブルを消しました',
    rules: [
      '盤面の上で指を動かしてねらい、離すと発射します。バブルは壁で跳ね返ります。',
      '同じ色のバブルが3つ以上つながると消えます。ぶら下がったバブルも落ちます。',
      'バブルにはそれぞれ形のマーク（ハート、星、葉、太陽、ダイヤ、花）があり、色が見分けやすくなっています。',
      'しばらく消せない発射が続くと天井が下がります。バブルが下の線まで来るとゲーム終了です。',
      '「入れ替え」で次のバブルと交換できます。「にじ玉」はどの色ともつながります。数に限りがあり、クリアするたびに1つ増えます。',
    ],
  },
  ko: {
    title: 'Huzur 버블',
    tagline: '조준하고, 같은 색을 모아, 터뜨리세요!',
    swap: '바꾸기',
    rainbow: '무지개',
    reward: '무지개 버블 1개를 받았어요',
    outOfRainbow: '무지개 버블이 남아 있지 않아요. 레벨을 이길 때마다 1개를 받아요.',
    shotsToCeiling: (n) => `천장까지 ${n}발`,
    ceilingDown: '천장이 내려왔어요!',
    aimTip: '판 위에서 손가락을 움직여 조준하고, 떼면 발사돼요.',
    lostTitle: '버블이 바닥에 닿았어요',
    lostBody: '괜찮아요! 덩어리째 떨어뜨리도록 조준해서 다시 도전해 보세요.',
    cleared: '모든 버블을 터뜨렸어요',
    rules: [
      '판 위에서 손가락을 움직여 조준하고, 떼면 발사돼요. 버블은 벽에 튕겨요.',
      '같은 색 버블이 3개 이상 모이면 터져요. 매달린 버블도 떨어져요.',
      '버블마다 모양(하트, 별, 잎, 해, 다이아몬드, 꽃)이 있어서 색을 쉽게 구별할 수 있어요.',
      '못 터뜨린 발사가 몇 번 이어지면 천장이 내려와요. 버블이 아래 선에 닿으면 게임이 끝나요.',
      '"바꾸기"는 다음 버블과 자리를 바꿔요. "무지개" 버블은 모든 색과 맞아요. 개수가 정해져 있고 레벨을 이길 때마다 1개를 받아요.',
    ],
  },
});
