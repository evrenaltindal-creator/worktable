"""metinler.json'daki App Store metinlerinin karakter sınırlarını denetler ve METINLER.md'yi üretir.
Kullanım: python3 kontrol.py"""
import json, sys, pathlib
HERE = pathlib.Path(__file__).parent
LIMITS = {'name': 30, 'subtitle': 30, 'promo': 170, 'keywords': 100, 'description': 4000, 'whatsNew': 4000}
LABELS = {'name': 'Ad', 'subtitle': 'Alt başlık', 'promo': 'Tanıtım metni', 'keywords': 'Anahtar kelimeler', 'description': 'Açıklama', 'whatsNew': 'Bu sürümdeki yenilikler'}
data = json.loads((HERE / 'metinler.json').read_text(encoding='utf-8'))
errors, md = [], ['# App Store metinleri', '', '`metinler.json` dosyasından üretildi. Değiştirmek için JSON dosyasını düzenleyip `python3 kontrol.py` çalıştırın.', '']
for code, loc in data.items():
    if code.startswith('_'): continue
    md += [f'## {loc["locale"]}', '']
    for key, limit in LIMITS.items():
        text = loc[key]
        n = len(text)
        if n > limit: errors.append(f'{code}.{key}: {n}/{limit}')
        if key == 'keywords' and ', ' in text: errors.append(f'{code}.keywords: virgülden sonra boşluk olmamalı')
        md += [f'**{LABELS[key]}** ({n}/{limit})', '', '```', text, '```', '']
(HERE / 'METINLER.md').write_text('\n'.join(md), encoding='utf-8')
for code, loc in data.items():
    if code.startswith('_'): continue
    print(f'{code}: ' + ' · '.join(f'{k} {len(loc[k])}/{v}' for k, v in LIMITS.items() if k != 'whatsNew'))
if errors: print('SINIR AŞILDI:', errors); sys.exit(1)
print('Tüm metinler sınırların içinde. METINLER.md yazıldı.')
