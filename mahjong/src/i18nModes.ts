/**
 * Oyun modlarının metinleri (7 dil). Genel metinler src/i18n.ts içindedir.
 */
import { currentLanguage, Lang } from './i18n';
import type { ModeId } from './modes';

interface ModeText {
  name: string;
  desc: string;
  rules: string[];
}

export interface ModeStrings {
  allGames: string;
  modes: Record<ModeId, ModeText>;
  timeLeft: (t: string) => string;
  timeUpTitle: string;
  timeUpBody: string;
  tryAgain: string;
  trayFullTitle: string;
  trayFullBody: string;
  deckEmptyTitle: string;
  deckEmptyBody: string;
  autoShuffled: string;
  moves: (n: number) => string;
  deck: (n: number) => string;
  draw: string;
  dailyDone: string;
  dailyTomorrow: string;
  done: string;
  newPuzzle: string;
  sumGoal: string;
}

const tr: ModeStrings = {
  allGames: 'Tüm oyunlar',
  modes: {
    classic: {
      name: 'Klasik',
      desc: 'Serbest iki aynı taşı eşleştir.',
      rules: [],
    },
    timed: {
      name: 'Zamana Karşı',
      desc: 'Süre bitmeden tahtayı temizle.',
      rules: [
        'Klasik kurallarla oynanır: serbest iki aynı taşı eşleştir.',
        'Süre bitmeden tüm taşları kaldır.',
        'Her eşleşme süreye 3 saniye ekler.',
      ],
    },
    daily: {
      name: 'Günün Bulmacası',
      desc: 'Her gün yeni bir bulmaca.',
      rules: ['Klasik kurallarla oynanır: serbest iki aynı taşı eşleştir.', 'Bulmaca her gün değişir.'],
    },
    sum10: {
      name: 'Toplam 10',
      desc: 'Toplamı 10 olan iki taşı eşleştir.',
      rules: [
        'Sadece sayılı taşlar vardır (1-9).',
        'Toplamı 10 olan iki serbest taşı seç: 1+9, 2+8, 3+7, 4+6, 5+5.',
        'Taşın rengi önemli değildir; sadece sayıya bak.',
      ],
    },
    triple: {
      name: 'Üçlü Toplama',
      desc: 'Rafa topla, 3 aynısı kaybolur.',
      rules: [
        'Üstünde başka taş olmayan bir taşa dokun; taş alttaki rafa iner.',
        'Rafta aynı taştan 3 tane olunca üçü birden kaybolur.',
        'Rafta 7 yer var; raf dolarsa kaybedersin.',
        'Geri al düğmesi son taşı tahtaya geri koyar.',
      ],
    },
    connect: {
      name: 'Bağlantı',
      desc: 'Aynı iki taşı bir çizgiyle birleştir.',
      rules: [
        'Aynı resimli iki taşa dokun.',
        'İki taş en fazla iki kez dönen bir çizgiyle birleşebiliyorsa kalkar.',
        'Çizgi boş yerlerden ve tahtanın dışından geçebilir.',
        'Hamle kalmazsa taşlar kendiliğinden karışır.',
      ],
    },
    memory: {
      name: 'Hafıza',
      desc: 'Kapalı taşları çevir, eşlerini bul.',
      rules: [
        'Taşlar kapalıdır. İki taşa dokunup çevir.',
        'Aynıysa kaybolurlar; değilse geri kapanırlar.',
        'Ne kadar az hamlede bitirirsen o kadar çok yıldız kazanırsın.',
      ],
    },
    peaks: {
      name: 'Zirve',
      desc: 'Bir büyük ya da bir küçük taşı seç.',
      rules: [
        'Alttaki büyük taş elindeki taştır.',
        'Elindekinden bir büyük ya da bir küçük olan açık taşa dokun. 9 ile 1 de komşudur.',
        'Hamle yoksa desteden yeni taş çek.',
        'Tepelerdeki tüm taşları temizle. Destede ne kadar çok taş kalırsa o kadar çok yıldız.',
      ],
    },
  },
  timeLeft: (t) => `Süre ${t}`,
  timeUpTitle: 'Süre doldu!',
  timeUpBody: 'Neredeyse bitiyordu. Tekrar dene!',
  tryAgain: 'Tekrar dene',
  trayFullTitle: 'Raf doldu!',
  trayFullBody: 'Rafta 7 taş birikti. Tekrar dene.',
  deckEmptyTitle: 'Deste bitti!',
  deckEmptyBody: 'Oynanacak taş kalmadı. Tekrar dene.',
  autoShuffled: 'Hamle kalmadı, taşlar karıştırıldı.',
  moves: (n) => `${n} hamle`,
  deck: (n) => `Deste: ${n}`,
  draw: 'Çek',
  dailyDone: 'Bugünün bulmacası tamam!',
  dailyTomorrow: 'Yarın yeni bir bulmaca seni bekliyor.',
  done: 'Tamamlandı',
  newPuzzle: 'Yeni bulmaca',
  sumGoal: 'Toplam 10',
};

