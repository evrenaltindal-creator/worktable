# Huzur Jigsaw (Yapboz)

Huzur oyun ailesinden süre baskısı olmayan sakin bir yapboz oyunu. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurjigsaw`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh jigsaw`).

- Gerçek çıkıntılı/girintili yapboz parçaları (`react-native-svg` ile kırpma); 12 özgün manzara resmi.
- Parça sürüklenir ya da önce parçaya, sonra yerine dokunulur; doğru yere yakın bırakılan parça oturur.
- Tahtada resmin soluk hali rehber olarak görünür; sınırlı İpucu seçili parçanın yerini gösterir.
- Seviyeler 9 → 16 → 25 → 36 parça; Günün Yapbozu; 1-3 yıldız; 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # parça kenarları ve seviye testleri
npm run gen:art                           # resimleri ve ikonu yeniden üret
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py jigsaw`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8773'te sunulurken `node scripts/store-screenshots.cjs`).
