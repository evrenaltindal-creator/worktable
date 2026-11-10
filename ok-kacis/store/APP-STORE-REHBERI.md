# Ok Kaçış'ı App Store'a yükleme rehberi (Mac gerekmez)

Derleme, imzalama, yükleme, 7 dilde mağaza sayfası ve incelemeye gönderme
GitHub Actions'ta otomatik yapılır (`.github/workflows/ok-kacis-ios.yml`).
Gereken Apple anahtarları ve dağıtım sertifikası bu depoda zaten GitHub
secret'ı olarak kayıtlı (Çini Ustası için eklenmişti), Ok Kaçış da onları kullanır.

Uygulamanın paket kimliği (Bundle ID): **`com.evrenaltindal.okkacis`**

## İşler nasıl başlatılır

`ok-kacis/store/istek.txt` dosyasının **ilk satırına** iş adını yazıp
`claude/festive-wright-wotpi5` dalına göndermek yeterli. Claude bunu senin için
yapar; sen de GitHub'da dosyayı düzenleyip kaydederek başlatabilirsin.

| İş | Ne yapar |
| --- | --- |
| `status` | Paket kimliği, uygulama kaydı, sürüm ve son derleme numarasını yazar |
| `register` | Paket kimliğini Apple hesabına kaydeder |
| `build` | Derler (Xcode 26), dağıtım sertifikasıyla imzalar, App Store Connect'e yükler |
| `metadata` | 7 dilde ad, alt başlık, açıklama, anahtar kelimeler, 28 tanıtım görseli, kategori |
| `submit` | İncelemeye gönderir; onaylanınca uygulama **kendiliğinden yayınlanır** |

Sonuçlar: GitHub > **Actions** > **Ok Kacis iOS**.

## Senin yapman gerekenler (yalnızca App Store Connect web sitesinde yapılabiliyor)

Apple bu adımları API'ye açmıyor; her biri birkaç dakika.

### 1. Uygulama kaydını oluştur (`register` işinden sonra)

https://appstoreconnect.apple.com > **Apps** > **+** > **New App**

- Platform: **iOS**
- Name: `Ok Kaçış: Ok Bulmacası` (alınmışsa `Ok Kaçış: Arrow Puzzle`)
- Primary Language: **Turkish**
- Bundle ID: listeden **com.evrenaltindal.okkacis**
- SKU: `okkacis-ios` · User Access: **Full Access** > **Create**

### 2. Fiyat: **Pricing and Availability** > **Free**, bütün ülkeler

### 3. Yaş derecesi: **App Information** > **Age Rating**

Anketi doğru yanıtla (şiddet, kumar vb. hepsine **None**). Reklam sorusu
gelirse **Evet**: uygulamada Google reklamları var.

### 4. Gizlilik: **App Privacy**

- Privacy Policy URL: sitendeki gizlilik sayfası (ör. `https://siten.com/ok-kacis/gizlilik.html`, bkz. `ok-kacis/SITEYE-YUKLE.md`)
- "Veri topluyor musunuz?" > **Evet** (oyunun kendisi toplamıyor, Google reklam SDK'sı topluyor)
- Google'ın güncel listesine göre işaretle: https://developers.google.com/admob/ios/privacy/data-disclosure
  Genelde: **Identifiers > Device ID**, **Usage Data > Product Interaction, Advertising Data**,
  **Diagnostics**, **Location > Coarse Location**; amaç **Third-Party Advertising** ve **Analytics**;
  izleme (tracking) için **Evet**.

### 5. Claude'a iki bilgi ver

- Sitenin adresi: gizlilik ve destek bağlantıları için (`store/ayarlar.json` > `site_url`)
- Telif satırı: ör. `2026 Adın Soyadın` (`store/ayarlar.json` > `copyright`)

App Review iletişim bilgileri (ad, telefon, e-posta) `REVIEW_FIRST_NAME`,
`REVIEW_LAST_NAME`, `REVIEW_PHONE`, `REVIEW_EMAIL` secret'ları varsa otomatik
girilir; yoksa sürüm sayfasında **App Review Information** bölümüne elle yaz.

## Gerçek reklamlar

Şu an uygulamada Google'ın **test** reklamları var; para kazandırmazlar ve
incelemeye bu hâliyle de gönderilebilir. Para kazanmak için:

1. https://admob.google.com > **Apps** > **Add app** > iOS
2. Uygulamaya 3 reklam birimi ekle: **Banner**, **Interstitial**, **Rewarded**
3. Uygulama kimliğini (`~` işaretli) ve 3 birim kimliğini Claude'a yaz (gizli değiller).
   Claude `www/config.js` ve `ios/App/App/Info.plist` dosyalarına yazıp `build` işini yeniden çalıştırır.
4. AdMob > **Blocking controls** > **Content rating**: **G** ya da **PG** seç.
5. Uygulama yayınlanınca AdMob'da App Store sayfasına bağla ve sitene `app-ads.txt` koy.

## Reddedilirse

- **4.3 (benzer uygulamalar):** Ok bulmacaları kalabalık bir tür. İnceleme notu
  oyunun kendine ait yanlarını (zamana karşı, kombo, sonsuz seviye, 7 dil) anlatır.
- **2.1 (çökme/eksik):** TestFlight'ta kendi iPhone'unda bir tur oyna.

Apple'ın mesajını Claude'a ilet; düzeltip yeniden göndeririz.

## Sonraki sürümler

`store/ayarlar.json` > `version` değerini artır (ör. `1.1`), App Store
Connect'te aynı numarayla yeni sürüm aç, sonra `build`, `metadata`, `submit`.
