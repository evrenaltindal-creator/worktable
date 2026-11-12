# Huzur oyunları: App Store yükleme listesi

Her oyun **ayrı bir uygulamadır**. Birini bitirip sonrakine geçin; sıra önemli değil.

## Bir kez yapılacaklar

```powershell
cd $HOME\Documents
git clone -b claude/quirky-ramanujan-0r10dk https://github.com/evrenaltindal-creator/worktable.git huzur
cd huzur
```

Daha sonra kodda güncelleme olursa: `cd $HOME\Documents\huzur` ve `git pull`.

## Hepsini sırayla derleyip göndermek

```powershell
powershell -ExecutionPolicy Bypass -File shared\yukle.ps1
```

Betik 10 oyunu sırayla Expo'da derlemeye alır ve her biri bitince App Store Connect'e kendisi gönderir.
Yarıda kalırsa aynı komutu yeniden çalıştırın: biten oyunlar (`shared\yuklenenler.txt`) atlanır.
Tek bir oyun için sonuna adını yazın, örneğin `shared\yukle.ps1 sudoku`.

## Her oyun için App Store Connect'te

1. Build TestFlight'ta görünene kadar bekleyin (derleme + Apple işlemesi, yaklaşık 30-60 dakika).
2. Metinler kendiliğinden yüklenir: betik her oyunda `store.config.json` dosyasını (7 dilde ad, alt başlık,
   tanıtım, açıklama, anahtar kelimeler; kategoriler; 4+ yaş derecelendirmesi; telif) App Store Connect'e gönderir.
   Tek bir oyun için elle: o oyunun klasöründe `npx eas-cli@latest metadata:push`.
   Elle kalanlar (`<klasör>\store\APP-STORE-CONNECT.md`): App Privacy ("Data Not Collected"), Destek URL'si,
   Gizlilik Politikası URL'si, iletişim bilgileri.
3. Ekran görüntülerini `<klasör>\store\screenshots\<dil>\` klasörlerinden yükleyin
   (iPhone 6.9", iPhone 6.3", iPad 13").
4. Build'i seçip **İncelemeye Gönder**.

## Liste

| ✓ | Klasör | App Store adı (TR) | Paket kimliği |
| --- | --- | --- | --- |
| ☐ | `sudoku` | Huzur Sudoku | com.evrenaltindal.huzursudoku |
| ☐ | `mines` | Huzur Mayın Tarlası | com.evrenaltindal.huzurmines |
| ☐ | `bubbles` | Huzur Balon Patlatma | com.evrenaltindal.huzurbubbles |
| ☐ | `jewels` | Huzur Mücevher | com.evrenaltindal.huzurjewels |
| ☐ | `blocks` | Huzur Blok Bulmaca | com.evrenaltindal.huzurblocks |
| ☐ | `colorpop` | Huzur Renk Patlatma | com.evrenaltindal.huzurcolorpop |
| ☐ | `jigsaw` | Huzur Yapboz | com.evrenaltindal.huzurjigsaw |
| ☐ | `words` | Huzur Kelime Avı | com.evrenaltindal.huzurwords |
| ☐ | `cube` | Huzur Mahjong Küp | com.evrenaltindal.huzurcube |
| ☐ | `mahjong` | Huzur Mahjong | com.evrenaltindal.huzurmahjong |

**Mahjong:** App Store Connect'te zaten var. Betik "var olan huzur-mahjong projesine bağlansın mı?" diye sorarsa **Y** deyin.
Yeni build 8 oyun modunu içerir; incelemeye eski Build 1'i değil bu yeni build'i seçin.

**Destek ve gizlilik sayfaları:** her klasörün `docs\` bölümünde. Yayınlamadan önce içlerindeki
`E-POSTA-ADRESINIZ` yazısını kendi e-postanızla değiştirin; sonra klasörü örneğin Netlify Drop'a sürükleyip
çıkan adresi Destek URL'si ve Gizlilik Politikası URL'si olarak girin.
