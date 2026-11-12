# Huzur Words — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`words`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurwords`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `words/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `words/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `words/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `words/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Büyük harfler, temalı kelime listeleri ve sakin sahnelerle süresiz kelime avı. 7 dilde kelimeler, her gün yeni bir bulmaca.
```

## 3. Açıklama

```
Huzur Kelime Avı, sevilen kelime bulmacasını büyük harfler ve sakin, hareketli sahnelerle sunar. Süre baskısı yok, reklam yok; dilediğiniz hızda arayın.

NASIL OYNANIR
Alttaki listede yazan kelimeler harf tablosunda gizli. Parmağınızı kelimenin ilk harfinden son harfine kaydırın. Bulduğunuz kelime renkli bir şeritle işaretlenir.

GÖZ DOSTU
• Büyük, kalın harfler
• Bulunan her kelime ayrı renkte
• İlk seviyelerde kelimeler yalnız soldan sağa ve yukarıdan aşağı yazılır

TEMALI LİSTELER
Meyveler, hayvanlar, ev, doğa, mutfak, renkler ve hava. Kelimeler oyunun dilinde gelir: Türkçe, İngilizce, Portekizce, Almanca, Fransızca, Japonca ve Korece.

BOL BOL OYUN
• Sınırsız seviye; tablo ve kelime sayısı yavaş yavaş büyür, sonra çapraz ve ters kelimeler gelir
• Her gün yeni bir Günün Bulmacası
• İpucu bir kelimenin ilk harfini gösterir
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır ve hiçbir kişisel veri toplamaz.
```

## 4. Anahtar kelimeler

```
kelime,avı,bulmaca,harf,sözcük,gizli,arama,türkçe,zeka,hafıza,rahatlatıcı,kolay,çevrimdışı
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Büyük harfli sakin kelime avı
```

Diğer 6 dilin metinleri: `words/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `words/docs/index.html` (destek) ve `words/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `words/docs` klasörünü sürükleyin).

- **Destek URL'si:** `https://<isim>.netlify.app/`
- **Gizlilik Politikası URL'si:** `https://<isim>.netlify.app/gizlilik.html`

## 7. Telif hakkı

```
2026 Adınız Soyadınız
```

## 8. Uygulama İnceleme Bilgileri

Ad, soyad, telefon ve e-posta. "Oturum açma gerekli": **işaretlemeyin**.

**Notlar:**
```
Huzur Words is an offline single-player word search game with themed word lists in 7 languages, endless levels and a daily puzzle. There is no timer. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Slide a finger from the first to the last letter of a word to mark it. Rules are available via the "How to play" button.
```

---

## 9. Yaş derecelendirmesi (Age Rating)

"Uygulama Bilgileri" → **Yaş Derecelendirmesi** → Düzenle. Anketteki **her soruya**
"Yok / None" ya da "Hayır / No" cevabını verin:

| Bölüm | Soru | Cevap |
| --- | --- | --- |
| Uygulama içi kontroller | Ebeveyn denetimi, yaş doğrulama | Hayır |
| Yetenekler | Sınırsız web erişimi | Hayır |
| | Kullanıcıların oluşturduğu içerik | Hayır |
| | Mesajlaşma ve sohbet | Hayır |
| | Reklam | Hayır |
| Yetişkin temaları | Küfür / kaba mizah, korku, alkol-tütün-uyuşturucu | Yok |
| Tıbbi / sağlık | Tıbbi bilgi, sağlık ve zindelik konuları | Yok / Hayır |
| Cinsellik / çıplaklık | Tüm sorular | Yok |
| Şiddet | Çizgi film şiddeti, gerçekçi şiddet, silahlar | Yok |
| Şansa dayalı | Kumar simülasyonu, kumar, yarışmalar, ganimet kutuları | Yok / Hayır |

Sonuç **4+** olmalıdır. Kaydet'e basın.

---

---

## 10. Diğerleri

- **Uygulama Gizliliği** → "Veri toplamıyoruz" (Data Not Collected) → Yayınla.
- **Fiyatlandırma** → Ücretsiz. **Kategori** → Games → Word.
- Hepsi tamamlanınca **İncelemeye Ekle → İncelemeye Gönder**.
