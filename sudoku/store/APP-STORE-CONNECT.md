# Huzur Sudoku — App Store Connect doldurma rehberi

## 0. Uygulamayı App Store Connect'te oluşturun ve yükleyin

Bu ayrı bir uygulama olduğu için önce yeni bir kayıt gerekir:

1. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`sudoku`** klasörüne girin.
2. Sırasıyla:
   ```
   npm install
   npx eas-cli@latest init
   npm run build:ios
   npm run submit:ios
   ```
   `eas init` bu uygulamayı Expo hesabınızda ayrı bir proje olarak açar. `submit:ios` sırasında
   App Store Connect'te kayıt yoksa EAS sizin için **Huzur Sudoku** kaydını oluşturur
   (paket kimliği: `com.evrenaltindal.huzursudoku`).
3. TestFlight'ta deneyin, sonra aşağıdaki alanları doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `sudoku/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `sudoku/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `sudoku/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-game, 3-notes, 4-hard, 5-win. Diğer diller: `sudoku/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Göz yormayan büyük rakamlar, hareketli sakin sahneler ve her gün yeni bir bulmaca. Kolaydan uzmana sınırsız sudoku.
```

## 3. Açıklama

```
Huzur Sudoku, klasik sayı bulmacasını göz yormayan büyük rakamlar ve sakin, hareketli sahnelerle sunar.

NASIL OYNANIR
Her satıra, her sütuna ve her 3x3 kutuya 1'den 9'a kadar rakamları birer kez yerleştirin.

GÖZ YORMAYAN TASARIM
• Büyük, net rakamlar ve geniş tuşlar
• Seçtiğiniz karenin satırı, sütunu ve kutusu hafifçe vurgulanır
• Aynı rakamlar parlar, hatalı rakamlar kırmızı görünür (ayarlardan kapatılabilir)

DÖRT ZORLUK, SINIRSIZ BULMACA
• Kolay, Orta, Zor ve Uzman
• Her bulmacanın tek bir çözümü vardır; Kolay ve Orta bulmacalar tahmin gerektirmez
• Her gün yeni bir Günün Sudokusu

YARDIMCI ARAÇLAR
• Not alma: aklınızdaki aday rakamları küçük not olarak yazın
• Sınırsız geri alma ve silme
• İpucu: her çözdüğünüz bulmaca yeni bir ipucu kazandırır

KUTLAMA
• Tamamlanan satır, sütun ve kutular parıldar
• Bulmaca bitince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Huzur Sudoku çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
sudoku,bulmaca,sayı,zeka,beyin,mantık,klasik,büyük,kolay,rahatlatıcı,çevrimdışı,günlük
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Büyük rakamlı, sakin sudoku
```

Diğer 6 dilin metinleri: `sudoku/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `sudoku/docs/index.html` (destek) ve `sudoku/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve Mahjong'da yaptığınız gibi yayınlayın
(ör. Netlify Drop'a `sudoku/docs` klasörünü sürükleyin).

- **Destek URL'si:** `https://<isim>.netlify.app/`
- **Gizlilik Politikası URL'si:** `https://<isim>.netlify.app/gizlilik.html`

## 7. Telif hakkı

```
2026 Adınız Soyadınız
```

## 8. Uygulama İnceleme Bilgileri

Ad, soyad, telefon ve e-posta (Mahjong'dakiyle aynı). "Oturum açma gerekli": **işaretlemeyin**.

**Notlar:**
```
Huzur Sudoku is an offline single-player sudoku game with four difficulty levels and a daily
puzzle. No account, sign-in, network connection, in-app purchases or ads. All progress is stored
only on the device. Rules are available via the "How to play" button.
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
- **Fiyatlandırma** → Ücretsiz. **Kategori** → Oyunlar → Bulmaca, ikincil: Oyunlar → Masa Oyunu.
- Hepsi tamamlanınca **İncelemeye Ekle → İncelemeye Gönder**.
