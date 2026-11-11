# Huzur Bubbles (Balon Patlatma)

Huzur oyun ailesinden sakin bir balon patlatma oyunu. App Store'a **ayrı bir uygulama** olarak yüklenir
(paket kimliği `com.evrenaltindal.huzurbubbles`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh bubbles`).

- Parmağı tahtada gezdirerek nişan alma; noktalı çizgi duvar sekmelerini de gösterir, bırakınca atış.
- Aynı renkten 3+ balon patlar, askıda kalanlar düşer. Her rengin kendi sembolü var (kalp, yıldız, yaprak,
  güneş, elmas, çiçek), renk ayırt etmesi zor olanlar için de kolay.
- Patlatmadan 6 atış sonra tavan iner; balonlar sarı çizgiye ulaşırsa seviye biter.
- "Değiştir" (sıradaki balonla yer değiştir) ve sınırlı **Gökkuşağı** balonu (her renge uyar; her yeni galibiyet +1).
- Sınırsız seviye (satır ve renk sayısı yavaş artar), Günün Oyunu, 1-3 yıldız, konfeti, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # motor testleri (basit oyuncu 1-20. seviyeleri bitirebiliyor mu)
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py bubbles`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8769'da sunulurken `node scripts/store-screenshots.cjs`).
