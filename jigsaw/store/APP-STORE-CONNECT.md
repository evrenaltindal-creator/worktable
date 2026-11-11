# Huzur Jigsaw — App Store Connect doldurma rehberi

## 0. Uygulamayı oluşturun ve yükleyin

Bu ayrı bir uygulamadır. Bilgisayarınızda depoyu güncelleyin (`git pull`) ve **`jigsaw`** klasöründe:

```
npm install
npx eas-cli@latest init
npm run build:ios
npm run submit:ios
```

`eas init` bir kez gerekir (Expo'da ayrı proje). `submit:ios` sırasında App Store Connect'te kayıt
yoksa EAS oluşturur (paket kimliği: `com.evrenaltindal.huzurjigsaw`). TestFlight'ta deneyin, sonra aşağıyı doldurun.

---

## 1. Ekran görüntüleri

| App Store Connect'teki cihaz | Klasör |
| --- | --- |
| iPhone 6.9" | `jigsaw/store/screenshots/tr/iphone-6.9/` |
| iPhone Dynamic Island orta boy (6.3") | `jigsaw/store/screenshots/tr/iphone-6.3/` |
| iPad 13" | `jigsaw/store/screenshots/tr/ipad-13/` |

Sıra: 1-home, 2-start, 3-play, 4-win. Diğer diller: `jigsaw/store/screenshots/<dil>/iphone-6.9/`.

## 2. Tanıtım metni

```
12 özgün manzara resmiyle süresiz yapboz. Soluk resim rehberi, kendiliğinden oturan parçalar ve her gün yeni bir yapboz.
```

## 3. Açıklama

```
Huzur Yapboz, gerçek yapboz parçalarını büyük ve rahat bir tahtada, sakin, hareketli sahnelerle sunar. Süre baskısı yok, reklam yok; dilediğiniz hızda tamamlayın.

NASIL OYNANIR
Alttaki parçalardan birini sürükleyip resimdeki yerine bırakın ya da önce parçaya, sonra yerine dokunun. Doğru yere yakın bırakılan parça kendiliğinden oturur.

KOLAY KULLANIM
• Tahtada resmin soluk hali rehber olarak görünür
• Sürüklerken parça parmağınızın üstünde durur, görüşünüzü kapatmaz
• İpucu, seçili parçanın yerini gösterir

12 ÖZGÜN RESİM
Deniz kenarında yel değirmenleri, günbatımında kubbeler, lale tarlası, vadide balonlar, deniz feneri, dağ gölü, çiçekli köprü, yamaçta köy, ay ışığında göl, ayçiçekleri, plaj ve karlı kulübe.

BOL BOL OYUN
• Sınırsız seviye; 9 parçadan 36 parçaya yavaş yavaş
• Her gün yeni bir Günün Yapbozu
• Bitirince konfeti ve 1-3 yıldız

İNTERNET GEREKMEZ
Çevrimdışı çalışır, hiçbir kişisel veri toplamaz ve 7 dilde oynanabilir.
```

## 4. Anahtar kelimeler

```
yapboz,puzzle,parça,resim,manzara,tamamla,zeka,rahatlatıcı,kolay,çevrimdışı,günlük,aile
```

## 5. Alt başlık (Uygulama Bilgileri)

```
Sakin resimli yapbozlar
```

Diğer 6 dilin metinleri: `jigsaw/store/app-store-listing.md`.

## 6. Destek ve gizlilik adresleri

Sayfalar hazır: `jigsaw/docs/index.html` (destek) ve `jigsaw/docs/gizlilik.html` (gizlilik).
İçlerindeki `E-POSTA-ADRESINIZ` yazısını değiştirin ve yayınlayın (ör. Netlify Drop'a `jigsaw/docs` klasörünü sürükleyin).

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
Huzur Jigsaw is an offline single-player jigsaw puzzle game with 12 original illustrated pictures, endless levels and a daily puzzle. There is no timer. No account, sign-in, network connection, in-app purchases or ads. All progress is stored only on the device. Drag a piece from the tray to its place in the picture (or tap a piece and then its place). Rules are available via the "How to play" button.
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
