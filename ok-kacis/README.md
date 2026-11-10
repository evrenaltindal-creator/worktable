# Ok Kaçış

Okları doğru sırayla tahtadan kaçırdığın bir bulmaca oyunu. Bu klasörde
reklam altyapısı hazır, oynanabilir bir prototip var.

- Bir oka dokununca ok, başının gösterdiği yöne kayar.
- Önü tahtanın kenarına kadar boşsa kaçar. Önünde başka bir ok varsa çarpar,
  geri döner ve bir can gider.
- Bütün okları çıkarınca seviye biter. Hata sayına göre 1-3 yıldız alırsın.
- **Zamana karşı modu:** 60 saniyeyle başlarsın, art arda gelen tahtalardan
  olabildiğince çok ok kaçırırsın. Her temizlenen tahta +8 sn kazandırır, her
  çarpma −3 sn götürür (bu modda can yok). Tahtalar büyüdükçe zorlaşır, her tur
  farklı tahtalarla başlar. Rekor kaydedilir. Ana menüden iki mod arasında
  geçilir; yarıda bırakılan oyun kaldığı yerden devam eder.
- **Puan ve kombo:** Uzun oklar daha çok puan verir. Hızlı art arda doğru
  hamleler kombo çarpanını büyütür (x2'den x5'e kadar), çarpmak komboyu bozar.
  Tahta bitince bonus, hatasız bitince "KUSURSUZ!" bonusu gelir.
- **Görsel şov:** Hareketli arka plan (akan oklar, kayan ızgara, ışık bulutları,
  kayan yıldız oklar), her okun çıktığı yerde kıvılcım patlaması ve uçan puan,
  kombo atlayınca ortada patlayan "KOMBO x3!" yazısı, tahta bitince havai fişek
  ve konfeti. x4'ten sonra skor paneli alev alır. Cihazda "hareketi azalt"
  açıksa efektler sadeleşir.
- **Skor tablosu:** Her iki mod için en iyi 5 skor (bu cihazda saklanır).
  Menüden açılır; tur bitince kaçıncı sıraya girdiğin gösterilir.
- Seviyeler sonsuzdur ve otomatik üretilir. Aynı seviye numarası herkeste aynı
  tahtayı verir. Her seviyenin çözülebildiği testle kontrol edilir.
- Telefon tarayıcısında, bilgisayarda ve (Capacitor ile) Android/iOS uygulaması
  olarak çalışır. Açık temada milimetrik kağıt, koyu temada mavi çizim kağıdı
  görünümü vardır.
- **7 dil:** Türkçe, İngilizce, Portekizce (Brezilya), Almanca, Fransızca,
  Japonca, Korece. Oyun cihazın diliyle açılır (desteklenmeyen dillerde
  İngilizce), menüdeki 🌐 düğmesinden değiştirilir ve seçim kaydedilir.

## Yayına alma rehberleri

- **iPhone / App Store (Mac gerekmez):** [store/APP-STORE-REHBERI.md](store/APP-STORE-REHBERI.md)
- **Kendi sitende tanıtım + oynanabilir oyun + AdSense:** [SITEYE-YUKLE.md](SITEYE-YUKLE.md)
- **Android / Google Play:** aşağıda "Yol 1"

## Hemen oyna

`www/index.html` dosyasına çift tıkla. Kurulum gerekmez, internet de gerekmez
(yalnızca yazı tipleri internetten gelir, yoksa sistem yazı tipi kullanılır).

Telefonda denemek için klasörü herhangi bir statik barındırmaya yükleyebilirsin
(GitHub Pages, Netlify, Cloudflare Pages).

Faydalı adres eklentileri:

| Ek | Ne yapar |
| --- | --- |
| `?ads=mock` | Her zaman test reklamlarını gösterir |
| `?ads=none` | Reklamsız oynar |
| `?debug` | Tarayıcı konsolunda `OkKacisDebug` nesnesini açar |

## Klasör yapısı

