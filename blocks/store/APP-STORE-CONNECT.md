# Huzur Blocks — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`blocks`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurblocks`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `blocks/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `blocks/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `blocks/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `blocks/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Büyük kareler ve sakin sahnelerle süresiz blok bulmaca. Seviyeler, Klasik oyun ve her gün yeni bir Günün Oyunu.
```

## 3. Açıklama

```
Huzur Blok Bulmaca, sevilen blok yerleştirme oyununu büyük kareler ve sakin, hareketli sahnelerle sunar. Süre baskısı yok, reklam yok; dilediğiniz hızda düşünün.

NASIL OYNANIR
Alttaki üç parçadan birini sürükleyip 9x9 tahtaya bırakın ya da önce parçaya, sonra tahtaya dokunun. Bir satır, sütun ya da kalın çizgili 3x3 kutu tamamen dolunca temizlenir.

KOLAY KULLANIM
• Sürüklerken parçanın nereye düşeceği soluk olarak görünür
• Temizlenecek satırlar önceden parlar
• Parça parmağınızın üstünde durur, görüşünüzü kapatmaz
• İpucu iyi bir yeri gösterir, "Yenile" üç parçayı değiştirir

ÜÇ OYUN BİÇİMİ
• Seviyeler: hedef puana ulaşın; tahtada duran taşlarla yavaş yavaş zorlaşır
• Klasik: sonsuz oyun, en yüksek puanınızı geçin
• Her gün yeni bir Günün Oyunu

ADİL
Verilen üç parçadan en az biri her zaman tahtaya sığar.

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
blok,bulmaca,küp,kare,yerleştirme,satır,sütun,zeka,mantık,rahatlatıcı,kolay,çevrimdışı
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Yerleştir, doldur, temizle
```

Diğer 6 dilin metinleri: `blocks/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `blocks/docs/index.html` (destek) ve `blocks/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `blocks/docs` klasörünü sürükleyin).

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
Huzur Blocks is an offline single-player block puzzle game with endless levels, a classic endless mode and a daily game. There is no timer. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Drag a piece from the tray onto the board (or tap a piece and then the board). Rules are available via the "How to play" button.
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
- **Fiyatlandırma** → Ücretsiz. **Kategori** → Games → Puzzle.
- Hepsi tamamlanınca **İncelemeye Ekle → İncelemeye Gönder**.
