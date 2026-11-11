# Huzur Bubbles — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`bubbles`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurbubbles`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `bubbles/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `bubbles/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `bubbles/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `bubbles/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
Büyük, sembollü balonlar ve sakin sahnelerle rahatlatıcı balon patlatma. Sınırsız seviye ve her gün yeni bir oyun.
```

## 3. Açıklama

```
Huzur Balon Patlatma, sevilen balon oyununu büyük balonlar ve sakin, hareketli sahnelerle sunar. Acele yok, reklam yok; sadece nişan alın ve patlatın.

NASIL OYNANIR
Parmağınızı tahtada gezdirerek nişan alın; noktalı çizgi balonun nereye gideceğini gösterir. Bırakınca balon fırlar ve duvarlardan seker. Aynı renkten en az 3 balon bir araya gelince patlar, askıda kalanlar da düşer.

GÖZ DOSTU
• Büyük, parlak balonlar
• Her rengin kendi sembolü var: kalp, yıldız, yaprak, güneş, elmas, çiçek
• Renkleri ayırt etmekte zorlananlar için de kolay

KOLAY KULLANIM
• Nişan çizgisi seken atışları da gösterir
• "Değiştir" ile sıradaki balonu seçin
• Gökkuşağı balonu her renge uyar; her kazandığınız seviye 1 tane kazandırır

BOL BOL OYUN
• Sınırsız seviye; renkler ve satırlar yavaş yavaş artar
• Her gün yeni bir Günün Oyunu
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
balon,patlatma,renk,eşleştirme,nişan,bulmaca,klasik,rahatlatıcı,kolay,çevrimdışı,günlük,zeka
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Nişan al, eşleştir, patlat
```

Diğer 6 dilin metinleri: `bubbles/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `bubbles/docs/index.html` (destek) ve `bubbles/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `bubbles/docs` klasörünü sürükleyin).

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
Huzur Bubbles is an offline single-player bubble popping game with endless levels and a daily game. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Drag a finger over the board to aim and lift it to shoot. Rules are available via the "How to play" button.
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
