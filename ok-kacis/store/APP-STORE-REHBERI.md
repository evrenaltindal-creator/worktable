# Ok Kaçış'ı App Store'a yükleme rehberi (Mac gerekmez)

iOS uygulaması GitHub'ın bulut Mac'inde derlenir ve App Store Connect'e
oradan yüklenir. Senin yapacakların: Apple'da birkaç kayıt, GitHub'a 4 gizli
anahtar eklemek ve iki düğmeye basmak. İlk sefer yaklaşık 1 saat sürer.

Hazır olanlar:

- iOS projesi: `ok-kacis/ios/` (Capacitor 8, yalnızca iPhone, dikey ekran)
- Uygulama simgesi ve açılış ekranı: `ok-kacis/resources/`
- Derleme + yükleme iş akışı: `.github/workflows/ios-app-store.yml`
- App Store sayfası iş akışı: `.github/workflows/app-store-metadata.yml`
- 7 dilde App Store metinleri: `ok-kacis/store/listing.json`
- 7 dilde 4'er ekran görüntüsü (6,9" iPhone): `ok-kacis/store/fastlane/screenshots/`
- Gizlilik politikası sayfası: `ok-kacis/site/gizlilik.html` (bkz. `ok-kacis/SITEYE-YUKLE.md`)

Uygulamanın paket kimliği (Bundle ID): **`com.evrenaltindal.okkacis`**

---

## 0. İş akışlarını ana dala al

GitHub'daki "Run workflow" düğmesi yalnızca deponun ana dalındaki iş
akışlarında görünür. Bu çalışma `claude/festive-wright-wotpi5` dalında.

1. github.com/evrenaltindal-creator/worktable sayfasını aç.
2. Üstte çıkan **Compare & pull request** düğmesine bas (çıkmazsa **Pull
   requests > New pull request**, sağ tarafta `claude/festive-wright-wotpi5`).
3. **Create pull request**, ardından **Merge pull request**.

Oyun ayrı bir klasörde (`ok-kacis/`) durduğu için AI Ofis'e dokunmaz.

## 1. Paket kimliğini Apple'a kaydet

1. https://developer.apple.com/account > **Certificates, Identifiers & Profiles** > **Identifiers** > **+**
2. **App IDs** > **App** > Continue
3. Description: `Ok Kacis` · Bundle ID: **Explicit** · `com.evrenaltindal.okkacis`
4. Ek yetenek (capability) seçme. **Continue** > **Register**.

> Başka bir kimlik istersen bana söyle; iki dosyada değişmesi gerekiyor
> (`ok-kacis/capacitor.config.json` ve `ok-kacis/ios/App/App.xcodeproj/project.pbxproj`).

## 2. App Store Connect'te uygulamayı oluştur

1. https://appstoreconnect.apple.com > **Apps** > **+** > **New App**
2. Platform: **iOS** · Name: `Ok Kaçış: Ok Bulmacası` (alınmışsa `Ok Kaçış: Arrow Puzzle`)
3. Primary Language: **Turkish** · Bundle ID: `com.evrenaltindal.okkacis`
4. SKU: `okkacis-ios` · User Access: **Full Access** > **Create**

## 3. App Store Connect API anahtarı oluştur

1. App Store Connect > **Users and Access** > **Integrations** > **App Store Connect API** > **Team Keys**
   (ilk seferde hesap sahibi olarak **Request Access** demen gerekebilir)
2. **Generate API Key** · Name: `GitHub` · Access: **Admin** > **Generate**
3. **Download API Key** ile `.p8` dosyasını indir. **Yalnızca bir kez indirilebilir**, sakla.
4. Aynı sayfada iki değeri not et: **Issuer ID** (tablonun üstünde) ve anahtarın **Key ID**'si.

Neden Admin: bulut Mac, uygulamayı imzalamak için gereken sertifikaları senin
adına oluşturur; bu yetki yalnızca Admin anahtarında var.

## 4. Team ID'yi bul

https://developer.apple.com/account > **Membership details** > **Team ID** (10 karakter).

## 5. GitHub'a 4 gizli anahtar ekle

github.com/evrenaltindal-creator/worktable > **Settings** > **Secrets and
variables** > **Actions** > **New repository secret**. Her biri için:

| Name | Değer |
| --- | --- |
| `APPLE_TEAM_ID` | 4. adımdaki Team ID |
| `ASC_KEY_ID` | 3. adımdaki Key ID |
| `ASC_ISSUER_ID` | 3. adımdaki Issuer ID |
| `ASC_KEY_P8` | `.p8` dosyasını Not Defteri ile aç, **tamamını** kopyala (`-----BEGIN PRIVATE KEY-----` ve `-----END PRIVATE KEY-----` satırları dahil) |

Bu değerleri sohbete yazma ya da bir dosyaya kaydedip depoya yükleme. Depo
herkese açık; gizli anahtarlar yalnızca bu bölümde güvende ve günlüklerde
görünmez.

## 6. Uygulamayı derle ve yükle

1. GitHub > **Actions** > soldan **iOS: App Store Connect'e yükle** > **Run workflow**
2. Sürüm: `1.0.0` > **Run workflow**
3. 15-25 dakika sürer. Yeşil tik çıkınca yapı App Store Connect'e gitmiştir.
4. App Store Connect > uygulaman > **TestFlight**: yapı 15-30 dakika içinde
   "işleniyor"dan çıkar. Kendini **Internal Testing**'e ekleyip iPhone'una
   TestFlight uygulamasıyla kurabilirsin.

