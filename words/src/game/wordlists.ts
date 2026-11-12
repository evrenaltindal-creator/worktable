/**
 * Kelime Avı kelime listeleri: 7 dil x 6 tema. Kelimeler büyük harfle, tahtaya sığacak uzunlukta (3-8 harf).
 * Fransızca ve Portekizcede bulmaca geleneğine uygun olarak aksanlar kaldırılır (motor yapar);
 * Türkçe ve Almanca harfler (Ç Ğ İ Ö Ş Ü / Ä Ö Ü) olduğu gibi kalır.
 * Japonca kelimeler hiragana, Korece kelimeler hece hece yazılır (her hücreye bir hece).
 */
import type { Lang } from '../kit/i18n';

export const THEMES = 6;

export const THEME_NAMES: Record<Lang, string[]> = {
  tr: ['Meyveler', 'Hayvanlar', 'Ev', 'Doğa', 'Mutfak', 'Renkler ve Hava'],
  en: ['Fruits', 'Animals', 'Home', 'Nature', 'Kitchen', 'Colours and Weather'],
  pt: ['Frutas', 'Animais', 'Casa', 'Natureza', 'Cozinha', 'Cores e Tempo'],
  de: ['Obst', 'Tiere', 'Zuhause', 'Natur', 'Küche', 'Farben und Wetter'],
  fr: ['Fruits', 'Animaux', 'Maison', 'Nature', 'Cuisine', 'Couleurs et Météo'],
  ja: ['くだもの', 'どうぶつ', 'いえ', 'しぜん', 'だいどころ', 'いろとてんき'],
  ko: ['과일', '동물', '집', '자연', '부엌', '색깔과 날씨'],
};

