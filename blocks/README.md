# Huzur Blocks (Blok Bulmaca)

Huzur oyun ailesinden süre baskısı olmayan sakin bir blok yerleştirme bulmacası. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurblocks`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh blocks`).

- 9x9 tahta; dolan satır, sütun ve 3x3 kutular temizlenir. Aynı anda ve art arda temizleme daha çok puan verir.
- Parçalar sürüklenerek ya da önce parçaya, sonra tahtaya dokunarak konur. Sürüklerken düşeceği yer ve
  temizlenecek satırlar önceden görünür; parça parmağın üstünde durur.
- Seviyeler (hedef puan, tahtada duran taşlarla yavaşça zorlaşır), Klasik (sonsuz, en iyi puan), Günün Oyunu.
- Adil dağıtım: verilen üç parçadan en az biri her zaman sığar. Sınırlı İpucu ve "Yenile" (her yeni galibiyet +1).
- 1-3 yıldız, konfeti, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # motor testleri (ipucu oyuncusu 40 seviyede denenir)
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py blocks`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8771'de sunulurken `node scripts/store-screenshots.cjs`).
