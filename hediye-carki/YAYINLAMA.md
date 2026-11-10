# Hediye Çarkı'nı yayınlama rehberi

Bu rehber iki işi anlatır: **uygulamayı App Store'a göndermek** (Mac gerekmez)
ve **siteye koymak** (cPanel/FTP). Bir kere ayarladıktan sonra yeni sürüm
göndermek tek tıklamadır.

## Klasör düzeni

```
hediye-carki/
  web/                Uygulamanın kendisi (siteye de, iPhone uygulamasına da bu girer)
    index.html          Çark + slot makinesi
    privacy.html        Gizlilik politikası (7 dil, App Store bunu istiyor)
    support.html        Destek sayfası (7 dil, App Store bunu istiyor)
    fonts/  icons/      Yazı tipleri (OFL lisanslı) ve ikonlar
  ios/                iPhone projesi (Capacitor 8)
  fastlane/
    metadata/           App Store metinleri, 7 dil (scripts/store-metadata.py üretir)
    screenshots/        App Store ekran görüntüleri, 7 dil x 4 (scripts/screenshots.mjs çeker)
  scripts/            Site paketi, ekran görüntüsü ve metin üreten betikler
.github/workflows/ios-appstore.yml   Derleyip App Store Connect'e gönderen otomasyon
```

Uygulama bilgileri:

