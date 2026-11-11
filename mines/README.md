# Huzur Mines (Mayın Tarlası)

Huzur oyun ailesinden, tahmin gerektirmeyen sakin bir mayın tarlası. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurmines`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh mines`).

- Kolay (8x10, 10 mayın), Orta (9x12, 20), Zor (10x14, 32); her birinde sınırsız oyun ve Günün Oyunu.
- İlk dokunuş her zaman güvenli; her tahta yerleşik bir çözücüyle denenir, **sadece mantıkla çözülebilir**.
- Bayrak düğmesi ya da basılı tutarak bayrak, bayrakları tamam sayıya dokununca çevresini açma.
- Sınırlı ipucu (güvenli kareyi gösterir; her galibiyet +1), 1-3 yıldız, konfeti, 7 dil.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # motor testleri
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py mines`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`.
