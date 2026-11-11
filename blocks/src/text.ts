/** Huzur Blocks metinleri (7 dil). Ortak metinler src/kit/i18n.ts içinde (c). */
import { texts } from './kit/i18n';

type T = {
  title: string;
  tagline: string;
  classic: string;
  best: (n: number) => string;
  target: (score: number, target: number) => string;
  refresh: string;
  outOfRefresh: string;
  reward: string;
  dragTip: string;
  lostTitle: string;
  lostBody: string;
  overTitle: string;
  overBody: (score: number, best: number) => string;
  newBest: string;
  cleared: string;
  rules: string[];
};

export const t = texts<T>({
  tr: {
    title: 'Huzur Blok',
    tagline: 'Yerleştir, satırı doldur, temizle!',
    classic: 'Klasik',
    best: (n) => `En iyi: ${n}`,
    target: (s, g) => `${s} / ${g} puan`,
    refresh: 'Yenile',
    outOfRefresh: 'Yenileme hakkınız kalmadı. Her kazandığınız yeni seviye 1 tane kazandırır.',
    reward: '+1 İpucu ve +1 Yenile kazandınız',
    dragTip: 'Alttaki bir parçayı sürükleyip tahtaya bırakın ya da parçaya, sonra tahtaya dokunun.',
    lostTitle: 'Yer kalmadı',
    lostBody: 'Olsun! Tekrar deneyin; büyük parçalara yer açık bırakmaya çalışın.',
    overTitle: 'Oyun bitti',
    overBody: (s, b) => `Puanınız: ${s}\nEn iyi: ${b}`,
    newBest: 'Yeni rekor!',
    cleared: 'Hedef puana ulaştınız',
    rules: [
      'Alttaki parçalardan birini sürükleyip tahtaya bırakın. İsterseniz önce parçaya, sonra tahtada koymak istediğiniz yere dokunun.',
      'Bir satır, sütun ya da kalın çizgili 3x3 kutu tamamen dolunca temizlenir ve puan kazanırsınız.',
      'Aynı anda birden fazla bölge temizlemek ve art arda temizlemek daha çok puan verir.',
      'Seviyelerde hedef puana ulaşın. Hiçbir parça sığmazsa oyun biter. Klasik oyunda olabildiğince yüksek puan yapın.',
      'İpucu iyi bir yeri gösterir. "Yenile" üç parçayı değiştirir. İkisi de sınırlıdır; her kazanılan yeni seviye 1 tane kazandırır.',
    ],
  },
  en: {
    title: 'Huzur Blocks',
    tagline: 'Place, fill the line, clear!',
    classic: 'Classic',
    best: (n) => `Best: ${n}`,
    target: (s, g) => `${s} / ${g} pts`,
    refresh: 'New pieces',
    outOfRefresh: 'No new pieces left. Every new level you win earns 1.',
    reward: 'You earned +1 hint and +1 new pieces',
    dragTip: 'Drag a piece from below onto the board, or tap a piece and then the board.',
    lostTitle: 'No room left',
    lostBody: 'No worries! Try again and keep space free for the big pieces.',
    overTitle: 'Game over',
    overBody: (s, b) => `Your score: ${s}\nBest: ${b}`,
    newBest: 'New best!',
    cleared: 'You reached the target score',
    rules: [
      'Drag one of the pieces below onto the board. You can also tap a piece first and then the place on the board.',
      'When a row, a column or a 3x3 box (thick lines) is completely full, it clears and you score points.',
      'Clearing several areas at once, or several turns in a row, gives more points.',
      'In levels, reach the target score. If no piece fits, the game ends. In Classic, score as high as you can.',
      'Hint shows a good spot. "New pieces" swaps the three pieces. Both are limited; every new level you win earns 1.',
    ],
  },
  pt: {
    title: 'Huzur Blocos',
    tagline: 'Encaixe, complete a linha, limpe!',
    classic: 'Clássico',
    best: (n) => `Recorde: ${n}`,
    target: (s, g) => `${s} / ${g} pontos`,
    refresh: 'Trocar peças',
    outOfRefresh: 'As trocas acabaram. Cada nível novo vencido dá 1.',
    reward: 'Você ganhou +1 dica e +1 troca',
    dragTip: 'Arraste uma peça de baixo até o tabuleiro, ou toque na peça e depois no tabuleiro.',
    lostTitle: 'Sem espaço',
    lostBody: 'Tudo bem! Tente de novo e deixe espaço para as peças grandes.',
    overTitle: 'Fim de jogo',
    overBody: (s, b) => `Sua pontuação: ${s}\nRecorde: ${b}`,
    newBest: 'Novo recorde!',
    cleared: 'Você atingiu a pontuação da meta',
    rules: [
      'Arraste uma das peças de baixo até o tabuleiro. Você também pode tocar primeiro na peça e depois no lugar do tabuleiro.',
      'Quando uma linha, uma coluna ou um quadro 3x3 (linhas grossas) fica cheio, ele é limpo e você ganha pontos.',
      'Limpar várias áreas de uma vez, ou várias vezes seguidas, dá mais pontos.',
      'Nos níveis, alcance a pontuação da meta. Se nenhuma peça couber, o jogo acaba. No Clássico, faça o máximo de pontos.',
      'A dica mostra um bom lugar. "Trocar peças" troca as três peças. Ambos são limitados; cada nível novo vencido dá 1.',
    ],
  },
  de: {
    title: 'Huzur Blöcke',
    tagline: 'Setzen, Reihe füllen, räumen!',
    classic: 'Klassisch',
    best: (n) => `Rekord: ${n}`,
    target: (s, g) => `${s} / ${g} Punkte`,
    refresh: 'Neue Teile',
    outOfRefresh: 'Keine neuen Teile mehr. Jedes neu gewonnene Level bringt 1.',
    reward: 'Du hast +1 Tipp und +1 neue Teile erhalten',
    dragTip: 'Ziehe ein Teil von unten auf das Spielfeld, oder tippe auf ein Teil und dann auf das Feld.',
    lostTitle: 'Kein Platz mehr',
    lostBody: 'Kein Problem! Versuch es noch einmal und halte Platz für große Teile frei.',
    overTitle: 'Spiel vorbei',
    overBody: (s, b) => `Deine Punkte: ${s}\nRekord: ${b}`,
    newBest: 'Neuer Rekord!',
    cleared: 'Du hast die Zielpunktzahl erreicht',
    rules: [
      'Ziehe eines der Teile unten auf das Spielfeld. Du kannst auch zuerst auf das Teil und dann auf die Stelle im Feld tippen.',
      'Ist eine Reihe, eine Spalte oder ein 3x3-Kasten (dicke Linien) ganz voll, wird sie geräumt und du bekommst Punkte.',
      'Mehrere Bereiche auf einmal oder mehrmals nacheinander zu räumen, bringt mehr Punkte.',
      'In Levels erreichst du die Zielpunktzahl. Passt kein Teil mehr, ist das Spiel vorbei. Im klassischen Spiel sammelst du so viele Punkte wie möglich.',
      'Der Tipp zeigt eine gute Stelle. „Neue Teile“ tauscht die drei Teile aus. Beides ist begrenzt; jedes neu gewonnene Level bringt 1.',
    ],
  },
  fr: {
    title: 'Huzur Blocs',
    tagline: 'Placez, remplissez, effacez !',
    classic: 'Classique',
    best: (n) => `Record : ${n}`,
    target: (s, g) => `${s} / ${g} points`,
    refresh: 'Nouvelles pièces',
    outOfRefresh: 'Plus de nouvelles pièces. Chaque nouveau niveau gagné en rapporte 1.',
    reward: 'Vous gagnez +1 indice et +1 nouvelles pièces',
    dragTip: 'Faites glisser une pièce du bas vers le plateau, ou touchez une pièce puis le plateau.',
    lostTitle: 'Plus de place',
    lostBody: 'Pas grave ! Réessayez en gardant de la place pour les grandes pièces.',
    overTitle: 'Partie terminée',
    overBody: (s, b) => `Votre score : ${s}\nRecord : ${b}`,
    newBest: 'Nouveau record !',
    cleared: 'Vous avez atteint le score visé',
    rules: [
      'Faites glisser une des pièces du bas sur le plateau. Vous pouvez aussi toucher d’abord la pièce puis l’endroit voulu.',
      'Quand une ligne, une colonne ou un carré 3x3 (traits épais) est plein, il s’efface et vous marquez des points.',
      'Effacer plusieurs zones à la fois, ou plusieurs fois de suite, rapporte plus de points.',
      'Dans les niveaux, atteignez le score visé. Si aucune pièce ne rentre, la partie est finie. En Classique, marquez le plus possible.',
      'L’indice montre un bon emplacement. « Nouvelles pièces » remplace les trois pièces. Les deux sont limités ; chaque nouveau niveau gagné en rapporte 1.',
    ],
  },
  ja: {
    title: 'Huzur ブロック',
    tagline: '置いて、そろえて、消そう！',
    classic: 'クラシック',
    best: (n) => `ベスト：${n}`,
    target: (s, g) => `${s} / ${g} 点`,
    refresh: 'ピース交換',
    outOfRefresh: 'ピース交換が残っていません。新しいレベルをクリアするたびに1つ増えます。',
    reward: 'ヒントとピース交換を1つずつもらいました',
    dragTip: '下のピースを盤面までドラッグするか、ピースをタップしてから盤面をタップします。',
    lostTitle: '置ける場所がありません',
    lostBody: '大丈夫！大きなピースの場所を空けておくようにして、もう一度挑戦しましょう。',
    overTitle: 'ゲーム終了',
    overBody: (s, b) => `スコア：${s}\nベスト：${b}`,
    newBest: 'ベスト更新！',
    cleared: '目標スコアに届きました',
    rules: [
      '下のピースを1つ盤面までドラッグして置きます。ピースをタップしてから、置きたい場所をタップしても置けます。',
      '横の列、縦の列、太線で囲まれた3×3のマスがすべて埋まると消えて、点数がもらえます。',
      '一度にいくつも消したり、続けて消したりすると点数が多くなります。',
      'レベルでは目標スコアをめざします。どのピースも置けなくなると終了です。クラシックではできるだけ高いスコアをめざします。',
      'ヒントは良い場所を教えます。「ピース交換」で3つのピースを入れ替えます。どちらも数に限りがあり、新しいレベルをクリアするたびに1つ増えます。',
    ],
  },
  ko: {
    title: 'Huzur 블록',
    tagline: '놓고, 줄을 채우고, 지우세요!',
    classic: '클래식',
    best: (n) => `최고: ${n}`,
    target: (s, g) => `${s} / ${g}점`,
    refresh: '새 조각',
    outOfRefresh: '새 조각 기회가 남아 있지 않아요. 새 레벨을 이길 때마다 1개를 받아요.',
    reward: '힌트 1개와 새 조각 1개를 받았어요',
    dragTip: '아래 조각을 판으로 끌어다 놓거나, 조각을 누른 뒤 판을 누르세요.',
    lostTitle: '놓을 자리가 없어요',
    lostBody: '괜찮아요! 큰 조각을 놓을 자리를 남겨 두며 다시 도전해 보세요.',
    overTitle: '게임 끝',
    overBody: (s, b) => `점수: ${s}\n최고: ${b}`,
    newBest: '최고 기록!',
    cleared: '목표 점수에 도달했어요',
    rules: [
      '아래 조각 중 하나를 판으로 끌어다 놓으세요. 조각을 먼저 누르고 판에서 놓을 곳을 눌러도 돼요.',
      '가로줄, 세로줄 또는 굵은 선의 3×3 칸이 가득 차면 지워지고 점수를 얻어요.',
      '한 번에 여러 곳을 지우거나 연속으로 지우면 점수가 더 많아요.',
      '레벨에서는 목표 점수에 도달하세요. 어떤 조각도 들어가지 않으면 게임이 끝나요. 클래식에서는 최대한 높은 점수를 노리세요.',
      '힌트는 좋은 자리를 보여 줘요. "새 조각"은 세 조각을 바꿔요. 둘 다 개수가 정해져 있고 새 레벨을 이길 때마다 1개를 받아요.',
    ],
  },
});