const en: ModeStrings = {
  allGames: 'All games',
  modes: {
    classic: { name: 'Classic', desc: 'Match two identical free tiles.', rules: [] },
    timed: {
      name: 'Time Attack',
      desc: 'Clear the board before time runs out.',
      rules: [
        'Classic rules: match two identical free tiles.',
        'Remove every tile before the time runs out.',
        'Each match adds 3 seconds.',
      ],
    },
    daily: {
      name: 'Daily Puzzle',
      desc: 'A new puzzle every day.',
      rules: ['Classic rules: match two identical free tiles.', 'The puzzle changes every day.'],
    },
    sum10: {
      name: 'Sum 10',
      desc: 'Match two tiles that add up to 10.',
      rules: [
        'Only number tiles (1-9) are used.',
        'Pick two free tiles that add up to 10: 1+9, 2+8, 3+7, 4+6, 5+5.',
        'Colour does not matter, only the number.',
      ],
    },
    triple: {
      name: 'Triple Collect',
      desc: 'Collect 3 alike in the tray.',
      rules: [
        'Tap a tile with nothing on top; it moves down to the tray.',
        'Three identical tiles in the tray disappear together.',
        'The tray has 7 spaces; if it fills up, you lose.',
        'Undo puts the last tile back on the board.',
      ],
    },
    connect: {
      name: 'Connect',
      desc: 'Join two identical tiles with a line.',
      rules: [
        'Tap two tiles with the same picture.',
        'They are removed if a line with at most two turns can join them.',
        'The line can pass through empty spaces and around the board.',
        'If no moves are left, the tiles shuffle by themselves.',
      ],
    },
    memory: {
      name: 'Memory',
      desc: 'Flip hidden tiles and find pairs.',
      rules: [
        'Tiles start face down. Tap two to flip them.',
        'Matching tiles disappear; others turn back over.',
        'The fewer moves you use, the more stars you earn.',
      ],
    },
    peaks: {
      name: 'Peaks',
      desc: 'Pick a tile one higher or lower.',
      rules: [
        'The big tile at the bottom is your current tile.',
        'Tap an open tile one higher or one lower. 9 and 1 also connect.',
        'If there is no move, draw a new tile from the deck.',
        'Clear every peak tile. More tiles left in the deck means more stars.',
      ],
    },
  },
  timeLeft: (t) => `Time ${t}`,
  timeUpTitle: "Time's up!",
  timeUpBody: 'You were so close. Try again!',
  tryAgain: 'Try again',
  trayFullTitle: 'Tray full!',
  trayFullBody: '7 tiles piled up in the tray. Try again.',
  deckEmptyTitle: 'Deck empty!',
  deckEmptyBody: 'No tiles left to play. Try again.',
  autoShuffled: 'No moves left, the tiles were shuffled.',
  moves: (n) => `${n} moves`,
  deck: (n) => `Deck: ${n}`,
  draw: 'Draw',
  dailyDone: "Today's puzzle is done!",
  dailyTomorrow: 'A new puzzle is waiting tomorrow.',
  done: 'Done',
  newPuzzle: 'New puzzle',
  sumGoal: 'Sum 10',
};