| | |
|---|---|
| Bundle ID | `com.evrenaltindal.hediyecarki` (değiştirmek için: `capacitor.config.json` ve `ios/App/App.xcodeproj/project.pbxproj`; ilk yüklemeden **önce** değiştirilmeli) |
| Sürüm | `package.json` içindeki `version` (şu an 1.0.0) |
| Cihaz | Yalnızca iPhone (iPad'de de iPhone uygulaması olarak çalışır; iPad ekran görüntüsü gerekmez) |
| En düşük iOS | 15.0 |

---

## A. App Store (bir kerelik hazırlık, ~20 dakika)

### 1. Uygulama kimliğini kaydet (developer.apple.com)

1. https://developer.apple.com/account → **Certificates, IDs & Profiles** → **Identifiers** → **+**
2. **App IDs** → **App** → Continue
3. Description: `Hediye Carki`, Bundle ID: **Explicit** → `com.evrenaltindal.hediyecarki`
4. Ek özellik (capability) seçme → **Continue** → **Register**

### 2. App Store Connect'te uygulamayı oluştur

1. https://appstoreconnect.apple.com → **Apps** → **+** → **New App**
2. Platform: **iOS**, Name: **Hediye Çarkı**, Primary Language: **Turkish**,
   Bundle ID: az önce kaydettiğin, SKU: `hediye-carki`, User Access: Full Access
3. **Create**

> İsim başkası tarafından alınmışsa Apple uyarır; o zaman örneğin
> "Hediye Çarkı: Karar Ver" gibi bir isim dene ve aynı ismi
> `scripts/store-metadata.py` içindeki `tr` → `name` alanına da yaz.

### 3. App Store Connect API anahtarı oluştur

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys**
2. **+** (Generate API Key) → Name: `GitHub`, Access: **Admin** → Generate
   (Admin gerekli: sertifika ve profil oluşturabilmesi için.)
3. **Download API Key** → `AuthKey_XXXXXXXXXX.p8` dosyası iner. **Bu dosya yalnızca bir kez indirilebilir**, güvenli bir yerde sakla.
4. Sayfadaki **Issuer ID** ve anahtarın **Key ID** değerlerini not al.

### 4. İmza anahtarı oluştur (Windows'ta, 1 dakika)

Uygulamayı imzalamak için kalıcı bir anahtar gerekiyor. Mac olmadan
şöyle oluşturulur:

1. Başlat menüsüne `cmd` yaz, **Komut İstemi**'ni aç.
2. Şunu yapıştırıp Enter'a bas:
   ```
   ssh-keygen -t rsa -b 2048 -m PEM -f %USERPROFILE%\Desktop\hediye_imza_anahtari -q -N ""
   ```
3. Masaüstünde `hediye_imza_anahtari` adında bir dosya oluşur (yanındaki `.pub` dosyası gerekmez).
   Bu dosyayı **Not Defteri** ile aç; `-----BEGIN RSA PRIVATE KEY-----` ile başlar.

> `ssh-keygen` bulunamadı derse: Ayarlar → Uygulamalar → İsteğe bağlı özellikler →
> **OpenSSH İstemcisi**'ni ekle ve tekrar dene.

### 5. GitHub'a gizli bilgileri gir

Depo: https://github.com/evrenaltindal-creator/worktable →
**Settings** → **Secrets and variables** → **Actions**

**Secrets** sekmesi → **New repository secret** (4 tane):

| Ad | Değer |
|---|---|
| `ASC_ISSUER_ID` | 3. adımdaki Issuer ID |
| `ASC_KEY_ID` | 3. adımdaki Key ID |
| `ASC_PRIVATE_KEY` | `.p8` dosyasını Not Defteri ile açıp **tamamını** yapıştır (BEGIN/END satırları dahil) |
| `CERTIFICATE_PRIVATE_KEY` | 4. adımdaki dosyanın **tamamı** |

**Variables** sekmesi → **New repository variable** (2 tane):

| Ad | Değer |
|---|---|
| `WEB_URL` | Uygulamanın sitedeki adresi, örn. `https://siteniz.com/hediye-carki` |
| `APP_COPYRIGHT` | Örn. `2026 Adınız Soyadınız` |

> Depo herkese açık (public) olsa da secrets içeriği kimseye görünmez,
> kayıtlarda da gizlenir. Anahtarları asla bir dosyaya yazıp depoya ekleme.
> İşin bitince masaüstündeki anahtar dosyasını ve `.p8` dosyasını
> güvenli bir yere taşı.

### 6. Derle ve gönder

Otomasyon dosyası (`.github/workflows/ios-appstore.yml`) GitHub'ın **Run
workflow** düğmesinde görünmesi için önce ana dala (main) birleştirilmelidir.

1. GitHub → **Actions** → **iOS - App Store'a yukle** → **Run workflow**
2. İki kutu da işaretli kalsın → **Run workflow**
3. ~15-25 dakika sürer. Yeşil tik = uygulama App Store Connect'e ulaştı.
   Apple'ın işlemesi 10-30 dakika daha sürer (e-posta gelir).

Yeni sürüm göndermek için: `package.json` içindeki `version` değerini
artır (örn. 1.0.1) ve aynı düğmeye bas.

### 7. App Store Connect'te kalan son adımlar (elle)

Otomasyon metinleri, ekran görüntülerini ve uygulamayı yükler; bunları
Apple yalnızca elle kabul ediyor:

1. **App Privacy** → Get Started → "Do you or your third-party partners collect data from this app?" → **No, we do not collect data from this app** → Publish
2. **App Information** → **Age Rating** → anketi doldur (şiddet, cinsellik vb. hepsi "None").
   "Simulated Gambling" sorusu için not: uygulamada para, jeton, bahis
   ya da ödül yok; slot makinesi sadece rastgele seçim görünümü.
   Yine de inceleme ekibi bunu kumar benzetimi sayabilir. "None" seçip
   ret gelirse "Infrequent/Mild" olarak güncellemek yeterli olur.
3. **Pricing and Availability** → Price: **Free (0)**, ülkeleri seç
4. Sürüm sayfası (1.0 Prepare for Submission):
   - **Build** bölümünde **+** ile yüklenen derlemeyi seç
   - **App Review Information**: ad, telefon, e-posta (Apple'ın sana ulaşması için, mağazada görünmez); "Sign-in required" işaretleme
5. **Add for Review** → **Submit to App Review**

İnceleme genelde 1-3 gün sürer.

---

## B. Siteye koymak (cPanel / FTP)

1. Paketi üret (Claude bunu senin için yapar ya da):
   ```
   cd hediye-carki
   SUPPORT_EMAIL=destek@siteniz.com npm run site
   ```
   Çıktı: `dist/hediye-carki-site.zip`
2. cPanel → **File Manager** → `public_html` klasörü → **Upload** → zip dosyasını yükle
3. Zip'e sağ tıkla → **Extract** → `public_html/hediye-carki/` klasörü oluşur
4. Adres: `https://siteniz.com/hediye-carki/`
   - Gizlilik: `https://siteniz.com/hediye-carki/privacy.html`
   - Destek: `https://siteniz.com/hediye-carki/support.html`
   - Belirli bir dilde açmak için sonuna `#en`, `#ja` vb. ekle.

FTP kullanıyorsan zip'i bilgisayarında açıp `hediye-carki` klasörünü
`public_html` içine yüklemen yeterli.

### Mevcut bir sayfanın içine gömmek

Sitendeki herhangi bir sayfaya (HTML düzenleyebildiğin bir yere) şunu ekle:

```html
<iframe src="/hediye-carki/" title="Hediye Çarkı" loading="lazy"
  style="width:100%;height:900px;border:0;border-radius:16px"></iframe>
```

---

## Bilinen sınırlar

- iPhone ana ekranındaki uygulama adı her dilde **Hediye Çarkı** görünür
  (App Store sayfası ise 7 dilde ayrı isimle görünür). Ana ekran adını
  dile göre değiştirmek sonraki bir sürümde eklenebilir.
- Apple, "rastgele karar çarkı" türünde çok uygulama olduğu için benzer
  uygulamaları zaman zaman 4.3 (spam) maddesiyle reddedebiliyor. Hediye
  Çarkı'nın slot makinesi, pay sistemi, 7 dili ve çevrimdışı çalışması
  ayırt edici; ret gelirse inceleme notuna bunları yazmak işe yarar.
- Otomasyon bu ortamda gerçek bir Mac'te çalıştırılamadı; ilk çalıştırmada
  bir hata çıkarsa Actions sayfasındaki kaydı Claude'a göster.
