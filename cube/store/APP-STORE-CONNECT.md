# Huzur Mahjong Cube — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`cube`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurcube`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `cube/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `cube/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `cube/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `cube/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Büyük, sembollü küplerle süresiz 3B mahjong. Kuleyi döndürün, açık küpleri eşleştirin; her seviyenin bir çözümü var.
```

## 3. Açıklama

```
Huzur Mahjong Küp, sevilen taş eşleştirme oyununu üç boyuta taşır: küplerden bir kule, büyük ve net semboller, sakin, hareketli sahneler. Süre baskısı yok, reklam yok.

NASIL OYNANIR
Aynı sembollü iki açık küpe dokunun; ikisi birlikte kalkar. Bir küp açıktır: üstünde küp yoksa ve dört yanından en az biri boşsa. Kapalı küpler biraz koyu görünür.

KULEYİ DÖNDÜRÜN
"Döndür" düğmesiyle kuleyi çeyrek tur çevirip arkada kalan küpleri görün.

GÖZ DOSTU
• Büyük küpler, her yüzünde aynı sembol
• Her sembolün kendi rengi ve biçimi var: kalp, yıldız, yaprak, güneş, ay, damla, çiçek, elmas, çan, balık, bulut, taç

HER SEVİYENİN ÇÖZÜMÜ VAR
Seviyeler çözümü baştan bilinerek kurulur. Eşleşme kalmazsa semboller kendiliğinden karışır.

BOL BOL OYUN
• Sınırsız seviye; kule yavaş yavaş büyür
• Her gün yeni bir Günün Oyunu
• İpucu eşleşebilecek iki küpü gösterir
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
mahjong,küp,3b,eşleştirme,taş,bulmaca,kule,sembol,zeka,rahatlatıcı,kolay,çevrimdışı,günlük
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Döndürülebilir 3B eşleştirme
```

Diğer 6 dilin metinleri: `cube/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `cube/docs/index.html` (destek) ve `cube/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `cube/docs` klasörünü sürükleyin).

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
Huzur Mahjong Cube is an offline single-player 3D tile matching puzzle with endless levels and a daily game. There is no timer. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Tap two open cubes with the same symbol to remove them; the Turn button rotates the view. Rules are available via the "How to play" button.
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