const pt: ModeStrings = {
  allGames: 'Todos os jogos',
  modes: {
    classic: { name: 'Clássico', desc: 'Combine duas peças iguais livres.', rules: [] },
    timed: {
      name: 'Contra o Tempo',
      desc: 'Limpe o tabuleiro antes do tempo acabar.',
      rules: [
        'Regras clássicas: combine duas peças iguais livres.',
        'Remova todas as peças antes do tempo acabar.',
        'Cada par soma 3 segundos.',
      ],
    },
    daily: {
      name: 'Desafio do Dia',
      desc: 'Um novo desafio todo dia.',
      rules: ['Regras clássicas: combine duas peças iguais livres.', 'O desafio muda todos os dias.'],
    },
    sum10: {
      name: 'Soma 10',
      desc: 'Combine duas peças que somam 10.',
      rules: [
        'Só há peças com números (1-9).',
        'Escolha duas peças livres que somam 10: 1+9, 2+8, 3+7, 4+6, 5+5.',
        'A cor não importa, só o número.',
      ],
    },
    triple: {
      name: 'Coleta Tripla',
      desc: 'Junte 3 iguais na bandeja.',
      rules: [
        'Toque em uma peça sem nada por cima; ela desce para a bandeja.',
        'Três peças iguais na bandeja somem juntas.',
        'A bandeja tem 7 espaços; se encher, você perde.',
        'Desfazer devolve a última peça ao tabuleiro.',
      ],
    },
    connect: {
      name: 'Conexão',
      desc: 'Ligue duas peças iguais com uma linha.',
      rules: [
        'Toque em duas peças com o mesmo desenho.',
        'Elas saem se uma linha com no máximo duas curvas puder ligá-las.',
        'A linha pode passar por espaços vazios e por fora do tabuleiro.',
        'Se não houver jogadas, as peças se misturam sozinhas.',
      ],
    },
    memory: {
      name: 'Memória',
      desc: 'Vire as peças e encontre os pares.',
      rules: [
        'As peças começam viradas. Toque em duas para virá-las.',
        'Peças iguais somem; as outras viram de volta.',
        'Quanto menos jogadas, mais estrelas.',
      ],
    },
    peaks: {
      name: 'Picos',
      desc: 'Escolha uma peça um acima ou abaixo.',
      rules: [
        'A peça grande embaixo é a sua peça atual.',
        'Toque em uma peça aberta um número acima ou abaixo. O 9 e o 1 também se ligam.',
        'Se não houver jogada, compre uma peça do monte.',
        'Limpe todas as peças dos picos. Quanto mais peças sobrarem no monte, mais estrelas.',
      ],
    },
  },
  timeLeft: (t) => `Tempo ${t}`,
  timeUpTitle: 'O tempo acabou!',
  timeUpBody: 'Foi por pouco. Tente de novo!',
  tryAgain: 'Tentar de novo',
  trayFullTitle: 'Bandeja cheia!',
  trayFullBody: '7 peças se acumularam na bandeja. Tente de novo.',
  deckEmptyTitle: 'O monte acabou!',
  deckEmptyBody: 'Não há mais peças para jogar. Tente de novo.',
  autoShuffled: 'Sem jogadas, as peças foram misturadas.',
  moves: (n) => `${n} jogadas`,
  deck: (n) => `Monte: ${n}`,
  draw: 'Comprar',
  dailyDone: 'O desafio de hoje está concluído!',
  dailyTomorrow: 'Um novo desafio espera por você amanhã.',
  done: 'Concluído',
  newPuzzle: 'Novo desafio',
  sumGoal: 'Soma 10',
};

