# Huzur Jewels (Mücevher)

Huzur oyun ailesinden süre baskısı olmayan sakin bir üçlü eşleştirme oyunu. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurjewels`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh jewels`).

- 8x8 tahta; dokun-dokun ya da kaydırarak yer değiştirme, düşme ve zincirleme patlama animasyonları.
- Her rengin kendi biçimi var (yuvarlak, kare, üçgen, eşkenar dörtgen, altıgen, kalp).
- Özel taşlar: 4'lü → ok (satır/sütun), L/T → bomba (3x3), 5'li → gökkuşağı yıldızı (bir renk).
- Seviye hedefi: belirli taşlardan şu kadar topla, hamle sınırı var, süre yok. Hamle kalmazsa otomatik karıştırma.
- Sınırlı İpucu (hedefe en çok yarayan hamle) ve Çekiç (hamle harcamadan tek taş); her yeni galibiyet ikisinden de +1.
- Sınırsız seviye, Günün Oyunu, 1-3 yıldız (kalan hamleye göre), konfeti, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # motor testleri (oyuncu botları 60 seviyede denenir)
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py jewels`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8770'te sunulurken `node scripts/store-screenshots.cjs`).
