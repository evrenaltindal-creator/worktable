# Huzur Color Pop (Renk Patlatma)

Huzur oyun ailesinden süre baskısı olmayan sakin bir renk patlatma bulmacası. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurcolorpop`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh colorpop`).

- 8x10 tahta; aynı renkten en az 2 komşu karoya dokununca grup patlar. Karolar düşer, boş sütunlar ortada birleşir.
- Her rengin kendi sembolü var (kalp, damla, yaprak, güneş, ay).
- Seviye hedefi: en fazla N karo bırakmak. Hedef, yerleşik çözücünün sonucuna göre konur: her seviye kazanılabilir.
- Sınırlı Geri al, İpucu ve Çekiç (her yeni galibiyet birer tane). Sınırsız seviye, Günün Oyunu, 1-3 yıldız, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # motor testleri (ipucu oyuncusu 30 seviyede denenir)
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py colorpop`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8772'de sunulurken `node scripts/store-screenshots.cjs`).
