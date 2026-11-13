# Devir notu: Huzur oyunları App Store yayını

Bu dosya, işi devralan asistan (Codex, Claude Code vb.) içindir. Kullanıcı (Evren) teknik adımları
kendisi yapmak istemiyor: komutları **sen çalıştır**, kullanıcıdan yalnız Apple/Expo şifresi ve telefon
doğrulama kodu girmesini iste (bunları kendi ekranına yazar; sohbete yazdırma).

## Proje

- Depo: `https://github.com/evrenaltindal-creator/worktable`, dal `claude/quirky-ramanujan-0r10dk`
- Kullanıcının bilgisayarında: `C:\Users\evren\Documents\huzur` (Windows, PowerShell)
- 10 ayrı Expo (SDK 58, React Native) iOS uygulaması, her biri kendi klasöründe ve ayrı App Store uygulaması:

| Klasör | App Store adı (TR) | Paket kimliği |
| --- | --- | --- |
| `sudoku` | Huzur Sudoku | com.evrenaltindal.huzursudoku |
| `mines` | Huzur Mayın Tarlası | com.evrenaltindal.huzurmines |
| `bubbles` | Huzur Balon Patlatma | com.evrenaltindal.huzurbubbles |
| `jewels` | Huzur Mücevher | com.evrenaltindal.huzurjewels |
| `blocks` | Huzur Blok Bulmaca | com.evrenaltindal.huzurblocks |
| `colorpop` | Huzur Renk Patlatma | com.evrenaltindal.huzurcolorpop |
| `jigsaw` | Huzur Yapboz | com.evrenaltindal.huzurjigsaw |
| `words` | Huzur Kelime Avı | com.evrenaltindal.huzurwords |
| `cube` | Huzur Mahjong Küp | com.evrenaltindal.huzurcube |
| `mahjong` | Huzur Mahjong | com.evrenaltindal.huzurmahjong |

Depo kökündeki `src/`, `public/`, `AI-Ofis-*.bat`, `PROJE-GECMISI.md` başka bir projeye ait; dokunma.

## Yapılmış olanlar

- 10 oyun tamamen yazıldı ve test edildi: her klasörde `npm run check:game` (oyun motoru testleri),
  `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor` temiz. Web sürümlerinde her oyun baştan sona
  oynanıp kazanıldı.
- Tüm görseller, sesler ve metinler özgün (betiklerle üretildi: her klasörde `scripts/generate-art.cjs`).
  7 dil: tr, en, pt, de, fr, ja, ko.
- Mağaza materyali her klasörde:
  - `store.config.json`: EAS Metadata dosyası (7 dilde ad, alt başlık, tanıtım, açıklama, anahtar kelimeler;
    kategoriler; 4+ yaş derecelendirmesi; telif `2026 EVREN ALTINDAL`). Üreten: `python3 shared/store_config.py`.
  - `store/listing.json` (kaynak metin), `store/APP-STORE-CONNECT.md` (elle doldurma rehberi),
    `store/screenshots/<dil>/<cihaz>/*.jpg` (iphone-6.9 1320x2868, iphone-6.3 1206x2622, ipad-13 2064x2752;
    tr ve en üç cihazda, diğer diller yalnız iphone-6.9).
  - `docs/index.html` (destek), `docs/gizlilik.html` (gizlilik). İçlerinde `E-POSTA-ADRESINIZ` yer tutucusu var.
- Yükleme betiği: `shared/yukle.ps1` (argümansız: 10 oyunu sırayla; argümanla tek oyun). Her oyunda
  `npm install` → gerekirse `eas init` → `eas build --platform ios --profile production --auto-submit --no-wait`
  → `eas metadata:push`. Biten oyunları `shared/yuklenenler.txt` dosyasına yazar ve tekrar çalıştırınca atlar.
- `eas.json`: `appVersionSource: remote`, production `autoIncrement: true`.

## Şu anki durum (kullanıcının son çıktılarına göre)

