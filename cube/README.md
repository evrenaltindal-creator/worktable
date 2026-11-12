# Huzur Mahjong Cube (Mahjong Küp)

Huzur oyun ailesinden süre baskısı olmayan sakin bir 3B eşleştirme oyunu. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurcube`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh cube`).

- Küplerden bir kule (izometrik çizim). Aynı sembollü iki açık küp eşleşip kalkar.
- Açık küp: üstünde küp yok ve dört yanından en az biri boş. Kapalı küpler koyu görünür.
- "Döndür" kuleyi çeyrek tur çevirir; arkadaki küpler görünür.
- Seviyeler tersine kurulur: her seviyenin çözümü vardır. Eşleşme kalmazsa semboller çözülebilir biçimde karışır.
- 12 özgün sembol (her biri ayrı renk ve biçim), sınırlı İpucu, Günün Oyunu, 1-3 yıldız, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # serbestlik kuralı, çözülebilirlik ve karıştırma testleri
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py cube`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8775'te sunulurken `node scripts/store-screenshots.cjs`).