Kırmızı çarpı çıkarsa bana "iOS iş akışı hata verdi" de; günlükleri okuyup
düzeltirim. Hata günlükleri ayrıca çalışmanın altında `xcodebuild-log` ekinde.

## 7. App Store sayfasını doldur (7 dil, ekran görüntüleri)

Önce siteni yayına al (`ok-kacis/SITEYE-YUKLE.md`): gizlilik politikası
adresinin açılıyor olması gerekiyor.

1. GitHub > **Actions** > **iOS: App Store sayfasını güncelle** > **Run workflow**
2. Site adresi: ör. `https://siten.com/ok-kacis` · Sürüm: `1.0.0` > **Run workflow**

Bu iş, 7 dilin hepsinde adı, alt başlığı, açıklamayı, anahtar kelimeleri,
tanıtım metnini, gizlilik/destek bağlantılarını ve 28 ekran görüntüsünü
yükler. Metinleri değiştirmek istersen `ok-kacis/store/listing.json`'u düzenle
ve bu işi yeniden çalıştır.

## 8. Gerçek reklam kimliklerini gir (göndermeden önce)

Şu an uygulamada Google'ın **test** reklamları var; para kazandırmazlar.

1. https://admob.google.com > **Apps** > **Add app** > iOS > "Listelenmiş değil" (henüz yayında değil)
2. Uygulamaya 3 reklam birimi ekle: **Banner**, **Interstitial** (geçiş), **Rewarded** (ödüllü)
3. Kimlikleri bana yaz (gizli değiller) ya da kendin şu yerlere gir:
   - `ok-kacis/www/config.js` > `admob.ios` içindeki üç kimlik, ve `testing: false`
   - `ok-kacis/ios/App/App/Info.plist` > `GADApplicationIdentifier` (uygulama kimliği, `~` işaretli olan)
4. 6. adımı aynı sürümle (`1.0.0`) yeniden çalıştır; yapı numarası kendiliğinden artar.
5. AdMob > **Blocking controls** > **Content rating**: en yüksek reklam içeriği **G** veya **PG** seç
   (yaş sınırı 4+ olan bir oyunda uygunsuz reklam çıkmasın).

Uygulama yayınlanınca AdMob'da uygulamayı App Store'daki sayfasına bağla ve
siteye `app-ads.txt` dosyasını koy (`ok-kacis/SITEYE-YUKLE.md`).

## 9. App Store Connect'te kalan alanlar (bir kerelik)

**App Information**
- Category: **Games** > **Puzzle** (ikincil: **Games** > **Casual**)
- Content Rights: üçüncü taraf içerik yok
- Age Rating: anketi doğru yanıtla (şiddet, kumar vb. hepsine **None**). Reklam
  sorusu gelirse **Evet** de; uygulamada reklam var.

**Pricing and Availability**: Free · bütün ülkeler

**App Privacy**
- Privacy Policy URL: `https://siten.com/ok-kacis/gizlilik.html`
- "Veri topluyor musunuz?" > **Evet** (oyunun kendisi toplamıyor ama Google reklam SDK'sı topluyor)
- Google'ın güncel listesini birebir işaretle:
  https://developers.google.com/admob/ios/privacy/data-disclosure
  Genelde şunlar çıkar: **Identifiers > Device ID**, **Usage Data > Product
  Interaction ve Advertising Data**, **Diagnostics**, **Location > Coarse
  Location**; amaç **Third-Party Advertising** ve **Analytics**; izleme
  (tracking) için **Evet**.

**Sürüm sayfası (1.0.0)**
- Build: 6. adımdaki yapıyı seç
- Copyright: `2026 Adın Soyadın`
- App Review Information: adın, telefonun, e-postan · Sign-in required: **Hayır**
- Notes (inceleme notu, İngilizce):
  `Offline puzzle game, no account needed. Ads are served by Google AdMob. Time attack mode is in the main menu.`
- Export Compliance sorusu çıkmaz (projede "şifreleme kullanmıyor" olarak işaretli).

Sonra **Add for Review** > **Submit to App Review**. İnceleme genelde 1-3 gün sürer.

## Reddedilirse

Apple'ın en sık gerekçeleri ve bu oyundaki durum:

- **4.3 (benzer uygulamalar):** Ok bulmacaları kalabalık bir tür. İnceleme
  notunda oyunun kendine ait yanlarını (zamana karşı modu, kombo sistemi, sonsuz
  üretilen seviyeler, 7 dil) belirtmek işe yarar.
- **2.1 (çökme/eksik):** TestFlight'ta kendi iPhone'unda bir tur oyna, reklam
  izni penceresini ve ödüllü reklamı dene.

Gelen mesajı bana ilet; ne değişmesi gerektiğine birlikte bakarız.

## Sonraki sürümler

Oyunda değişiklik yaptıktan sonra 6. adımı yeni bir sürüm numarasıyla
(`1.0.1`, `1.1.0` …) çalıştır, App Store Connect'te yeni sürüm oluşturup yapıyı
seç ve incelemeye gönder.
