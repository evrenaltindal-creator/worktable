"""Her oyun için EAS Metadata dosyası (store.config.json) üretir.

App Store Connect'teki 7 dilli metinler (ad, alt başlık, tanıtım, açıklama, anahtar kelimeler),
kategoriler, yaş derecelendirmesi (4+) ve telif bu dosyadan tek komutla yüklenir:
    cd <oyun klasörü>
    npx eas-cli@latest metadata:push

Kullanım: python3 shared/store_config.py            (tüm oyunlar)
          python3 shared/store_config.py jewels     (tek oyun)
Kaynak: <oyun>/store/listing.json; yoksa (sudoku, mahjong) <oyun>/store/app-store-listing.md.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = ['mahjong', 'sudoku', 'mines', 'bubbles', 'jewels', 'blocks', 'colorpop', 'jigsaw', 'words', 'cube']
COPYRIGHT = '2026 EVREN ALTINDAL'  # Apple geliştirici hesabındaki ad; isterseniz değiştirin
LOCALES = {'tr': 'tr', 'en': 'en-US', 'pt': 'pt-BR', 'de': 'de-DE', 'fr': 'fr-FR', 'ja': 'ja', 'ko': 'ko'}
CATEGORY = {'Puzzle': 'GAMES_PUZZLE', 'Board': 'GAMES_BOARD', 'Casual': 'GAMES_CASUAL', 'Family': 'GAMES_FAMILY', 'Word': 'GAMES_WORD'}

# Yaş derecelendirmesi: tüm sorular "Yok" (4+). Kumar, web erişimi yok.
ADVISORY = {
    'alcoholTobaccoOrDrugUseOrReferences': 'NONE',
    'contests': 'NONE',
    'gamblingSimulated': 'NONE',
    'horrorOrFearThemes': 'NONE',
    'matureOrSuggestiveThemes': 'NONE',
    'medicalOrTreatmentInformation': 'NONE',
    'profanityOrCrudeHumor': 'NONE',
    'sexualContentGraphicAndNudity': 'NONE',
    'sexualContentOrNudity': 'NONE',
    'violenceCartoonOrFantasy': 'NONE',
    'violenceRealistic': 'NONE',
    'violenceRealisticProlongedGraphicOrSadistic': 'NONE',
    'gambling': False,
    'unrestrictedWebAccess': False,
    'kidsAgeBand': None,
    'ageRatingOverride': 'NONE',
    'koreaAgeRatingOverride': 'NONE',
}


def keywords(s):
    out = []
    for k in s.split(','):
        k = k.strip()
        if k and k not in out:
            out.append(k)
    return out


def from_json(path):
    d = json.load(open(path, encoding='utf-8'))
    cats = [CATEGORY[c.split('→')[-1].strip()] for c in (d['category'], d.get('category2')) if c]
    info = {}
    for lang, loc in LOCALES.items():
        L = d['langs'][lang]
        info[loc] = {'title': L['name'], 'subtitle': L['subtitle'], 'promoText': L['promo'], 'description': L['description'], 'keywords': keywords(L['keywords'])}
    return info, cats


def from_md(path):
    """Eski biçim: '## Dil (kod)' bölümleri; sırayla ad, alt başlık, tanıtım, anahtar kelimeler, açıklama."""
    text = open(path, encoding='utf-8').read()
    info = {}
    for m in re.finditer(r'^## [^\n]*\((tr|en-US|pt-BR|de-DE|fr-FR|ja|ko)\)\n(.*?)(?=^## |\Z)', text, re.S | re.M):
        loc, body = m.group(1), m.group(2)
        body = body.split('\n---')[0]
        parts = re.split(r'^\*\*[^*\n]+:\*\*[ \t]*', body, flags=re.M)[1:]
        parts = [p.strip() for p in parts]
        if len(parts) < 5:
            raise SystemExit(f'{path}: {loc} bölümünde 5 alan bulunamadı')
        info[loc] = {'title': parts[0], 'subtitle': parts[1], 'promoText': parts[2], 'keywords': keywords(parts[3]), 'description': parts[4]}
    if set(info) != set(LOCALES.values()):
        raise SystemExit(f'{path}: eksik dil {set(LOCALES.values()) - set(info)}')
    return info, ['GAMES_PUZZLE', 'GAMES_BOARD']


def check(game, info):
    for loc, f in info.items():
        assert 2 <= len(f['title']) <= 30, (game, loc, 'title', len(f['title']))
        assert len(f['subtitle']) <= 30, (game, loc, 'subtitle', len(f['subtitle']))
        assert len(f['promoText']) <= 170, (game, loc, 'promo', len(f['promoText']))
        assert 10 <= len(f['description']) <= 4000, (game, loc, 'description')
        assert len(','.join(f['keywords'])) <= 100, (game, loc, 'keywords', len(','.join(f['keywords'])))


def build(game):
    base = os.path.join(ROOT, game, 'store')
    src = os.path.join(base, 'listing.json')
    info, cats = from_json(src) if os.path.exists(src) else from_md(os.path.join(base, 'app-store-listing.md'))
    check(game, info)
    config = {
        'configVersion': 0,
        'apple': {
            'copyright': COPYRIGHT,
            'categories': [['GAMES', *cats]],
            'info': info,
            'advisory': ADVISORY,
        },
    }
    out = os.path.join(ROOT, game, 'store.config.json')
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(config, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print(f'{game}: store.config.json ({len(info)} dil, kategori {cats})')


for g in (sys.argv[1:] or GAMES):
    build(g)