const de: ModeStrings = {
  allGames: 'Alle Spiele',
  modes: {
    classic: { name: 'Klassisch', desc: 'Finde zwei gleiche freie Steine.', rules: [] },
    timed: {
      name: 'Gegen die Zeit',
      desc: 'Räume ab, bevor die Zeit abläuft.',
      rules: [
        'Klassische Regeln: Finde zwei gleiche freie Steine.',
        'Entferne alle Steine, bevor die Zeit abläuft.',
        'Jedes Paar bringt 3 Sekunden dazu.',
      ],
    },
    daily: {
      name: 'Tagesrätsel',
      desc: 'Jeden Tag ein neues Rätsel.',
      rules: ['Klassische Regeln: Finde zwei gleiche freie Steine.', 'Das Rätsel wechselt jeden Tag.'],
    },
    sum10: {
      name: 'Summe 10',
      desc: 'Zwei Steine mit der Summe 10.',
      rules: [
        'Es gibt nur Zahlensteine (1-9).',
        'Wähle zwei freie Steine mit der Summe 10: 1+9, 2+8, 3+7, 4+6, 5+5.',
        'Die Farbe ist egal, nur die Zahl zählt.',
      ],
    },
    triple: {
      name: 'Dreier sammeln',
      desc: 'Sammle 3 gleiche in der Leiste.',
      rules: [
        'Tippe einen Stein an, auf dem nichts liegt; er wandert in die Leiste.',
        'Drei gleiche Steine in der Leiste verschwinden zusammen.',
        'Die Leiste hat 7 Plätze; ist sie voll, hast du verloren.',
        'Zurück legt den letzten Stein wieder aufs Spielfeld.',
      ],
    },
    connect: {
      name: 'Verbinden',
      desc: 'Verbinde zwei gleiche Steine.',
      rules: [
        'Tippe zwei Steine mit demselben Bild an.',
        'Sie verschwinden, wenn eine Linie mit höchstens zwei Knicken sie verbindet.',
        'Die Linie darf über leere Felder und außen um das Spielfeld laufen.',
        'Gibt es keinen Zug mehr, werden die Steine von selbst gemischt.',
      ],
    },
    memory: {
      name: 'Gedächtnis',
      desc: 'Decke Steine auf und finde Paare.',
      rules: [
        'Die Steine liegen verdeckt. Tippe zwei an, um sie umzudrehen.',
        'Gleiche Steine verschwinden, andere drehen sich zurück.',
        'Je weniger Züge, desto mehr Sterne.',
      ],
    },
    peaks: {
      name: 'Gipfel',
      desc: 'Wähle einen Stein eins höher oder tiefer.',
      rules: [
        'Der große Stein unten ist dein aktueller Stein.',
        'Tippe einen offenen Stein an, der eins höher oder tiefer ist. Auch 9 und 1 passen.',
        'Gibt es keinen Zug, ziehe einen neuen Stein vom Stapel.',
        'Räume alle Gipfelsteine ab. Je mehr Steine im Stapel übrig bleiben, desto mehr Sterne.',
      ],
    },
  },
  timeLeft: (t) => `Zeit ${t}`,
  timeUpTitle: 'Zeit abgelaufen!',
  timeUpBody: 'Das war knapp. Versuch es noch einmal!',
  tryAgain: 'Nochmal',
  trayFullTitle: 'Leiste voll!',
  trayFullBody: '7 Steine liegen in der Leiste. Versuch es noch einmal.',
  deckEmptyTitle: 'Stapel leer!',
  deckEmptyBody: 'Es gibt keinen spielbaren Stein mehr. Versuch es noch einmal.',
  autoShuffled: 'Keine Züge mehr, die Steine wurden gemischt.',
  moves: (n) => `${n} Züge`,
  deck: (n) => `Stapel: ${n}`,
  draw: 'Ziehen',
  dailyDone: 'Das heutige Rätsel ist gelöst!',
  dailyTomorrow: 'Morgen wartet ein neues Rätsel.',
  done: 'Gelöst',
  newPuzzle: 'Neues Rätsel',
  sumGoal: 'Summe 10',
};

