# Huzur Color Pop — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`colorpop`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurcolorpop`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `colorpop/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `colorpop/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `colorpop/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `colorpop/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Büyük, sembollü karolar ve sakin sahnelerle süresiz renk patlatma. Her seviye kazanılabilir; her gün yeni bir oyun.
```

## 3. Açıklama

```
Huzur Renk Patlatma, sevilen renk temizleme oyununu büyük karolar ve sakin, hareketli sahnelerle sunar. Süre baskısı yok, reklam yok; dilediğiniz hızda düşünün.

NASIL OYNANIR
Aynı renkte yan yana en az 2 karoya dokunun; hepsi birlikte patlar. Üstteki karolar düşer, boşalan sütunlar ortada birleşir. Patlatılacak grup kalmayınca seviye biter: hedef sayısından fazla karo bırakmayın.

GÖZ DOSTU
• Büyük karolar
• Her rengin kendi sembolü var: kalp, damla, yaprak, güneş, ay
• Renkleri ayırt etmekte zorlananlar için de kolay

HER SEVİYE KAZANILABİLİR
Her seviyenin hedefi, yerleşik bir çözücünün bulduğu sonuca göre konur.

YARDIM HER ZAMAN YAKIN
• Geri al: son hamleyi geri alır
• İpucu: iyi bir grubu gösterir
• Çekiç: tek bir karoyu kaldırır

BOL BOL OYUN
• Sınırsız seviye; renkler yavaş yavaş artar
• Her gün yeni bir Günün Oyunu
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
renk,patlatma,karo,blok,eşleştirme,bulmaca,temizle,zeka,rahatlatıcı,kolay,çevrimdışı,günlük
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Dokun, aynı renkleri patlat
```

Diğer 6 dilin metinleri: `colorpop/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `colorpop/docs/index.html` (destek) ve `colorpop/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `colorpop/docs` klasörünü sürükleyin).

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
Huzur Color Pop is an offline single-player tile popping puzzle with endless levels and a daily game. There is no timer. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Tap a group of two or more touching tiles of the same colour to pop it. Rules are available via the "How to play" button.
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
