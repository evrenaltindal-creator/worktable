# Çini Ustası yayın rehberi

> **10 Kasım 2026 hazırlık durumu:** App Store Connect'te Çini Ustası taslağı ve `com.evrenaltindal.ciniustasi` paket kimliği oluşturuldu. Destek ve gizlilik sayfaları yayımlandı. İmzalı IPA üretildi; Apple'a yükleme ve gerçek iPhone üzerinde test ayrıca yapılmalıdır.

Bu rehber iki işi anlatır: oyunu **App Store'a yüklemek** ve **sitenizde tanıtmak**. Hazır olan her şey bu klasörde. Sizin yapmanız gereken adımlar aşağıda sırayla.

## Klasörde neler var

| Klasör / dosya | Ne işe yarar |
|---|---|
| `index.html` | Oyunun kaynağı. Her değişiklik burada yapılır. |
| `app/` | iOS uygulaması (Capacitor + Xcode projesi). |
| `app/resources/` | Uygulama ikonu (1024×1024) ve açılış ekranı. Xcode projesine yerleştirildi. |
| `magaza/METINLER.md` | App Store metinleri, 7 dilde, kopyala-yapıştır için hazır. |
| `magaza/ekran-goruntuleri/` | App Store ekran görüntüleri, 7 dilde 3'er tane, 1290×2796. |
| `site/` | Sitenize yüklenecek klasör: tanıtım sayfası, tarayıcıda oynanan sürüm, gizlilik politikası, görseller. |
| `site/tanitim-bolumu.html` | Ana sayfanıza yapıştıracağınız tanıtım kutusu. |

## Mevcut yayın durumu

- App Store Connect taslağı: https://appstoreconnect.apple.com/apps/6832990354/distribution
- Destek: https://evrenaltindal-creator.github.io/vardiox-legal/cini-ustasi/
- Gizlilik: https://evrenaltindal-creator.github.io/vardiox-legal/cini-ustasi/gizlilik.html
- GitHub dalı: `codex/cini-ustasi-release-prep`. İmzalı IPA, `Cini Ustasi signed IPA` iş akışıyla üretilir. Bu iş akışı Apple'a yükleme veya inceleme başlatmaz.
- Apple hesabındaki gizlilik anketi, yaş derecelendirmesi, içerik hakları, fiyatlandırma ve mağaza ekran görüntüleri gönderimden önce tamamlanmalıdır. Gerçek cihaz testi de yapılmalıdır.
- Dağıtım sertifikası ve Apple API anahtarı GitHub Actions gizli alanında tutulur. Yeni veya daha geniş yetkili bir anahtar oluşturmak otomatik olarak gerekli değildir.

Mac'iniz varsa aşağıdaki elle yol da kullanılabilir. Aşağıdaki bazı adımlar mevcut taslak için önceden tamamlanmıştır.

---

## 1. Bölüm: App Store

### Gerekenler

