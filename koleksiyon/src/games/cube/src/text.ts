/** Huzur Mahjong Cube metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  left: (n: number) => string;
  rotate: string;
  blocked: string;
  shuffled: string;
  tapTip: string;
  reward: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Mahjong Küp',
    tagline: 'Aynı sembollü küpleri eşleştir, kuleyi indir!',
    left: (n) => `${n} küp`,
    rotate: 'Döndür',
    blocked: 'Bu küp şimdilik kapalı: üstü ya da yanları dolu.',
    shuffled: 'Eşleşme kalmadı, semboller karıştırıldı.',
    tapTip: 'Aynı sembollü iki açık küpe dokunun. Arkayı görmek için "Döndür".',
    reward: '+1 İpucu kazandınız',
    cleared: 'Tüm küpler kalktı',
    rules: [
      'Aynı sembollü iki küpe dokunun; ikisi de açıksa birlikte kalkar.',
      'Bir küp açıktır: üstünde küp yoksa ve dört yanından en az biri boşsa. Kapalı küpler biraz koyu görünür.',
      '"Döndür" düğmesi kuleyi çeyrek tur çevirir; arkada kalan küpleri böyle görebilirsiniz.',
      'Her seviyenin en az bir çözümü vardır. Eşleşme kalmazsa semboller kendiliğinden karışır.',
      'İpucu eşleşebilecek iki küpü gösterir. Sınırlıdır; her kazanılan yeni seviye 1 tane kazandırır. Süre sınırı yoktur.',
    ],
  },
  en: {
    title: 'Huzur Mahjong Cube',
    tagline: 'Match cubes with the same symbol, clear the tower!',
    left: (n) => `${n} cubes`,
    rotate: 'Turn',
    blocked: 'This cube is blocked for now: its top or its sides are covered.',
    shuffled: 'No matches left, the symbols were shuffled.',
    tapTip: 'Tap two open cubes with the same symbol. Use "Turn" to see the back.',
    reward: 'You earned +1 hint',
    cleared: 'All cubes cleared',
    rules: [
      'Tap two cubes with the same symbol; if both are open, they are removed together.',
      'A cube is open when nothing sits on top of it and at least one of its four sides is free. Blocked cubes look a little darker.',
      'The "Turn" button rotates the tower a quarter turn, so you can see the cubes at the back.',
      'Every level has at least one solution. If no match is left, the symbols shuffle by themselves.',
      'Hint shows two cubes that can be matched. Hints are limited; every new level you win earns 1. There is no time limit.',
    ],
  },
  pt: {
    title: 'Huzur Mahjong Cubo',
    tagline: 'Combine cubos com o mesmo símbolo, desmonte a torre!',
    left: (n) => `${n} cubos`,
    rotate: 'Girar',
    blocked: 'Este cubo está preso por enquanto: o topo ou os lados estão cobertos.',
    shuffled: 'Sem pares, os símbolos foram embaralhados.',
    tapTip: 'Toque em dois cubos livres com o mesmo símbolo. Use "Girar" para ver o fundo.',
    reward: 'Você ganhou +1 dica',
    cleared: 'Todos os cubos removidos',
    rules: [
      'Toque em dois cubos com o mesmo símbolo; se os dois estiverem livres, saem juntos.',
      'Um cubo está livre quando não há nada em cima dele e pelo menos um dos quatro lados está aberto. Cubos presos ficam um pouco mais escuros.',
      'O botão "Girar" vira a torre um quarto de volta, para você ver os cubos de trás.',
      'Todo nível tem pelo menos uma solução. Se não houver pares, os símbolos se embaralham sozinhos.',
      'A dica mostra dois cubos que podem ser combinados. As dicas são limitadas; cada nível novo vencido dá 1. Não há limite de tempo.',
    ],
  },
  de: {
    title: 'Huzur Mahjong Würfel',
    tagline: 'Würfel mit gleichem Symbol paaren, den Turm abbauen!',
    left: (n) => `${n} Würfel`,
    rotate: 'Drehen',
    blocked: 'Dieser Würfel ist noch blockiert: oben oder an den Seiten liegt etwas.',
    shuffled: 'Keine Paare mehr, die Symbole wurden gemischt.',
    tapTip: 'Tippe auf zwei freie Würfel mit gleichem Symbol. Mit „Drehen“ siehst du die Rückseite.',
    reward: 'Du hast +1 Tipp erhalten',
    cleared: 'Alle Würfel abgeräumt',
    rules: [
      'Tippe auf zwei Würfel mit gleichem Symbol; sind beide frei, verschwinden sie zusammen.',
      'Ein Würfel ist frei, wenn nichts auf ihm liegt und mindestens eine seiner vier Seiten offen ist. Blockierte Würfel sind etwas dunkler.',
      'Die Taste „Drehen“ dreht den Turm um eine Vierteldrehung, so siehst du die hinteren Würfel.',
      'Jedes Level hat mindestens eine Lösung. Gibt es kein Paar mehr, werden die Symbole von selbst gemischt.',
      'Der Tipp zeigt zwei passende Würfel. Tipps sind begrenzt; jedes neu gewonnene Level bringt 1. Es gibt kein Zeitlimit.',
    ],
  },
  fr: {
    title: 'Huzur Mahjong Cube',
    tagline: 'Associez les cubes au même symbole, défaites la tour !',
    left: (n) => `${n} cubes`,
    rotate: 'Tourner',
    blocked: 'Ce cube est bloqué pour l’instant : son dessus ou ses côtés sont couverts.',
    shuffled: 'Plus de paires, les symboles ont été mélangés.',
    tapTip: 'Touchez deux cubes libres au même symbole. « Tourner » montre l’arrière.',
    reward: 'Vous gagnez +1 indice',
    cleared: 'Tous les cubes sont retirés',
    rules: [
      'Touchez deux cubes au même symbole ; s’ils sont libres tous les deux, ils partent ensemble.',
      'Un cube est libre quand rien n’est posé dessus et qu’au moins un de ses quatre côtés est dégagé. Les cubes bloqués sont un peu plus sombres.',
      'Le bouton « Tourner » fait pivoter la tour d’un quart de tour pour voir les cubes de derrière.',
      'Chaque niveau a au moins une solution. S’il ne reste aucune paire, les symboles se mélangent tout seuls.',
      'L’indice montre deux cubes à associer. Les indices sont limités ; chaque nouveau niveau gagné en rapporte 1. Il n’y a pas de limite de temps.',
    ],
  },
  ja: {
    title: 'Huzur 麻雀キューブ',
    tagline: '同じマークのキューブを合わせて、塔をくずそう！',
    left: (n) => `${n} 個`,
    rotate: '回す',
    blocked: 'このキューブはまだ取れません。上か横がふさがっています。',
    shuffled: '合わせられるキューブがないので、マークを混ぜました。',
    tapTip: '同じマークの取れるキューブを2つタップします。うしろは「回す」で見られます。',
    reward: 'ヒントを1つもらいました',
    cleared: 'すべてのキューブを取りました',
    rules: [
      '同じマークのキューブを2つタップします。どちらも取れる状態なら、いっしょに消えます。',
      'キューブは、上に何ものっておらず、4つの横のうち1つ以上があいていれば取れます。取れないキューブは少し暗く見えます。',
      '「回す」ボタンで塔を4分の1回転させ、うしろのキューブを見ることができます。',
      'どのレベルにも必ず解き方があります。合わせられるキューブがなくなると、マークが自動で混ざります。',
      'ヒントは合わせられる2つのキューブを教えます。数に限りがあり、新しいレベルをクリアするたびに1つ増えます。時間制限はありません。',
    ],
  },
  ko: {
    title: 'Huzur 마작 큐브',
    tagline: '같은 모양의 큐브를 짝지어 탑을 허물어요!',
    left: (n) => `${n}개`,
    rotate: '돌리기',
    blocked: '이 큐브는 아직 뺄 수 없어요. 위나 옆이 막혀 있어요.',
    shuffled: '짝이 없어서 모양을 섞었어요.',
    tapTip: '같은 모양의 열린 큐브 두 개를 누르세요. 뒤쪽은 "돌리기"로 볼 수 있어요.',
    reward: '힌트 1개를 받았어요',
    cleared: '모든 큐브를 뺐어요',
    rules: [
      '같은 모양의 큐브 두 개를 누르세요. 둘 다 열려 있으면 함께 사라져요.',
      '큐브 위에 아무것도 없고 네 옆면 중 하나 이상이 비어 있으면 열린 큐브예요. 막힌 큐브는 조금 어둡게 보여요.',
      '"돌리기" 버튼으로 탑을 4분의 1바퀴 돌려 뒤쪽 큐브를 볼 수 있어요.',
      '모든 레벨에는 적어도 하나의 풀이가 있어요. 짝이 남지 않으면 모양이 저절로 섞여요.',
      '힌트는 짝지을 수 있는 큐브 두 개를 보여 줘요. 개수가 정해져 있고 새 레벨을 이길 때마다 1개를 받아요. 시간 제한은 없어요.',
    ],
  },
});
