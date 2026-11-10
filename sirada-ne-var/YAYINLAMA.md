# Sırada Ne Var? yayınlama rehberi

Bu rehber iki işi anlatır: **uygulamayı App Store'a göndermek** (Mac gerekmez)
ve **siteye koymak** (cPanel/FTP). Bir kere ayarladıktan sonra yeni sürüm
göndermek tek tıklamadır.

## Klasör düzeni

```
sirada-ne-var/
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
.github/workflows/sirada-ne-var-ios.yml   App Store / TestFlight otomasyonu (store/istek.txt ile)
```

Uygulama bilgileri:

| | |
|---|---|
| Bundle ID | `com.evrenaltindal.siradanevar` (değiştirmek için: `capacitor.config.json` ve `ios/App/App.xcodeproj/project.pbxproj`; ilk yüklemeden **önce** değiştirilmeli) |
| Sürüm | `package.json` içindeki `version` (şu an 1.0.0) |
| Cihaz | Yalnızca iPhone (iPad'de de iPhone uygulaması olarak çalışır; iPad ekran görüntüsü gerekmez) |
| En düşük iOS | 15.0 |

---

## A. App Store ve TestFlight

Bu depoda daha önce kurulmuş iOS uygulamaları (Ok Kaçış, Çini Ustası) ile
**aynı Apple anahtarları** kullanılır; GitHub'a yeni secret girmen gerekmez:
`ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, `APPLE_TEAM_ID`,
`IOS_DISTRIBUTION_P12`, `IOS_P12_PASSWORD`.

İşler `sirada-ne-var/store/istek.txt` dosyasının ilk satırına yazılıp bu
dala gönderilerek başlatılır (Claude bunu senin için yapar):

| İş | Ne yapar | Nerede |
|---|---|---|
| `status` | Paket kimliği, uygulama kaydı, son derleme, TestFlight grupları | Linux |
| `register` | Paket kimliğini (`com.evrenaltindal.siradanevar`) Apple hesabına kaydeder | Linux |
| `build` | Derler, dağıtım sertifikasıyla imzalar, doğrular ve App Store Connect'e yükler (TestFlight) | Mac (macos-26) |
| `testers` | TestFlight'ta "Ekip" iç test grubunu kurar, App Store Connect kullanıcılarını ekler | Linux |
| `metadata` | 7 dilde mağaza metinleri ve 28 ekran görüntüsü | Linux |

Her derlemede derleme numarası TestFlight'taki son numaradan bir fazla olur.
Yeni sürüm için `package.json` içindeki `version` değerini artır.

### Elle yapılması gereken tek adım: uygulama kaydı

Apple, uygulama kaydının API ile açılmasına izin vermiyor:

1. https://appstoreconnect.apple.com → **Apps** → **+** → **New App**
2. Platform: **iOS**, Name: **Sırada Ne Var?**, Primary Language: **Turkish**,
   Bundle ID: **com.evrenaltindal.siradanevar**, SKU: `sirada-ne-var`,
   User Access: Full Access → **Create**

> İsim başkası tarafından alınmışsa Apple uyarır; o zaman örneğin
> "Sırada Ne Var? Karar Çarkı" gibi bir isim dene ve aynı ismi
> `scripts/store-metadata.py` içindeki `tr` → `name` alanına da yaz.

### TestFlight'tan kendi telefonuna kurmak

1. iPhone'a App Store'dan **TestFlight** uygulamasını kur.
2. `testers` işi seni "Ekip" grubuna ekler; Apple'dan davet e-postası gelir
   (App Store Connect hesabının e-postasına). Ya da TestFlight uygulamasını
   aynı Apple hesabıyla açman yeterli: uygulama listede görünür.
3. **Install** → uygulama telefonunda. Her yeni derleme TestFlight'ta otomatik görünür.

İç test (kendi ekibin) için Apple incelemesi gerekmez; derleme işlendikten
(15-30 dk) hemen sonra kurulabilir.

### App Store'a göndermeden önce (elle)

1. **App Privacy** → "Do you or your third-party partners collect data from this app?" → **No** → Publish
2. **Age Rating** anketini doldur (şiddet, cinsellik vb. hepsi "None").
   "Simulated Gambling" için not: uygulamada para, jeton, bahis ya da ödül
   yok; slot makinesi yalnızca rastgele seçim görünümü. Yine de inceleme
   ekibi bunu kumar benzetimi sayabilir; "None" seçip ret gelirse
   "Infrequent/Mild" olarak güncellemek yeterli olur.
3. **Pricing and Availability** → Free
4. Sürüm sayfasında derlemeyi seç, **App Review Information** doldur → **Submit to App Review**

Gizlilik ve destek adresleri için `store/ayarlar.json` içine `web_url`
(örn. `https://siteniz.com/sirada-ne-var`) yazılıp `metadata` işi çalıştırılır.

---

## B. Siteye koymak (cPanel / FTP)

1. Paketi üret (Claude bunu senin için yapar ya da):
   ```
   cd sirada-ne-var
   SUPPORT_EMAIL=destek@siteniz.com npm run site
   ```
   Çıktı: `dist/sirada-ne-var-site.zip`
2. cPanel → **File Manager** → `public_html` klasörü → **Upload** → zip dosyasını yükle
3. Zip'e sağ tıkla → **Extract** → `public_html/sirada-ne-var/` klasörü oluşur
4. Adres: `https://siteniz.com/sirada-ne-var/`
   - Gizlilik: `https://siteniz.com/sirada-ne-var/privacy.html`
   - Destek: `https://siteniz.com/sirada-ne-var/support.html`
   - Belirli bir dilde açmak için sonuna `#en`, `#ja` vb. ekle.

FTP kullanıyorsan zip'i bilgisayarında açıp `sirada-ne-var` klasörünü
`public_html` içine yüklemen yeterli.

### Mevcut bir sayfanın içine gömmek

Sitendeki herhangi bir sayfaya (HTML düzenleyebildiğin bir yere) şunu ekle:

```html
<iframe src="/sirada-ne-var/" title="Sırada Ne Var?" loading="lazy"
  style="width:100%;height:900px;border:0;border-radius:16px"></iframe>
```

---

## Bilinen sınırlar

- iPhone ana ekranındaki uygulama adı her dilde **Sırada Ne Var?** görünür
  (App Store sayfası ise 7 dilde ayrı isimle görünür). Ana ekran adını
  dile göre değiştirmek sonraki bir sürümde eklenebilir.
- Apple, "rastgele karar çarkı" türünde çok uygulama olduğu için benzer
  uygulamaları zaman zaman 4.3 (spam) maddesiyle reddedebiliyor. Sırada
  Ne Var?'ın slot makinesi, pay sistemi, 7 dili ve çevrimdışı çalışması
  ayırt edici; ret gelirse inceleme notuna bunları yazmak işe yarar.