- Expo hesabı: `evrenaltindal`. Apple takımı: `EVREN ALTINDAL (672BCLF8GR)`, bireysel hesap.
- Dağıtım sertifikası: seri `244E39C959E73002FD8D65ADD6F28B1E` (Expo sunucusunda). Tüm oyunlar bunu
  **yeniden kullanmalı** ("Reuse this distribution certificate?" → evet). **Hiçbir sertifikayı iptal etme**;
  Apple sınırı dolu, iptal gerekirse önce kullanıcıya sor.
- Sudoku: derlendi (Build 1) ve App Store Connect'e gönderildi. Bir App Store Connect API anahtarı
  oluşturuldu (Expo sunucusunda, EAS Submit için).
- mines, bubbles, jewels, blocks (ve büyük ihtimalle colorpop, jigsaw, words): derleme sıraya alındı.
  Durumları doğrulanmadı.
- cube: Apple girişinde yanlış Apple ID yazıldığı için hata verdi; yeniden çalıştırılmalı.
- mahjong: henüz yapılmadı. App Store Connect'te zaten var (eski Build 1 8 oyun modunu içermiyor).
  `eas init` var olan `huzur-mahjong` Expo projesine bağlanmalı; yeni build otomatik Build 2 olur.
- `metadata:push` her oyunda çalıştı mı bilinmiyor; Sudoku için elle çalıştırılmadıysa çalıştırılmalı.

## Yapılacaklar (sırayla)

1. `cd C:\Users\evren\Documents\huzur` ve `git pull`.
2. Durumu kontrol et:
   `type shared\yuklenenler.txt` ve `npx eas-cli@latest build:list --platform ios --limit 15 --non-interactive`.
   Hata vermiş (`errored`) derlemelerin günlüğünü oku ve nedenini düzelt.
3. Eksik oyunları yükle: `powershell -ExecutionPolicy Bypass -File shared\yukle.ps1`.
   Apple ID sorulursa tam olarak `evrenaltindal@gmail.com`; şifre ve kodu kullanıcı yazar.
   Yanlış denemelerden kaçın (Apple hesabı kilitleyebilir).
4. Her oyunun klasöründe `npx eas-cli@latest metadata:push` başarılı olsun (Sudoku dahil). Hata olursa
   `store.config.json` doğrulamasına bak; şema: https://docs.expo.dev/eas/metadata/schema/
5. Derlemeler App Store Connect'e ulaştı mı kontrol et (`eas submit` durumları: expo.dev → proje → Submissions).
6. Ekran görüntüleri: EAS Metadata ekran görüntüsü yüklemez. Ya kullanıcıya App Store Connect'te
   sürükle-bırak yaptır (`<klasör>\store\screenshots\`), ya da kullanıcının oluşturacağı bir App Store Connect
   API anahtarı (.p8) ile `fastlane deliver` kullan. Anahtar dosyasını depoya koyma.
7. Destek ve gizlilik sayfaları: her oyunun `docs/` klasöründe `E-POSTA-ADRESINIZ` yerine kullanıcının
   e-postasını yaz (kullanıcıya sor), sayfaları herkese açık bir yerde yayınla (ör. Netlify, kullanıcının hesabıyla)
   ve adresleri App Store Connect'te Destek URL'si ve Gizlilik Politikası URL'si olarak gir.
8. App Store Connect'te her uygulama için: App Privacy = "Data Not Collected", fiyat = ücretsiz,
   build'i seç, inceleme notu için `store/listing.json` içindeki `reviewNotes` metnini kullan, İncelemeye Gönder.
   Mahjong'da yeni build'i seç (eski Build 1'i değil).

## Kurallar

- Şifre, doğrulama kodu, API anahtarı gibi gizli bilgileri depoya yazma, sohbete yazdırma.
- Sertifika iptali, uygulama silme, fiyat değiştirme gibi geri alınamaz işlemlerden önce kullanıcıya sor.
- Oyun kodunu yalnız derleme hatası gerektirirse değiştir; değiştirirsen o klasörde testleri çalıştır,
  commit edip aynı dala gönder.
- Kullanıcıya Türkçe, kısa ve teknik olmayan dille durum bildir.
