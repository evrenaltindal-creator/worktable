/* Test/ekran görüntüsü yardımcısı: bir seviyenin kelime konumlarını yazar.  npx tsx scripts/puzzle-json.ts <dil> <seviye> */
import type { Lang } from '../src/kit/i18n';
import { makePuzzle } from '../src/game/words';

const p = makePuzzle(process.argv[2] as Lang, Number(process.argv[3] ?? 1));
console.log(JSON.stringify({ size: p.size, words: p.words.map((w) => [w.word, w.cells[0], w.cells[w.cells.length - 1]]) }));