const fr: ModeStrings = {
  allGames: 'Tous les jeux',
  modes: {
    classic: { name: 'Classique', desc: 'Associez deux tuiles libres identiques.', rules: [] },
    timed: {
      name: 'Contre la montre',
      desc: 'Videz le plateau avant la fin du temps.',
      rules: [
        'Règles classiques : associez deux tuiles libres identiques.',
        'Retirez toutes les tuiles avant la fin du temps.',
        'Chaque paire ajoute 3 secondes.',
      ],
    },
    daily: {
      name: 'Défi du jour',
      desc: 'Un nouveau défi chaque jour.',
      rules: ['Règles classiques : associez deux tuiles libres identiques.', 'Le défi change chaque jour.'],
    },
    sum10: {
      name: 'Somme 10',
      desc: 'Deux tuiles dont la somme fait 10.',
      rules: [
        'Seules les tuiles numérotées (1 à 9) sont utilisées.',
        'Choisissez deux tuiles libres dont la somme fait 10 : 1+9, 2+8, 3+7, 4+6, 5+5.',
        'La couleur ne compte pas, seulement le nombre.',
      ],
    },
    triple: {
      name: 'Triple collecte',
      desc: 'Réunissez 3 tuiles identiques.',
      rules: [
        'Touchez une tuile sans rien dessus ; elle descend dans la réglette.',
        'Trois tuiles identiques dans la réglette disparaissent ensemble.',
        'La réglette a 7 places ; si elle est pleine, vous perdez.',
        'Annuler remet la dernière tuile sur le plateau.',
      ],
    },
    connect: {
      name: 'Connexion',
      desc: 'Reliez deux tuiles identiques.',
      rules: [
        'Touchez deux tuiles identiques.',
        'Elles disparaissent si une ligne avec au plus deux virages peut les relier.',
        'La ligne peut passer par les cases vides et autour du plateau.',
        'S’il n’y a plus de coup possible, les tuiles se mélangent toutes seules.',
      ],
    },
    memory: {
      name: 'Mémoire',
      desc: 'Retournez les tuiles, trouvez les paires.',
      rules: [
        'Les tuiles sont face cachée. Touchez-en deux pour les retourner.',
        'Les tuiles identiques disparaissent, les autres se retournent.',
        'Moins vous jouez de coups, plus vous gagnez d’étoiles.',
      ],
    },
    peaks: {
      name: 'Sommets',
      desc: 'Choisissez une tuile juste au-dessus ou en dessous.',
      rules: [
        'La grande tuile en bas est votre tuile actuelle.',
        'Touchez une tuile ouverte d’une valeur juste au-dessus ou en dessous. Le 9 et le 1 se suivent aussi.',
        'Sans coup possible, piochez une nouvelle tuile.',
        'Videz tous les sommets. Plus il reste de tuiles dans la pioche, plus vous gagnez d’étoiles.',
      ],
    },
  },
  timeLeft: (t) => `Temps ${t}`,
  timeUpTitle: 'Temps écoulé !',
  timeUpBody: 'C’était presque ! Réessayez.',
  tryAgain: 'Réessayer',
  trayFullTitle: 'Réglette pleine !',
  trayFullBody: '7 tuiles se sont accumulées. Réessayez.',
  deckEmptyTitle: 'Pioche vide !',
  deckEmptyBody: 'Plus aucune tuile jouable. Réessayez.',
  autoShuffled: 'Plus de coups, les tuiles ont été mélangées.',
  moves: (n) => `${n} coups`,
  deck: (n) => `Pioche : ${n}`,
  draw: 'Piocher',
  dailyDone: 'Le défi du jour est réussi !',
  dailyTomorrow: 'Un nouveau défi vous attend demain.',
  done: 'Réussi',
  newPuzzle: 'Nouveau défi',
  sumGoal: 'Somme 10',
};

