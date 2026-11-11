# App Store Connect — doldurma rehberi

App Store Connect → Uygulamalar → **Huzur Mahjong** → sol menüde **1.0 Hazırlanıyor**.
Aşağıdaki her kutudaki metni olduğu gibi kopyalayıp ilgili alana yapıştırın.

---

## 1. Ekran görüntüleri

"Önizlemeler ve Ekran Görüntüleri" bölümünde cihaz sekmesini seçip klasördeki dosyaları
**numara sırasıyla** sürükleyip bırakın (ilk 3 görüntü aramalarda görünür):

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" (en büyük iPhone) | `store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-games, 3-classic-hint, 4-triple, 5-connect, 6-peaks, 7-dawn, 8-sea, 9-levels.
İngilizce sayfa için aynı yapı `store/screenshots/en/` içinde.

---

## 2. Tanıtım metni (Promotional Text)

```
8 oyun bir arada: Klasik, Üçlü Toplama, Bağlantı, Hafıza, Zirve ve daha fazlası. Büyük taşlar, hareketli sahneler, sakin bir mola.
```

## 3. Açıklama (Description)

```
Huzur Mahjong, klasik taş eşleştirme oyununu sakin ve göz yormayan bir tasarımla sunar.

AYNI İKİ TAŞI BULUN
Üstü ve bir yanı açık olan iki aynı taşa dokunun, ikisi birden kalkar. Bütün taşları
kaldırdığınızda seviye tamamlanır.

GÖZ YORMAYAN TASARIM
• Büyük ve net taşlar — küçük ekranlarda bile rahatça okunur
• Seçilebilir taşlar parlak, kapalı taşlar soluk görünür
• Büyük düğmeler, büyük yazılar

CANLI SAHNELER
• Lale bahçesi, Boğaz'da gün batımı, Kapadokya balonları ve Ege kıyısı
• Taşlar eşleşince parıltıyla patlar, hızlı eşleşmeler kombo yapar
• Her seviyede 3 yıldız topla, konfetiyle kutla

ACELE YOK
• Süre baskısı yok
• İpucu, karıştırma ve geri alma hakları; yeni seviyeler bitirdikçe artar
• Her seviye çözülebilir olarak hazırlanır

BOL BOL OYUN
• 8 farklı oyun: Klasik, Zamana Karşı, Günün Bulmacası, Toplam 10, Üçlü Toplama, Bağlantı, Hafıza ve Zirve
• 200 seviye, 16 farklı dizilim: kalp, ev, kelebek, kale, piramit ve daha fazlası
• Oyun otomatik kaydedilir, kaldığınız yerden devam edersiniz

İNTERNET GEREKMEZ
Huzur Mahjong çevrimdışı çalışır ve hiçbir kişisel veri toplamaz.
```

## 4. Anahtar kelimeler (Keywords)

```
mahjong,taş,eşleştirme,bulmaca,solitaire,zeka,beyin,klasik,büyük,kolay,rahatlatıcı,çevrimdışı
```

## 5. Alt başlık (Subtitle) — "Uygulama Bilgileri" sayfasında

```
Büyük taşlı, sakin eşleştirme
```

## 6. Destek URL'si ve Gizlilik Politikası URL'si

Bu iki adres herkesin açabileceği bir web sayfası olmalıdır. Sayfalar hazır:
`docs/index.html` (destek) ve `docs/gizlilik.html` (gizlilik politikası).

1. İki dosyadaki `E-POSTA-ADRESINIZ` yazısını kendi e-posta adresinizle değiştirin
   (veya adresinizi Claude'a yazın, o yerleştirsin).
2. En kolay ücretsiz yayın yolu: <https://app.netlify.com/drop> adresine gidin, ücretsiz
   hesap açın (Google ile giriş olur) ve `docs` klasörünü sayfaya sürükleyip bırakın.
   Size `https://<isim>.netlify.app` gibi bir adres verir. Site ayarlarından ismi
   `huzur-mahjong` gibi değiştirebilirsiniz.
3. App Store Connect'e girin:
   - **Destek URL'si:** `https://<isim>.netlify.app/`
   - **Gizlilik Politikası URL'si** ("Uygulama Gizliliği" sayfasında):
     `https://<isim>.netlify.app/gizlilik.html`
   - **Pazarlama URL'si:** boş bırakılabilir.

---

## 7. Telif hakkı (Copyright)

```
2026 Adınız Soyadınız
```
(Şirket adına yayınlıyorsanız şirket adını yazın.)

---

## 8. Uygulama İnceleme Bilgileri (App Review Information) — iletişim bilgileri

| Alan | Ne yazılacak |
| --- | --- |
| Ad / Soyad | Kendi adınız ve soyadınız |
| Telefon numarası | Ülke koduyla, örn. `+90 5xx xxx xx xx` |
| E-posta | Apple'ın size ulaşacağı e-posta |
| Oturum açma gerekli | **İşaretlemeyin** (oyunda hesap yok) |

**Notlar** kutusu:

```
Huzur Mahjong is an offline single-player tile game with 8 modes. No account, sign-in,
network connection, in-app purchases or ads. All progress is stored only on the device.
Start from the home screen: "Play" opens the classic game, "All games" lists all 8 modes.
Rules are available via the "How to play" / "?" buttons.
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

## 10. Diğerleri (henüz yapılmadıysa)

- **Uygulama Gizliliği** → "Veri toplamıyoruz" (Data Not Collected) → Yayınla.
- **Fiyatlandırma ve Kullanılabilirlik** → Ücretsiz, tüm ülkeler.
- **Kategori** (Uygulama Bilgileri) → Birincil: Oyunlar → Bulmaca, İkincil: Oyunlar → Masa Oyunu.
- **Yapı (Build):** 8 oyunlu yeni sürümü yükledikten sonra Build 1 yerine yeni yapıyı seçin.

Hepsi tamamlanınca sağ üstteki **İncelemeye Ekle → İncelemeye Gönder**.
