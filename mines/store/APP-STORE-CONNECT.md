# Huzur Mines — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`mines`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurmines`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `mines/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `mines/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `mines/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `mines/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
İlk dokunuş her zaman güvenli, her tahta sadece mantıkla çözülür. Büyük kareler, sakin sahneler, her gün yeni bir oyun.
```

## 3. Açıklama

```
Huzur Mayın Tarlası, klasik mantık oyununu büyük kareler ve sakin, hareketli sahnelerle sunar. Şansa yer yok: her tahta sadece mantıkla çözülebilir.

NASIL OYNANIR
Mayın olmayan tüm kareleri açın. Her sayı, çevresindeki 8 karede kaç mayın olduğunu gösterir. Mayın olduğundan emin olduğunuz karelere bayrak koyun.

ADİL VE SAKİN
• İlk dokunuş her zaman güvenlidir
• Her tahta tahmin gerektirmeden çözülebilir
• Süre baskısı yok

KOLAY KULLANIM
• Büyük, rahat dokunulan kareler
• Bayrak düğmesi ya da basılı tutarak bayrak
• Bayrakları tamam olan sayıya dokununca çevresi açılır
• İpucu: güvenli bir kareyi gösterir; her kazandığınız oyun yeni ipucu kazandırır

BOL BOL OYUN
• Kolay, Orta ve Zor; her birinde sınırsız oyun
• Her gün yeni bir Günün Oyunu
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
mayın,tarlası,bulmaca,mantık,zeka,klasik,beyin,büyük,kolay,rahatlatıcı,çevrimdışı,günlük
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Tahminsiz, sakin mayın tarlası
```

Diğer 6 dilin metinleri: `mines/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `mines/docs/index.html` (destek) ve `mines/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `mines/docs` klasörünü sürükleyin).

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
Huzur Mines is an offline single-player minesweeper game with three difficulty levels and a daily game. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Rules are available via the "How to play" button.
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