const ja: ModeStrings = {
  allGames: 'すべてのゲーム',
  modes: {
    classic: { name: 'クラシック', desc: '同じ自由な牌を2つそろえる。', rules: [] },
    timed: {
      name: 'タイムアタック',
      desc: '時間内に盤面をクリア。',
      rules: ['ルールはクラシックと同じです。同じ自由な牌を2つそろえます。', '時間切れになる前にすべての牌を消しましょう。', 'ペアを1つ消すごとに3秒増えます。'],
    },
    daily: {
      name: '今日のパズル',
      desc: '毎日新しいパズル。',
      rules: ['ルールはクラシックと同じです。', 'パズルは毎日変わります。'],
    },
    sum10: {
      name: '合計10',
      desc: '合計が10になる2枚をそろえる。',
      rules: ['数字の牌（1〜9）だけを使います。', '合計が10になる自由な牌を2つ選びます：1+9、2+8、3+7、4+6、5+5。', '色は関係なく、数字だけを見ます。'],
    },
    triple: {
      name: '3つそろえ',
      desc: 'トレイに同じ牌を3つ集める。',
      rules: [
        '上に何もない牌をタップすると、下のトレイに移ります。',
        'トレイに同じ牌が3つそろうと消えます。',
        'トレイは7マス。いっぱいになると負けです。',
        '「戻す」で最後の牌を盤面に戻せます。',
      ],
    },
    connect: {
      name: 'つなげて',
      desc: '同じ牌を線でつなぐ。',
      rules: [
        '同じ絵柄の牌を2つタップします。',
        '曲がり角が2回以内の線でつなげれば消えます。',
        '線は空いたマスや盤面の外側を通れます。',
        '動かせる牌がなくなると自動でシャッフルされます。',
      ],
    },
    memory: {
      name: '神経衰弱',
      desc: '牌をめくってペアを探す。',
      rules: ['牌は裏向きです。2つタップしてめくります。', '同じ牌なら消え、違えば裏に戻ります。', '少ない手数でクリアするほど星が増えます。'],
    },
    peaks: {
      name: 'ピークス',
      desc: '1つ上か下の牌を選ぶ。',
      rules: [
        '下の大きな牌が今の手札です。',
        '手札より1つ大きいか小さい、表向きの牌をタップします。9と1もつながります。',
        '出せる牌がなければ、山札から1枚引きます。',
        '山の牌をすべて消しましょう。山札が多く残るほど星が増えます。',
      ],
    },
  },
  timeLeft: (t) => `残り ${t}`,
  timeUpTitle: '時間切れ！',
  timeUpBody: 'あと少しでした。もう一度挑戦しましょう！',
  tryAgain: 'もう一度',
  trayFullTitle: 'トレイがいっぱい！',
  trayFullBody: 'トレイに牌が7つたまりました。もう一度挑戦しましょう。',
  deckEmptyTitle: '山札がなくなりました',
  deckEmptyBody: '出せる牌がありません。もう一度挑戦しましょう。',
  autoShuffled: '動かせる牌がないので、シャッフルしました。',
  moves: (n) => `${n} 手`,
  deck: (n) => `山札 ${n}`,
  draw: '引く',
  dailyDone: '今日のパズルをクリアしました！',
  dailyTomorrow: '明日は新しいパズルが待っています。',
  done: 'クリア済み',
  newPuzzle: '新しいパズル',
  sumGoal: '合計10',
};

