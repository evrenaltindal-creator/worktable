#!/usr/bin/env python3
"""
Huzur oyunları için mağaza dosyalarını üretir:  python3 shared/store_tools.py <uygulama-klasörü>

Girdi:  <app>/store/listing.json
Çıktı:  <app>/store/app-store-listing.md   (7 dilde metinler, karakter sınırı kontrolüyle)
        <app>/store/APP-STORE-CONNECT.md   (alan alan doldurma rehberi)
        <app>/docs/index.html, gizlilik.html (destek ve gizlilik sayfaları)
"""
import html
import json
import os
import re
import sys

LIMITS = {"subtitle": 30, "promo": 170, "keywords": 100, "description": 4000, "name": 30}
LANG_TITLES = {
    "tr": "Türkçe (tr)", "en": "English (en-US)", "pt": "Português (Brasil) (pt-BR)",
    "de": "Deutsch (de-DE)", "fr": "Français (fr-FR)", "ja": "日本語 (ja)", "ko": "한국어 (ko)",
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(app):
    d = os.path.join(ROOT, app)
    L = json.load(open(os.path.join(d, "store", "listing.json"), encoding="utf-8"))
    name = L["appName"]
    errors = []
    md = [f"# {name} — App Store metinleri (7 dil)\n",
          "Sınırlar: ad 30, alt başlık 30, anahtar kelimeler 100, tanıtım metni 170, açıklama 4000 karakter.",
          "Başka uygulamaların adlarını yazmayın (Apple kural 2.3.7).\n"]
    for lang, title in LANG_TITLES.items():
        x = L["langs"][lang]
        for k, lim in LIMITS.items():
            v = x.get(k, name if k == "name" else "")
            if len(v) > lim:
                errors.append(f"{lang}.{k}: {len(v)}/{lim}")
        md += ["---\n", f"## {title}\n",
               f"**Ad:** {x.get('name', name)}\n",
               f"**Alt başlık:** {x['subtitle']}\n",
               f"**Tanıtım metni:**\n{x['promo']}\n",
               f"**Anahtar kelimeler:**\n{x['keywords']}\n",
               f"**Açıklama:**\n{x['description'].strip()}\n"]
    md += ["---\n", "## Diğer alanlar\n", "| Alan | Değer |", "| --- | --- |",
           f"| Birincil kategori | {L.get('category', 'Games → Puzzle')} |",
           f"| İkincil kategori | {L.get('category2', 'Games → Board')} |",
           "| Yaş derecelendirmesi | 4+ (anketteki tüm sorulara \"Yok\") |",
           "| App Privacy | Data Not Collected (Veri toplanmıyor) |",
           "| Telif hakkı | 2026 Adınız Soyadınız |", ""]
    open(os.path.join(d, "store", "app-store-listing.md"), "w", encoding="utf-8").write("\n".join(md))

    tr = L["langs"]["tr"]
    age = open(os.path.join(ROOT, "mahjong", "store", "APP-STORE-CONNECT.md"), encoding="utf-8").read()
    age = age[age.index("## 9. Yaş derecelendirmesi"):age.index("## 10.")]
    shots = ", ".join(L["screenshots"])
    guide = f"""# {name} — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`{app}`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `{L['bundleId']}`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `{app}/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `{app}/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `{app}/store/screenshots/tr/ipad-13/` |

Sıra: {shots}. Diğer diller: `{app}/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
{tr['promo']}
```

## 3. Açıklama

```
{tr['description'].strip()}
```

## 4. Anahtar kelimeler

```
{tr['keywords']}
```

## 5. Alt başlık (Uygulama Bilgileri)

```
{tr['subtitle']}
```

Diğer 6 dilin metinleri: `{app}/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `{app}/docs/index.html` (destek) ve `{app}/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `{app}/docs` klasörünü sürükleyin).

- **Destek URL'si:** `https://<isim>.netlify.app/`
- **Gizlilik Politikası URL'si:** `https://<isim>.netlify.app/gizlilik.html`

## 7. Telif hakkı

```
2026 Adınız Soyadınız
```

## 8. Uygulama İnceleme Bilgileri

Ad, soyad, telefon ve e-posta. "Oturum açma gerekli": **işaretlemeyin**.

**Notlar:**
```
{L['reviewNotes']}
```

---

{age}---

## 10. Diğerleri

- **Uygulama Gizliliği** → "Veri toplamıyoruz" (Data Not Collected) → Yayınla.
- **Fiyatlandırma** → Ücretsiz. **Kategori** → {L.get('category', 'Games → Puzzle')}.
- Hepsi tamamlanınca **İncelemeye Ekle → İncelemeye Gönder**.
"""
    open(os.path.join(d, "store", "APP-STORE-CONNECT.md"), "w", encoding="utf-8").write(guide)

    # Destek sayfası
    def faq(items):
        return "\n".join(f"    <h3>{html.escape(q)}</h3>\n    <p>{html.escape(a)}</p>" for q, a in items)
    page = f"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(name)} – Destek / Support</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main>
  <h1>{html.escape(name)}</h1>
  <p>{html.escape(tr['subtitle'])} · {html.escape(L['langs']['en']['subtitle'])}</p>
  <nav><a href="#tr">Türkçe</a><a href="#en">English</a><a href="gizlilik.html">Gizlilik / Privacy</a></nav>
  <div class="card">
    <p>Soru, öneri ve sorunlar için / Questions, ideas and problems:</p>
    <p class="mail">E-POSTA-ADRESINIZ</p>
  </div>
  <section id="tr">
    <h2>Destek (Türkçe)</h2>
{faq(L['faq']['tr'])}
  </section>
  <section id="en">
    <h2>Support (English)</h2>
{faq(L['faq']['en'])}
  </section>
  <footer>© 2026 {html.escape(name)}</footer>
</main>
</body>
</html>
"""
    os.makedirs(os.path.join(d, "docs"), exist_ok=True)
    open(os.path.join(d, "docs", "index.html"), "w", encoding="utf-8").write(page)
    priv = open(os.path.join(ROOT, "mahjong", "docs", "gizlilik.html"), encoding="utf-8").read()
    open(os.path.join(d, "docs", "gizlilik.html"), "w", encoding="utf-8").write(priv.replace("Huzur Mahjong", name))
    if not os.path.exists(os.path.join(d, "docs", "style.css")):
        import shutil
        shutil.copy(os.path.join(ROOT, "mahjong", "docs", "style.css"), os.path.join(d, "docs", "style.css"))

    if errors:
        print("SINIR AŞILDI:", ", ".join(errors))
        sys.exit(1)
    print(f"{name}: mağaza metinleri, rehber ve destek sayfaları üretildi (tüm alanlar sınır içinde).")


if __name__ == "__main__":
    main(sys.argv[1])