```
ok-kacis/
  README.md            bu dosya
  SITEYE-YUKLE.md      siteye koyma rehberi
  package.json         Capacitor (iOS/Android) ve test komutları: npm install, npm test, npm run site
  capacitor.config.json  uygulama adı ve paket kimliği (com.evrenaltindal.okkacis)
  ios/                 iOS projesi (GitHub'da bulut Mac'te derlenir)
  resources/           uygulama simgesi ve açılış ekranı (SVG kaynak + PNG)
  store/               App Store: rehber, 7 dilde metinler (listing.json), ekran görüntüleri
  site/                sitene yükleyeceğin hazır paket (tanıtım, oyun, gizlilik)
  tools/               store-metadata.js, build-site.js, screenshots.js
  www/                 oyunun kendisi (uygulamaya ya da siteye bu klasör girer)
    index.html
    style.css          görünüm (renkler en üstte)
    config.js          REKLAM KİMLİKLERİ ve reklam sıklığı burada
    js/levels.js       seviye üretici
    js/game.js         oyun, çizim, puan/kombo, skor tablosu, ekranlar
    js/fx.js           patlamalar, kıvılcımlar, uçan puanlar, büyük yazılar
    js/background.js   hareketli arka plan
    js/ads.js          reklam katmanı (AdMob, AdSense, CrazyGames, test)
    js/sound.js        ses efektleri
    js/i18n.js         bütün diller ve metinler
    fonts/             gömülü yazı tipleri (internetsiz çalışır, OFL lisanslı)
    manifest.webmanifest, icon.svg
  test/levels.test.js  300 seviye + 300 zamana karşı tahtası üretip çözer:
                       node ok-kacis/test/levels.test.js
  test/i18n.test.js    her dilde eksik metin ve yer tutucu kontrolü:
                       node ok-kacis/test/i18n.test.js
```

## Diller

Bütün metinler `www/js/i18n.js` dosyasında, dil başına bir tablo hâlinde
durur. Sayılar ve tarihler her ülkenin biçiminde yazılır (1.234 / 1,234 /
1 234), "1 arrow / 2 arrows" gibi tekil-çoğul ayrımı dilin kendi kuralıyla
yapılır. Japonca ve Korece seçilince uygun yazı tipi (Noto Sans JP/KR)
yalnızca o zaman indirilir; internet yoksa telefonun kendi yazı tipi kullanılır.

- **Oyunun adı** her dilde "Ok Kaçış" olarak kaldı. Ülkeye göre farklı bir ad
  istersen `gameTitle` satırını değiştirmen yeterli. Mağazada başka bir oyunla
  karışmayacak bir ad seçmeye dikkat et.
- **Yeni dil eklemek:** `LANGS` listesine bir satır, `STRINGS` içine aynı
  anahtarlarla bir tablo ekle, sonra `node ok-kacis/test/i18n.test.js` ile
  eksik kalan bir şey var mı bak.
- Çeviriler yapay zekâyla yapıldı ve oyunda tek tek denendi (taşma, eksik
  metin, yazı tipi). Yayından önce özellikle Japonca ve Korece için o dili
  ana dili olarak konuşan birine kısaca baktırmak iyi olur.
- Play Store'daki uygulama açıklamasını ve ekran görüntülerini de her dil
  için ayrıca girmen gerekir; bu dosya yalnızca oyunun içini çevirir.

## Reklamlar oyunun neresinde?

| Yer | Tür | Ne zaman | Ayar (`config.js`) |
| --- | --- | --- | --- |
| Seviye arası | Geçiş (interstitial) | 3. seviyeden sonra, her 2 seviyede bir, en az 45 sn arayla. "Sonraki seviye"ye basınca çıkar. | `firstInterstitialLevel`, `interstitialEveryNLevels`, `interstitialMinSeconds` |
| Can bitince | Ödüllü (rewarded) | Oyuncu "Reklam izle, +1 can" derse. Tahta olduğu gibi kalır. | — |
| İpucu bitince | Ödüllü (rewarded) | "Reklam izle, +3 ipucu" | `hintsPerAd` |
| Zamana karşı, süre bitince | Ödüllü (rewarded) | "Reklam izle, +15 sn". Tur başına bir kez. | `timeAttack.reviveSeconds` |
| Zamana karşı, "Tekrar oyna" | Geçiş (interstitial) | Her turdan sonra, yine en az 45 sn arayla | `timeAttack.interstitialEveryNRuns` |
| Ekranın altı | Banner | Oyun boyunca | `banner: true/false` |