const ko: ModeStrings = {
  allGames: '모든 게임',
  modes: {
    classic: { name: '클래식', desc: '같은 자유 타일 두 개를 맞추세요.', rules: [] },
    timed: {
      name: '타임 어택',
      desc: '시간 안에 판을 비우세요.',
      rules: ['클래식 규칙: 같은 자유 타일 두 개를 맞추세요.', '시간이 다 되기 전에 모든 타일을 없애세요.', '짝을 맞출 때마다 3초가 늘어나요.'],
    },
    daily: {
      name: '오늘의 퍼즐',
      desc: '매일 새로운 퍼즐.',
      rules: ['클래식 규칙으로 진행돼요.', '퍼즐은 매일 바뀌어요.'],
    },
    sum10: {
      name: '합계 10',
      desc: '합이 10인 두 타일을 맞추세요.',
      rules: ['숫자 타일(1~9)만 나와요.', '합이 10인 자유 타일 두 개를 고르세요: 1+9, 2+8, 3+7, 4+6, 5+5.', '색은 상관없고 숫자만 보면 돼요.'],
    },
    triple: {
      name: '세 개 모으기',
      desc: '같은 타일 3개를 트레이에 모으세요.',
      rules: [
        '위에 아무것도 없는 타일을 누르면 아래 트레이로 내려가요.',
        '트레이에 같은 타일이 3개 모이면 함께 사라져요.',
        '트레이는 7칸이에요. 가득 차면 져요.',
        '되돌리기는 마지막 타일을 판으로 돌려놓아요.',
      ],
    },
    connect: {
      name: '연결',
      desc: '같은 타일을 선으로 이으세요.',
      rules: [
        '같은 그림의 타일 두 개를 누르세요.',
        '두 번 이하로 꺾이는 선으로 이을 수 있으면 사라져요.',
        '선은 빈칸과 판 바깥으로 지나갈 수 있어요.',
        '움직일 수 있는 타일이 없으면 자동으로 섞여요.',
      ],
    },
    memory: {
      name: '기억력',
      desc: '타일을 뒤집어 짝을 찾으세요.',
      rules: ['타일은 뒤집혀 있어요. 두 개를 눌러 뒤집으세요.', '같으면 사라지고, 다르면 다시 뒤집혀요.', '적은 횟수로 끝낼수록 별을 더 받아요.'],
    },
    peaks: {
      name: '봉우리',
      desc: '하나 크거나 작은 타일을 고르세요.',
      rules: [
        '아래쪽 큰 타일이 지금 내 타일이에요.',
        '내 타일보다 하나 크거나 작은 열린 타일을 누르세요. 9와 1도 이어져요.',
        '낼 타일이 없으면 더미에서 새 타일을 뽑으세요.',
        '봉우리의 타일을 모두 없애세요. 더미에 타일이 많이 남을수록 별을 더 받아요.',
      ],
    },
  },
  timeLeft: (t) => `남은 시간 ${t}`,
  timeUpTitle: '시간 종료!',
  timeUpBody: '거의 다 했어요. 다시 도전해 보세요!',
  tryAgain: '다시 하기',
  trayFullTitle: '트레이가 가득 찼어요!',
  trayFullBody: '트레이에 타일 7개가 쌓였어요. 다시 도전해 보세요.',
  deckEmptyTitle: '더미가 비었어요!',
  deckEmptyBody: '낼 수 있는 타일이 없어요. 다시 도전해 보세요.',
  autoShuffled: '움직일 수 있는 타일이 없어서 섞었어요.',
  moves: (n) => `${n}번`,
  deck: (n) => `더미 ${n}`,
  draw: '뽑기',
  dailyDone: '오늘의 퍼즐 완료!',
  dailyTomorrow: '내일 새로운 퍼즐이 기다려요.',
  done: '완료',
  newPuzzle: '새 퍼즐',
  sumGoal: '합계 10',
};

const ALL: Record<Lang, ModeStrings> = { tr, en, pt, de, fr, ja, ko };

/** Seçili dildeki mod metinleri */
export function mt(): ModeStrings {
  return ALL[currentLanguage()];
}
