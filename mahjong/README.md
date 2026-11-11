# Huzur Mahjong

Büyük taşlı, sakin, yaşlı oyunculara da uygun bir **Mahjong Solitaire** (taş eşleştirme)
oyunu. iPhone ve iPad için hazırlandı; aynı kod Android'de de çalışır.

> **Neden "klon" değil?** Mahjong Solitaire herkesin yapabileceği genel bir oyun türü,
> ama başka bir uygulamanın adını, görsellerini, dizilimlerini veya görünüşünü kopyalamak
> hem telif/marka sorunu yaratır hem de Apple'ın **4.1 (Taklitçi uygulamalar)** kuralı
> gereği uygulamanın reddedilmesine yol açar. Bu yüzden bu oyundaki **her şey özgündür**:
> ad, taş çizimleri, ikon, 16 dizilim, sesler ve arayüz bu proje için sıfırdan üretildi.
> Mağaza açıklamasında veya anahtar kelimelerde başka bir uygulamanın adını kullanmayın
> (Apple bunu da reddeder, kural 2.3.7).

## Özellikler

- **Büyük, okunaklı taşlar:** dizilimler en fazla 8 sütun; taşlar ekrana göre otomatik büyür.
- **Seçilebilir taşlar belirgin:** kapalı taşlar soluk gösterilir (ayarlardan kapatılabilir).
- **Her seviye çözülebilir:** dağıtım, geçerli bir çözüm garanti edilerek üretilir.
- **Hareketli temalar:** her 10 seviyede değişen sahneler (lale bahçesi, Boğaz'da gün batımı,
  Kapadokya'da balonlar, Ege kıyısı) ve üzerlerinde süzülen yapraklar, martılar, balonlar, yelkenliler.
- **Canlı efektler:** taşlar seviye başında düşerek gelir, eşleşenler birbirine uçup parıltıyla
  patlar; art arda hızlı eşleşmelerde kombo yazısı ("Harika! x3"), bitişte konfeti ve 1-3 yıldız.
- **Sınırlı güçlendiriciler:** ipucu, karıştır ve geri al hakları sayılıdır (başlangıçta 3 / 2 / 5).
  Yeni bir seviyeyi ilk kez bitirince ödül kazanılır: her seviye +1 geri al, 3 yıldız +1 ipucu,
  her 5. seviye +1 karıştır ve +1 ipucu. Hamle kalmazsa karıştırma ücretsizdir (oyun kilitlenmez).
- **Yıldızlar:** hiç ipucu/karıştırma kullanmadan bitirmek 3 yıldız; süre baskısı yok.
- **8 oyun, aynı taşlarla:** Klasik, Zamana Karşı, Günün Bulmacası, Toplam 10 (toplamı 10 olan
  iki taş), Üçlü Toplama (7'lik rafa 3 aynı taş), Bağlantı (en fazla iki dönüşlü çizgiyle birleştir),
  Hafıza (kapalı taşları çevir) ve Zirve (bir büyük ya da bir küçük taşı seç). Ana sayfadaki
  "Tüm oyunlar" düğmesinden açılır; her modun kendi seviyesi ve yıldızları vardır.
- **200 seviye**, 16 özgün dizilim (kalp, ev, kelebek, kale, piramit…).
- **Otomatik kayıt:** uygulama kapansa da oyun kaldığı yerden devam eder.
- **7 dil:** Türkçe, İngilizce, Portekizce (Brezilya), Almanca, Fransızca, Japonca, Korece.
  Telefonun diline göre otomatik açılır; oyuncu Ayarlar → Dil'den değiştirebilir. Desteklenmeyen
  bir dilde İngilizce açılır. iPhone'da Ayarlar → Huzur Mahjong → Dil'den de seçilebilir.
- Ses efektleri ve titreşim.
- İnternet gerektirmez, **hiçbir kullanıcı verisi toplamaz**.

## Bilgisayarınızda / telefonunuzda deneme (Windows'ta da çalışır)

1. [Node.js LTS](https://nodejs.org) kurun.
2. Bu klasörde bir komut satırı açıp:
   ```bash
   npm install
   npx expo start
   ```
3. iPhone'a App Store'dan **Expo Go** uygulamasını kurun, ekrandaki QR kodu iPhone
   kamerasıyla okutun. Oyun telefonunuzda açılır; kodda yaptığınız değişiklikler anında yansır.
   (Tarayıcıda denemek için terminalde `w` tuşuna basın.)

## App Store'da yayınlama (Mac GEREKMEZ)

Derleme ve imzalama Expo'nun bulut sunucularında yapılır (EAS Build).

### Bir kerelik hazırlık

1. **Apple Developer Program** üyeliği alın — yıllık 99 USD:
   <https://developer.apple.com/programs/>
   (Bireysel hesap en hızlısıdır. Şirket adına yayınlayacaksanız D-U-N-S numarası gerekir.)
2. Ücretsiz bir **Expo hesabı** açın: <https://expo.dev/signup>
3. `app.json` içindeki `ios.bundleIdentifier` değerini kontrol edin
   (şu an `com.evrenaltindal.huzurmahjong`). **İlk yüklemeden sonra değiştirilemez.**
4. Uygulama adı App Store'da benzersiz olmalı. "Huzur Mahjong" alınmışsa `app.json`
   içindeki `name` değerini ve `src/i18n.ts` içindeki `appName` değerini değiştirin.

### Derleme ve yükleme

```bash
npx eas-cli@latest login          # Expo hesabınızla giriş
npx eas-cli@latest init           # projeyi Expo hesabınıza bağlar (bir kez)
npm run build:ios                 # bulutta iOS derlemesi (~15-30 dk)
```

`build:ios` sırasında Apple kimliğinizle giriş yapmanız istenir; sertifika ve
provisioning profile'ı **otomatik** oluşturmasına izin verin.

Derleme bitince:

```bash
npm run submit:ios                # derlemeyi App Store Connect'e (TestFlight) yükler
```

İlk gönderimde App Store Connect'te uygulama kaydı yoksa EAS sizin için oluşturmayı
teklif eder.

### App Store Connect'te doldurulacaklar (<https://appstoreconnect.apple.com>)

1. **TestFlight:** derleme birkaç dakika içinde görünür; kendi iPhone'unuzda test edin.
2. **Diller:** App Store Connect'te uygulama sayfasının sağ üstündeki dil menüsünden Türkçe,
   English (U.S.), Portuguese (Brazil), German, French, Japanese ve Korean dillerini ekleyin.
3. **Ekran görüntüleri:** her dil için hazır — `store/screenshots/<dil>/iphone-6.9/` (6.9" iPhone).
   13" iPad görüntüleri Türkçe ve İngilizce için `ipad-13` klasöründe; diğer dillerde App Store
   ana dilin iPad görüntülerini kullanır.
4. **Açıklama, anahtar kelimeler, alt başlık:** 7 dilde hazır, `store/app-store-listing.md` dosyasında.
5. **Gizlilik politikası adresi (zorunlu):** `store/privacy-policy.md` metnini bir web sayfasında
   yayınlayın (ör. GitHub Pages, Google Sites) ve adresini girin.
6. **App Privacy (Uygulama Gizliliği):** "Veri toplanmıyor" (*Data Not Collected*) seçin.
7. **Yaş derecelendirmesi:** anketteki tüm sorulara "Hayır/Yok" → 4+.
8. **Kategori:** Oyunlar → Bulmaca (Puzzle), ikinci: Masa Oyunu (Board).
9. **Fiyat:** Ücretsiz (veya istediğiniz fiyat). Sonra **İncelemeye Gönder**.

Apple incelemesi genellikle 1-3 gün sürer.

### Güncelleme yayınlama

Kodu değiştirin, `app.json` içinde `version` değerini artırın (ör. `1.0.1`), sonra yine
`npm run build:ios` ve `npm run submit:ios`. Yapı numarası otomatik artar.

## Proje yapısı

```
App.tsx                    Ekranlar arası geçiş, ilerleme kaydı
src/game/
  tiles.ts                 Taş türleri ve eşleşme kuralı
  layouts.ts               16 dizilim (ASCII çizim olarak, kolayca yenisi eklenir)
  engine.ts                Kurallar, çözülebilir dağıtım, ipucu, karıştırma
  levels.ts                Seviye -> dizilim + tohum eşlemesi
src/screens/               Ana sayfa, Seviyeler, Oyun ekranları
src/components/            Taş, tahta, düğmeler, açılır pencere
src/boosters.ts            Güçlendirici hakları, ödüller, yıldız ve puan kuralları
src/themes.ts              Tema sahneleri ve süzülen parçacıklar (seviyeye göre)
src/i18n.ts                Tüm Türkçe/İngilizce metinler
src/theme.ts               Renkler ve yazı boyutları
src/storage.ts             Cihazda kayıt (ilerleme, ayarlar, yarım kalan oyun)
assets/tiles, assets/ui    Üretilmiş taş ve simge görselleri (PNG)
assets/scenes, assets/fx   Tema sahneleri ve efekt parçacıkları (PNG)
assets/sounds              Üretilmiş ses efektleri (WAV)
scripts/                   Görsel/ses üreticileri, oyun motoru testi, mağaza görüntüleri
store/                     Mağaza ekran görüntüleri, açıklama taslağı, gizlilik politikası
```

### Sık yapılacak değişiklikler

- **Yeni dizilim eklemek:** `src/game/layouts.ts` içine `build('ad', [...])` ekleyin
  (`#` = taş, `.` = boşluk; üst katlar `dx/dy` ile yarım taş kaydırılabilir), sonra
  `npm run check:game` ile kontrol edin. Bu test her dizilimi ve 200 seviyenin hepsini
  çözerek doğrular.
- **Renkler:** `src/theme.ts`
- **Güçlendirici sayıları ve ödüller:** `src/boosters.ts` (`START_BOOSTERS`, `levelRewards`)
- **Temalar ve hareketli parçacıklar:** `src/themes.ts`; sahne çizimleri `scripts/art-scenes.cjs`
- **Metinler / dil eklemek:** `src/i18n.ts` (yeni bir dil için: o dilin metin bloğunu ekleyin,
  `LANGUAGES` listesine yazın ve `app.json` içindeki `supportedLocales` listesine ekleyin)
- **Taş çizimleri:** `scripts/generate-art.cjs` içindeki SVG kodları; değiştirdikten sonra
  `npm run gen:art` (Playwright gerektirir, dosyanın başındaki nota bakın).

### Kontroller

```bash
npm run typecheck      # TypeScript
npx expo lint          # kod kalitesi
npm run check:game     # oyun motoru: dizilimler + 200 seviyenin çözülebilirliği
npx expo-doctor        # Expo yapılandırma kontrolü
```

## Lisanslar ve kaynaklar

- Taş üzerindeki Çince karakterler **Noto Serif TC** yazı tipiyle çizilip PNG'ye
  dönüştürüldü (SIL Open Font License 1.1 — ticari kullanıma uygun).
- Diğer tüm görseller ve sesler bu projedeki betiklerle üretildi.

## Sonraki adımlar için öneriler

- Gelir modeli: hakkı biten oyuncuya ödüllü reklam karşılığı ipucu/karıştırma, veya uygulama içi
  satın alma ile güçlendirici paketleri (altyapı `src/boosters.ts` içinde hazır).
- Günlük bulmaca, başarımlar, Game Center skor tablosu.
- Daha fazla dizilim ve tema (arka plan / taş rengi seçimi).