Ödüllü reklamlar genelde en çok kazandıran ve oyuncuyu en az rahatsız eden
reklamlardır, çünkü oyuncu kendisi ister. Geçiş reklamını çok sık yaparsan
oyuncular oyunu siler. Varsayılan değerler dengeli bir başlangıçtır.

Gerçek reklam kimliği girilmediği sürece oyun **test reklamı** gösterir: siyah
bir ekran, sayaç ve "TEST REKLAMI" yazısı. Bunlar para kazandırmaz; sadece
reklamların nerede ve ne zaman çıkacağını gösterir.

## Reklamlarla para kazanmanın 3 yolu

Para, oyunu oynayan kişi sayısından gelir. Reklam başına kazanç ülkeye göre
çok değişir (ABD ve Batı Avrupa'daki oyuncular Türkiye'dekilerden kat kat
fazla kazandırır). Bu yüzden İngilizce desteği zaten açık.

### Yol 1: Android uygulaması + Google AdMob (önerilen)

Mobil bulmaca oyunlarında para çoğunlukla buradan gelir. Gerekenler: Node.js,
[Android Studio](https://developer.android.com/studio), bir
[Google Play Console](https://play.google.com/console) hesabı (tek seferlik
kayıt ücreti var) ve bir [AdMob](https://admob.google.com) hesabı.

1. **Android projesini oluştur** (Capacitor ayarları hazır, bu klasörde komut satırında):

   ```bash
   cd ok-kacis
   npm install
   npx cap add android
   ```

2. **AdMob uygulama kimliğini ekle.** `android/app/src/main/AndroidManifest.xml`
   dosyasında `<application ...>` etiketinin içine şunu yaz:

   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-3940256099942544~3347511713"/>
   ```

   Bu Google'ın test uygulama kimliğidir. AdMob'da uygulamanı oluşturunca
   kendi kimliğinle (`ca-app-pub-...~...`) değiştir.

3. **Test et.** `npx cap sync android` ve `npx cap open android` ile Android
   Studio'yu aç, telefonunda çalıştır. `config.js` > `admob.android` içindeki test kimlikleriyle
   Google'ın "Test Ad" etiketli reklamlarını görmelisin. Oyun AdMob'u kendisi
   bulur, `adProvider` ayarını değiştirmen gerekmez. Reklam çıkmazsa Android
   Studio'nun Logcat penceresinde `[OkAds]` satırlarına bak.

4. **Kendi kimliklerini gir.** AdMob panelinde 3 reklam birimi oluştur:
   Banner, Geçiş (Interstitial), Ödüllü (Rewarded). Kimlikleri
   `config.js` → `admob.android` bölümüne yaz ve `testing: false` yap. Sonra tekrar
   `npx cap sync android`.

5. **Yayınla.** Android Studio → Build → Generate Signed App Bundle ile `.aab`
   dosyası oluştur ve Play Console'a yükle. Yeni kişisel geliştirici
   hesaplarında Google, uygulamayı herkese açmadan önce bir süre kapalı test
   istiyor (belli sayıda test kullanıcısı, belli sayıda gün). Güncel şartları
   Play Console'da görürsün.

6. **app-ads.txt.** AdMob, bir web sitende `app-ads.txt` dosyası ister (Play
   Store'daki geliştirici web sitesi adresinde). Dosyanın içeriğini AdMob
   panelinde verir. Bu dosya olmazsa reklam gelirin düşebilir.

### Yol 2: Oyun portalları (CrazyGames, Poki, GameDistribution)

En hızlı yol bu: oyuncuyu portal getirir, reklamı portal satar, gelirden pay
alırsın. Kendi siten ya da reklam hesabın gerekmez.

- [CrazyGames geliştirici portalı](https://developer.crazygames.com) üzerinden
  başvur. `www` klasörünü zip yapıp yükle. Oyun CrazyGames'te açıldığında
  reklam katmanı onların SDK'sını kendisi kullanır (`adProvider: 'auto'`).
  Geçiş, ödüllü reklam ve "oyun başladı/bitti" bildirimleri hazır.
- Poki ve GameDistribution'ın SDK'ları farklıdır. Yeni bir sağlayıcı eklemek
  için `js/ads.js` içindeki `CrazyGamesProvider` sınıfını örnek al; oyunun geri
  kalanına dokunmana gerek yok.

### Yol 3: Kendi web siten + Google AdSense

1. Oyunu kendi alan adında yayınla (ör. Netlify veya GitHub Pages ile).
2. [AdSense](https://adsense.google.com)'e başvur ve siteni onaylat.
   Oyun içi reklamlar için AdSense'in **H5 oyun reklamları** (Ad Placement API)
   programına ayrıca başvurman gerekir.
3. `config.js` → `adsense.client` alanına `ca-pub-...` kimliğini yaz. İstersen
   alt banner için bir reklam birimi oluşturup `bannerSlot`'a yaz.
4. Önce `testMode: true` ile dene, sonra `false` yap.
5. Sitenin köküne AdSense'in verdiği `ads.txt` dosyasını koy.

Kendi sitende oyuncuyu sen bulman gerekir. Trafik yoksa gelir de olmaz; bu
yüzden ilk iki yol genelde daha hızlı sonuç verir.

## Hesabını kaybetmemek için kurallar

- **Kendi reklamına asla tıklama, kimseye tıklatma.** Google bunu yakalar ve
  hesabı kapatır, birikmiş parayı da ödemez. Geliştirirken hep test
  kimlikleriyle ya da `?ads=mock` ile dene.
- **Avrupa'daki oyuncular için izin formu** gerekir (GDPR). AdMob tarafında
  form AdMob panelindeki "Gizlilik ve mesajlaşma" bölümünden açılır; oyun
  açılışta formu gerekiyorsa kendisi gösterir. AdSense'te aynı bölüm
  sitedeki formu yönetir.
- Oyunu Play Store'da **çocuklara yönelik** işaretlersen reklam kuralları
  değişir (kişiselleştirilmiş reklam yok, onaylı reklam ağları). Hedef kitleyi
  "13 yaş ve üstü" seçmek işleri kolaylaştırır.
- Ödüllü reklam düğmesinde oyuncuya ne kazanacağını açıkça yaz. Oyundaki
  düğmeler bunu zaten yapıyor ("Reklam izle, +1 can").

## Ayarlar (`www/config.js`)

| Ayar | Varsayılan | Açıklama |
| --- | --- | --- |
| `adProvider` | `'auto'` | `auto`, `mock`, `admob`, `adsense`, `crazygames`, `none` |
| `admob.*Id` | Google test kimlikleri | Kendi AdMob reklam birimi kimliklerin |
| `admob.testing` | `true` | Yayında `false` |
| `adsense.client` | boş | `ca-pub-...` |
| `banner` | `true` | Alt banner açık mı |
| `firstInterstitialLevel` | `3` | İlk geçiş reklamı en erken bu seviye bitince |
| `interstitialEveryNLevels` | `2` | Sonra kaç seviyede bir |
| `interstitialMinSeconds` | `45` | İki reklam arası en az süre |
| `hearts` | `3` | Seviye başına can |
| `startHints` / `hintsPerAd` | `3` / `3` | Başlangıç ipucu / reklam başına ipucu |
| `score.perArrowCell` | `10` | Ok başına puan = hücre sayısı × bu × kombo çarpanı |
| `score.comboWindow` | `2.4` | Kombonun sürmesi için iki ok arasındaki en uzun süre (sn) |
| `score.clearBonus` / `score.perfectBonus` | `100` / `150` | Tahta bitince / hatasız bitince ek puan |
| `timeAttack.startSeconds` | `60` | Zamana karşı turunun başlangıç süresi |
| `timeAttack.clearBonusSeconds` | `8` | Temizlenen her tahta için eklenen süre |
| `timeAttack.mistakePenaltySeconds` | `3` | Her çarpmada düşen süre |
| `timeAttack.reviveSeconds` | `15` | Ödüllü reklamla eklenen süre |
| `timeAttack.interstitialEveryNRuns` | `1` | "Tekrar oyna"da kaç turda bir geçiş reklamı |

## Neler test edildi, neler edilmedi

Test edildi:

- 300 seviye ve 300 zamana karşı tahtası: çakışma yok, her ok kurallara
  uygun, hepsi çözülebiliyor (`node ok-kacis/test/levels.test.js`).
- Tarayıcıda telefon ve bilgisayar boyutunda, açık ve koyu temada: dokunma,
  çarpma ve can kaybı, seviye geçişi, 3. seviyeden sonra geçiş reklamı, canı
  bitince ödüllü reklamla devam, ipucu ve ipucu için ödüllü reklam, sayfa
  yenilenince kaldığı seviyeden devam. Konsolda hata yok.
- Zamana karşı: sayaç, çarpma cezası, tahta bonusu, ana menüde sayacın
  durması ve devam, son 10 saniye uyarısı, rekor, +15 sn ödüllü reklam (tur
  başına bir kez), turlar arası geçiş reklamı ve 45 sn kuralı.
- 7 dilin hepsinde, 360 piksel genişliğindeki telefonda: menü, oyun, skor
  paneli, süre bitti ekranı, test reklamı ve skor tablosu; taşan veya
  çevrilmemiş metin yok. Dil düğmesi ve sayfa yenilenince dilin korunması.
- Puan, kombo (x5'e kadar, çarpınca sıfırlanma), patlamalar, skor tablosu ve
  sıralama, açık/koyu tema ve "hareketi azalt" ayarı. Efektler yoğunken
  bile tarayıcıda saniyede 60 kare.
- AdMob katmanının mantığı, sahte bir Capacitor eklentisiyle (ödül alındı,
  reklam yarıda kapatıldı, olay dinleyicisi yok durumları; iOS'ta iOS
  kimlikleri ve izleme izni, Android'de Android kimlikleri).
- iOS projesi Capacitor 8 ile oluşturuldu; App Store metinleri karakter
  sınırlarına göre denetlendi (`node ok-kacis/tools/store-metadata.js`).
- Site: tanıtım sayfası (telefon, bilgisayar, açık/koyu, Türkçe/İngilizce/Japonca),
  gizlilik sayfası, tanıtım kutusu üreteci, sitedeki oyunun reklamsız ve
  AdSense'li hâlleri; sitede hiçbir durumda test reklamı çıkmıyor.

Test edilemedi (gerçek hesap ve cihaz gerekiyor):

- Gerçek AdMob, AdSense ve CrazyGames reklamları. Bu katmanlar resmi
  belgelerdeki arayüze göre yazıldı. Yayından önce telefonda (iOS'ta
  TestFlight ile) test reklamlarının çıktığını mutlaka gör.
- iOS derlemesi ve App Store Connect'e yükleme iş akışları: Apple hesabı ve
  macOS gerektiriyor, ilk kez senin anahtarlarınla GitHub'da çalışacaklar.

## Sonraki adımlar için fikirler

- **Dünya skor tablosu:** Şu anki tablo sadece bu cihazdaki skorları gösterir.
  Oyuncuların birbirleriyle yarışması için bir sunucu gerekir (Android'de
  Google Play Games skor tabloları en kolay yol).
- **Analitik** (Firebase veya GameAnalytics): oyuncular hangi seviyede
  bırakıyor? Reklam sıklığını buna göre ayarlarsın.
- **"Reklamları kaldır" satın alımı**: genelde reklam gelirine ek gelir getirir.
- **Günlük bulmaca** ve seri ödülü: oyuncunun her gün geri gelmesini sağlar.
- **Yeni mekanikler**: kilitli oklar, iki yöne giden oklar, tahtada delikler.
- Yazı tiplerini `www` içine koymak, uygulamanın internetsiz de aynı görünmesini
  sağlar.