export const WORDS: Record<Lang, string[][]> = {
  tr: [
    ['ELMA', 'ARMUT', 'KİRAZ', 'ÜZÜM', 'İNCİR', 'MUZ', 'ÇİLEK', 'KAYISI', 'ŞEFTALİ', 'KARPUZ', 'KAVUN', 'NAR', 'ERİK', 'LİMON', 'AYVA', 'PORTAKAL'],
    ['KEDİ', 'KÖPEK', 'KUŞ', 'BALIK', 'AT', 'İNEK', 'KOYUN', 'KEÇİ', 'TAVŞAN', 'ASLAN', 'AYI', 'TİLKİ', 'KURT', 'ÖRDEK', 'TAVUK', 'ARI'],
    ['KAPI', 'PENCERE', 'MASA', 'SANDALYE', 'YATAK', 'HALI', 'LAMBA', 'DOLAP', 'AYNA', 'SAAT', 'PERDE', 'KOLTUK', 'MUTFAK', 'BALKON', 'BAHÇE', 'DUVAR'],
    ['AĞAÇ', 'ÇİÇEK', 'DENİZ', 'DAĞ', 'GÖL', 'NEHİR', 'ORMAN', 'TOPRAK', 'TAŞ', 'KUM', 'BULUT', 'GÜNEŞ', 'YILDIZ', 'AY', 'YAPRAK', 'ÇİMEN'],
    ['TABAK', 'BARDAK', 'KAŞIK', 'ÇATAL', 'BIÇAK', 'TENCERE', 'TAVA', 'FIRIN', 'ÇAYDANLIK', 'FİNCAN', 'EKMEK', 'PEYNİR', 'ZEYTİN', 'BAL', 'ŞEKER', 'TUZ'],
    ['KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI', 'BEYAZ', 'SİYAH', 'MOR', 'PEMBE', 'TURUNCU', 'YAĞMUR', 'KAR', 'RÜZGAR', 'SİS', 'GÖKKUŞAĞI', 'SICAK', 'SOĞUK'],
  ],
  en: [
    ['APPLE', 'PEAR', 'CHERRY', 'GRAPE', 'FIG', 'BANANA', 'LEMON', 'PEACH', 'MELON', 'PLUM', 'ORANGE', 'MANGO', 'KIWI', 'LIME', 'APRICOT', 'BERRY'],
    ['CAT', 'DOG', 'BIRD', 'FISH', 'HORSE', 'COW', 'SHEEP', 'GOAT', 'RABBIT', 'LION', 'BEAR', 'FOX', 'WOLF', 'DUCK', 'CHICKEN', 'BEE'],
    ['DOOR', 'WINDOW', 'TABLE', 'CHAIR', 'BED', 'CARPET', 'LAMP', 'SHELF', 'MIRROR', 'CLOCK', 'CURTAIN', 'SOFA', 'KITCHEN', 'GARDEN', 'WALL', 'ROOF'],
    ['TREE', 'FLOWER', 'SEA', 'MOUNTAIN', 'LAKE', 'RIVER', 'FOREST', 'STONE', 'SAND', 'CLOUD', 'SUN', 'STAR', 'MOON', 'LEAF', 'GRASS', 'HILL'],
    ['PLATE', 'GLASS', 'SPOON', 'FORK', 'KNIFE', 'POT', 'PAN', 'OVEN', 'KETTLE', 'CUP', 'BREAD', 'CHEESE', 'OLIVE', 'HONEY', 'SUGAR', 'SALT'],
    ['RED', 'BLUE', 'GREEN', 'YELLOW', 'WHITE', 'BLACK', 'PURPLE', 'PINK', 'RAIN', 'SNOW', 'WIND', 'FOG', 'RAINBOW', 'STORM', 'WARM', 'COLD'],
  ],
  pt: [
    ['MAÇÃ', 'PERA', 'CEREJA', 'UVA', 'FIGO', 'BANANA', 'LIMÃO', 'PÊSSEGO', 'MELÃO', 'AMEIXA', 'LARANJA', 'MANGA', 'KIWI', 'ROMÃ', 'MORANGO', 'ABACAXI'],
    ['GATO', 'CÃO', 'PÁSSARO', 'PEIXE', 'CAVALO', 'VACA', 'OVELHA', 'CABRA', 'COELHO', 'LEÃO', 'URSO', 'RAPOSA', 'LOBO', 'PATO', 'GALINHA', 'ABELHA'],
    ['PORTA', 'JANELA', 'MESA', 'CADEIRA', 'CAMA', 'TAPETE', 'LÂMPADA', 'ARMÁRIO', 'ESPELHO', 'RELÓGIO', 'CORTINA', 'SOFÁ', 'COZINHA', 'JARDIM', 'PAREDE', 'TELHADO'],
    ['ÁRVORE', 'FLOR', 'MAR', 'MONTANHA', 'LAGO', 'RIO', 'FLORESTA', 'PEDRA', 'AREIA', 'NUVEM', 'SOL', 'ESTRELA', 'LUA', 'FOLHA', 'GRAMA', 'PRAIA'],
    ['PRATO', 'COPO', 'COLHER', 'GARFO', 'FACA', 'PANELA', 'FORNO', 'CHALEIRA', 'XÍCARA', 'PÃO', 'QUEIJO', 'AZEITONA', 'MEL', 'AÇÚCAR', 'SAL', 'LEITE'],
    ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO', 'BRANCO', 'PRETO', 'ROXO', 'ROSA', 'CHUVA', 'NEVE', 'VENTO', 'NÉVOA', 'CALOR', 'FRIO', 'TROVÃO', 'ORVALHO'],
  ],
  de: [
    ['APFEL', 'BIRNE', 'KIRSCHE', 'TRAUBE', 'FEIGE', 'BANANE', 'ZITRONE', 'PFIRSICH', 'MELONE', 'PFLAUME', 'ORANGE', 'MANGO', 'KIWI', 'BEERE', 'QUITTE', 'ANANAS'],
    ['KATZE', 'HUND', 'VOGEL', 'FISCH', 'PFERD', 'KUH', 'SCHAF', 'ZIEGE', 'HASE', 'LÖWE', 'BÄR', 'FUCHS', 'WOLF', 'ENTE', 'HUHN', 'BIENE'],
    ['TÜR', 'FENSTER', 'TISCH', 'STUHL', 'BETT', 'TEPPICH', 'LAMPE', 'SCHRANK', 'SPIEGEL', 'UHR', 'VORHANG', 'SOFA', 'KÜCHE', 'GARTEN', 'WAND', 'DACH'],
    ['BAUM', 'BLUME', 'MEER', 'BERG', 'SEE', 'FLUSS', 'WALD', 'STEIN', 'SAND', 'WOLKE', 'SONNE', 'STERN', 'MOND', 'BLATT', 'GRAS', 'HÜGEL'],
    ['TELLER', 'GLAS', 'LÖFFEL', 'GABEL', 'MESSER', 'TOPF', 'PFANNE', 'OFEN', 'KANNE', 'TASSE', 'BROT', 'KÄSE', 'OLIVE', 'HONIG', 'ZUCKER', 'SALZ'],
    ['ROT', 'BLAU', 'GRÜN', 'GELB', 'WEISS', 'SCHWARZ', 'LILA', 'ROSA', 'REGEN', 'SCHNEE', 'WIND', 'NEBEL', 'GEWITTER', 'WARM', 'KALT', 'FROST'],
  ],
  fr: [
    ['POMME', 'POIRE', 'CERISE', 'RAISIN', 'FIGUE', 'BANANE', 'CITRON', 'PÊCHE', 'MELON', 'PRUNE', 'ORANGE', 'MANGUE', 'KIWI', 'FRAISE', 'ABRICOT', 'ANANAS'],
    ['CHAT', 'CHIEN', 'OISEAU', 'POISSON', 'CHEVAL', 'VACHE', 'MOUTON', 'CHÈVRE', 'LAPIN', 'LION', 'OURS', 'RENARD', 'LOUP', 'CANARD', 'POULE', 'ABEILLE'],
    ['PORTE', 'FENÊTRE', 'TABLE', 'CHAISE', 'LIT', 'TAPIS', 'LAMPE', 'ARMOIRE', 'MIROIR', 'HORLOGE', 'RIDEAU', 'CANAPÉ', 'CUISINE', 'JARDIN', 'MUR', 'TOIT'],
    ['ARBRE', 'FLEUR', 'MER', 'MONTAGNE', 'LAC', 'RIVIÈRE', 'FORÊT', 'PIERRE', 'SABLE', 'NUAGE', 'SOLEIL', 'ÉTOILE', 'LUNE', 'FEUILLE', 'HERBE', 'COLLINE'],
    ['ASSIETTE', 'VERRE', 'CUILLÈRE', 'FOURCHE', 'COUTEAU', 'MARMITE', 'POÊLE', 'FOUR', 'BOUILLOIRE', 'TASSE', 'PAIN', 'FROMAGE', 'OLIVE', 'MIEL', 'SUCRE', 'SEL'],
    ['ROUGE', 'BLEU', 'VERT', 'JAUNE', 'BLANC', 'NOIR', 'VIOLET', 'ROSE', 'PLUIE', 'NEIGE', 'VENT', 'BROUILLARD', 'ORAGE', 'CHAUD', 'FROID', 'NUAGE'],
  ],
  ja: [
    ['りんご', 'なし', 'さくらんぼ', 'ぶどう', 'いちじく', 'ばなな', 'れもん', 'もも', 'めろん', 'すいか', 'みかん', 'いちご', 'かき', 'うめ', 'くり', 'ゆず'],
    ['ねこ', 'いぬ', 'とり', 'さかな', 'うま', 'うし', 'ひつじ', 'やぎ', 'うさぎ', 'らいおん', 'くま', 'きつね', 'おおかみ', 'あひる', 'にわとり', 'はち'],
    ['とびら', 'まど', 'つくえ', 'いす', 'べっど', 'たたみ', 'らんぷ', 'たな', 'かがみ', 'とけい', 'かーてん', 'そふぁ', 'にわ', 'かべ', 'やね', 'げんかん'],
    ['き', 'はな', 'うみ', 'やま', 'みずうみ', 'かわ', 'もり', 'いし', 'すな', 'くも', 'たいよう', 'ほし', 'つき', 'はっぱ', 'くさ', 'おか'],
    ['さら', 'こっぷ', 'すぷーん', 'ふぉーく', 'ないふ', 'なべ', 'ふらいぱん', 'おーぶん', 'やかん', 'ちゃわん', 'ぱん', 'ちーず', 'おりーぶ', 'はちみつ', 'さとう', 'しお'],
    ['あか', 'あお', 'みどり', 'きいろ', 'しろ', 'くろ', 'むらさき', 'ぴんく', 'あめ', 'ゆき', 'かぜ', 'きり', 'にじ', 'あらし', 'あつい', 'さむい'],
  ],
  ko: [
    ['사과', '배', '체리', '포도', '무화과', '바나나', '레몬', '복숭아', '멜론', '자두', '오렌지', '망고', '키위', '딸기', '수박', '감'],
    ['고양이', '강아지', '새', '물고기', '말', '소', '양', '염소', '토끼', '사자', '곰', '여우', '늑대', '오리', '닭', '벌'],
    ['문', '창문', '책상', '의자', '침대', '카펫', '램프', '선반', '거울', '시계', '커튼', '소파', '부엌', '정원', '벽', '지붕'],
    ['나무', '꽃', '바다', '산', '호수', '강', '숲', '바위', '모래', '구름', '태양', '하늘', '폭포', '나뭇잎', '들판', '언덕'],
    ['접시', '컵', '숟가락', '포크', '칼', '냄비', '프라이팬', '오븐', '주전자', '찻잔', '빵', '치즈', '올리브', '꿀', '설탕', '소금'],
    ['빨강', '파랑', '초록', '노랑', '하양', '검정', '보라', '분홍', '비', '눈', '바람', '안개', '무지개', '폭풍', '따뜻함', '추위'],
  ],
};

/** Boş hücreleri dolduracak harfler (sık kullanılanlar daha sık) */
export const FILLERS: Record<Lang, string> = {
  tr: 'AAAEEEİİKKLLMMNNRRSSTTYYBCÇDGĞHIOÖPŞUÜVZ',
  en: 'AAAEEEIIOONNRRSSTTLLDDCCHMPUBGFWYKV',
  pt: 'AAAEEEOOIIRRSSNNTTMMCCLLDDUUPPVGBFHQ',
  de: 'EEEENNNIIRRSSTTAAHHDDUULLCGMOBWFKZÄÖÜ',
  fr: 'EEEEAAASSIINNTTRRUULLOODDCCMMPPVGBFH',
  ja: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわん',
  ko: '가나다라마바사아자차카타파하고노도로모보소오조호구누두루무부수우주후기니디리미비시이지히',
};