- **Apple Developer Program üyeliği.** Yıllık ücretlidir (ABD'de 99 $). developer.apple.com adresinden kişisel ya da şirket olarak katılınır. Onay birkaç gün sürebilir.
- **Bir Mac** ve Mac App Store'dan güncel **Xcode**.
- Mac'te **Node.js** (LTS sürümü, nodejs.org).
- Test için kendi **iPhone**'unuz (önerilir).

### Adım 1: Projeyi Mac'te açın

```bash
git clone https://github.com/evrenaltindal-creator/worktable.git
cd worktable
git checkout codex/cini-ustasi-release-prep
cd prototypes/cini-ustasi/app
npm install        # gerekli paketler
npm run sync       # oyunu derler ve Xcode projesine kopyalar
npm run open       # Xcode'u açar
```

### Adım 2: Xcode'da imza ve kimlik

1. Soldaki listeden **App** projesini, ortadan **App** hedefini seçin.
2. **Signing & Capabilities** sekmesi:
   - **Team:** Apple Developer hesabınız. Gerekirse Xcode → Settings → Accounts'tan hesabınızı ekleyin.
   - **Bundle Identifier:** Kendi kimliğiniz (`com.sirketadi.ciniustasi`). Aynısını `app/capacitor.config.json` içindeki `appId`'ye de yazın.
   - **Automatically manage signing** açık kalsın. Xcode kimliği Apple hesabınıza kendisi kaydeder.
3. **General** sekmesi: Display Name `Çini Ustası`, Version `1.0`, Build `1`.

Ayarlı gelenler (dokunmanıza gerek yok):
- Yalnızca iPhone ve yalnızca dikey ekran.
- iOS 15 ve üstü.
- Şifreleme beyanı "yok" (`ITSAppUsesNonExemptEncryption`). Bu sayede ihracat uyumluluğu sorusu sorulmaz.

### Adım 3: Kendi iPhone'unuzda deneyin

iPhone'u kabloyla bağlayın. Xcode'da üstteki cihaz menüsünden telefonunuzu seçip **▶ Run**'a basın. İlk seferde iPhone'da Ayarlar → Gizlilik ve Güvenlik → Geliştirici Modu'nu açmanız istenebilir.

Kontrol edin:
- Oyun açılıyor ve internet kapalıyken de çalışıyor.
- Yerleştirme ve patlamada titreşim var.
- Sesler çalışıyor. iPhone sessiz moddaysa web sesleri duyulmaz, bu normaldir.
- Dil, telefonun diline göre geliyor.

### Adım 4: App Store Connect'e yükleyin

1. Xcode'da cihaz menüsünden **Any iOS Device (arm64)** seçin.
2. **Product → Archive.** Bitince Organizer penceresi açılır.
3. **Distribute App → App Store Connect → Upload** → varsayılan seçeneklerle devam edin.
4. Yükleme sonrası Apple derlemeyi işler (genelde 15–30 dakika). Bitince e-posta gelir ve derleme App Store Connect'te **TestFlight** sekmesinde görünür.

İsterseniz önce **TestFlight** ile deneyin. Kendinizi iç test kullanıcısı olarak ekleyip iPhone'a TestFlight uygulamasıyla kurabilirsiniz.

### Adım 5: App Store Connect'te uygulama kaydı

appstoreconnect.apple.com → **Apps → + → New App**:

| Alan | Değer |
|---|---|
| Platforms | iOS |
| Name | `Çini Ustası: Blok Bulmaca` |
| Primary Language | Turkish |
| Bundle ID | Xcode'da verdiğiniz kimlik |
| SKU | `CINIUSTASI001` (yalnızca sizin göreceğiniz bir kod) |
| User Access | Full Access |

Ad başka bir uygulamada kullanılıyorsa App Store Connect burada uyarır. Benim aramamda App Store'da bu adla bir uygulama çıkmadı, ama kesin cevabı bu ekran verir. Doluysa `Çini Ustası: İznik Blokları` gibi bir varyasyon deneyin.

### Adım 6: Mağaza sayfasını doldurun

**App Information**
- Subtitle: `METINLER.md`'den.
- Category: **Games**, alt kategoriler **Puzzle** ve **Casual**.
- Content Rights: Üçüncü taraf içerik yok.
- Age Rating: Anketteki bütün sorulara "None / No" deyin. Sonuç **4+** çıkar.

**Pricing and Availability:** Ücretsiz (Free), bütün ülkeler.

**App Privacy**
- Privacy Policy URL: `https://SITENIZ/cini-ustasi/gizlilik.html` (2. bölümde siteye yüklenecek).
- Data Collection: **"No, we do not collect data from this app."** Uygulama gerçekten hiçbir veri toplamıyor: reklam, analiz ve sunucu bağlantısı yok.

**Sürüm sayfası (1.0 Prepare for Submission)**
1. Sağ üstteki dil menüsünden diğer dilleri ekleyin: English (U.S.), Portuguese (Brazil), German, French, Japanese, Korean.
2. Her dil için:
   - **iPhone 6.9" Display** ekran görüntüleri: `magaza/ekran-goruntuleri/<dil>/01.png, 02.png, 03.png`.
   - Promotional Text, Description, Keywords: `magaza/METINLER.md`'den.
   - Support URL ve Marketing URL: `https://SITENIZ/cini-ustasi/`
3. **Build:** Yüklediğiniz derlemeyi seçin.
4. **Copyright:** `2026 Adınız ya da şirketiniz`.
5. **App Review Information:**
   - İletişim bilgileriniz.
   - Sign-in required: **No**.
   - Notes: `No account or login is needed. The game works fully offline.`
6. **Version Release:** Onaydan sonra otomatik ya da elle yayın.

### Adım 7: İncelemeye gönderin

**Add for Review → Submit.** İnceleme genelde 1–2 gün sürer. Sonuç e-postayla gelir.

### Ret gelirse en olası sebepler

- **4.2 Asgari işlevsellik:** Apple web teknolojisiyle yapılmış uygulamaları bazen "sadece bir web sitesi" diye reddeder. Buna karşı hazırladıklarımız:
  - Oyun tamamen uygulamanın içinde ve internetsiz çalışıyor.
  - Tarayıcı arayüzü yok.
  - Gerçek iPhone titreşimi kullanıyor.

  Yine ret gelirse Game Center skor tablosu eklemek en güçlü cevap olur.
- **4.3 Benzer uygulamalar:** Blok bulmaca türü kalabalık. Özgün İznik teması, desen ve altın çini sistemi ve uzman seviyesi bizi ayırıyor. Ret notunda bunları vurgulayın.
- **Ad / anahtar kelime:** Başka bir oyunun markası anahtar kelimelerde geçmemeli. `METINLER.md`'dekiler buna uygun.

### Sonraki güncellemeler

1. Oyunu `index.html`'de değiştirin.
2. `app` klasöründe `npm run sync` çalıştırın.
3. Xcode'da Build numarasını artırın (yeni özellikse Version'ı da: 1.1 gibi).
4. **Archive → Upload** ile yükleyin. App Store Connect'te yeni sürüm açıp derlemeyi seçin ve **Bu sürümdeki yenilikler** metnini yazın.

