# Huzur Words (Kelime Avı)

Huzur oyun ailesinden süre baskısı olmayan sakin bir kelime avı oyunu. App Store'a **ayrı bir uygulama**
olarak yüklenir (paket kimliği `com.evrenaltindal.huzurwords`). Ortak parçalar `src/kit/` içinde
(`shared/kit` kopyası; güncellemek için `shared/sync-kit.sh words`).

- Kelimeler oyunun dilinde: Türkçe, İngilizce, Portekizce, Almanca, Fransızca, Japonca (hiragana), Korece (hece).
  6 tema (meyveler, hayvanlar, ev, doğa, mutfak, renkler ve hava), her dilde ayrı liste.
- Parmak ilk harften son harfe kaydırılır; bulunan kelime renkli şeritle işaretlenir, ters çekmek de kabul edilir.
- İlk seviyelerde yalnız sağa/aşağı, sonra çapraz, en sonda ters kelimeler. Her kelime tabloda tam bir kez geçer.
- Sınırlı İpucu (ilk harfi parlatır), Günün Bulmacası, 1-3 yıldız.

```bash
npm install && npx expo start            # telefonda Expo Go ile dene
npm run check:game                        # 7 dil x 40 seviye bulmaca testi
npx eas-cli@latest init && npm run build:ios && npm run submit:ios   # App Store
```

Mağaza: `store/APP-STORE-CONNECT.md` (rehber), `store/listing.json` (7 dil; `python3 shared/store_tools.py words`
ile `app-store-listing.md`, rehber ve `docs/` sayfaları üretilir), `store/screenshots/`
(web derlemesi 8774'te sunulurken `node scripts/store-screenshots.cjs`).