### Reklam ve satın almaları açınca

İkisi kodda kapalı (`adsEnabled`, `iapEnabled`). Açmadan önce şunlar gerekir:
- **Gerçek reklam SDK'sı:** Örneğin AdMob ya da AppLovin MAX'ın Capacitor eklentisi.
- **Satın almalar için StoreKit:** Örneğin RevenueCat eklentisi.
- **Reklam kimliği izni (ATT):** iOS'un izin penceresi.
- **App Privacy cevaplarının ve gizlilik politikasının güncellenmesi.**

Bu bir sonraki aşama.

---

## 2. Bölüm: Sitenizde tanıtım

### Adım 1: `site` klasörünü yükleyin

`site/` klasörünün **içindekileri** sitenizde `/cini-ustasi/` adlı bir klasöre yükleyin. Hosting panelinizin Dosya Yöneticisi ya da FTP ile yükleyebilirsiniz. WordPress kullanıyorsanız genelde `public_html/cini-ustasi/` olur.

Yükledikten sonra şu adresler çalışır:

| Adres | Ne | Nerede kullanılır |
|---|---|---|
| `https://SITENIZ/cini-ustasi/` | Oyunun tanıtım sayfası | App Store'da Support URL ve Marketing URL |
| `https://SITENIZ/cini-ustasi/oyna/` | Tarayıcıda oynanan sürüm | Tanıtım sayfası ve kutudaki "Oyna" düğmesi |
| `https://SITENIZ/cini-ustasi/gizlilik.html` | Gizlilik politikası | App Store'da Privacy Policy URL |

Hepsi düz HTML dosyası. Sunucuda özel bir ayar ya da veritabanı gerekmez.

Hosting'iniz yoksa ücretsiz bir seçenek GitHub Pages: `site` klasörünü bir depoya koyup Pages'i açmak yeterli.

### Adım 2: Boşlukları doldurun

`site/index.html` ve `site/gizlilik.html` içindeki e-posta ve ad yer tutucularını kendi bilgilerinizle değiştirin. App Store destek sayfasında iletişim bilgisi bulunmasını ister.

### Adım 3: Ana sayfanıza tanıtım kutusunu ekleyin

`site/tanitim-bolumu.html` dosyasının tamamını kopyalayıp sitenizde göstermek istediğiniz yere yapıştırın. WordPress'te bunun için **Özel HTML** bloğu kullanılır. Kutu sitenizin renklerinden bağımsız görünür, telefonda tek sütuna iner.

### Adım 4: App Store onayından sonra

1. App Store Connect → App Information'dan uygulamanın **App Store bağlantısını** ve **Apple ID** numarasını alın.
2. **tools.applemarketingtools.com** adresinde uygulamanızı arayın ve Apple'ın resmi **"App Store'dan İndirin"** rozetinin kodunu kopyalayın. Apple'ın kuralları gereği rozet elle çizilmez, bu araçtan alınır.
3. `site/index.html` ve `site/tanitim-bolumu.html` içindeki "Çok yakında App Store'da" kutularını bu rozetle değiştirin.
4. `site/index.html`'de yorum satırındaki `apple-itunes-app` etiketini açıp `app-id` değerini yazın. iPhone'da Safari, sayfanın üstünde "Uygulamayı aç / İndir" çubuğu gösterir.
