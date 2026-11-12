# Huzur oyunları ortak kiti

Bütün Huzur oyunlarında aynı olan parçalar burada durur ve her uygulamaya **kopyalanır**
(her uygulama App Store'a ayrı yüklendiği için kendi klasöründe tam olmalıdır).

- `kit/` → uygulamada `src/kit/`: hareketli sahneler, düğmeler, pencereler, konfeti/yıldız,
  ses/titreşim, 7 dilli ortak metinler (`c`), ana sayfa (`Home`), oyun çerçevesi (`GameFrame`), kayıt.
- `assets/` → uygulamada `assets/`: sahne resimleri, efektler, sesler, ortak simgeler.

Komutlar:

```bash
shared/new-app.sh <klasör> <paket-son-eki> "<Uygulama Adı>"   # yeni oyun projesi
shared/sync-kit.sh <klasör>                                   # kitte değişiklik olunca uygulamaya kopyala
```

Kitte bir değişiklik yaptıktan sonra onu kullanan her uygulamada `sync-kit.sh` çalıştırın.

## Huzur oyunları (her biri ayrı App Store uygulaması)

| Klasör | Oyun | Paket kimliği |
| --- | --- | --- |
| `mahjong/` | Huzur Mahjong (8 oyun modu) | `com.evrenaltindal.huzurmahjong` |
| `sudoku/` | Huzur Sudoku | `com.evrenaltindal.huzursudoku` |
| `mines/` | Huzur Mayın Tarlası | `com.evrenaltindal.huzurmines` |
| `bubbles/` | Huzur Balon Patlatma | `com.evrenaltindal.huzurbubbles` |
| `jewels/` | Huzur Mücevher (üçlü eşleştirme) | `com.evrenaltindal.huzurjewels` |
| `blocks/` | Huzur Blok Bulmaca | `com.evrenaltindal.huzurblocks` |
| `colorpop/` | Huzur Renk Patlatma | `com.evrenaltindal.huzurcolorpop` |
| `jigsaw/` | Huzur Yapboz | `com.evrenaltindal.huzurjigsaw` |
| `words/` | Huzur Kelime Avı | `com.evrenaltindal.huzurwords` |
| `cube/` | Huzur Mahjong Küp | `com.evrenaltindal.huzurcube` |

Her klasörde aynı adımlar: `npm install` → `npx eas-cli@latest init` (yalnız ilk sefer) → `npm run build:ios` →
`npm run submit:ios`. Mağaza metinleri ve adım adım rehber: `<klasör>/store/APP-STORE-CONNECT.md`.
Destek ve gizlilik sayfaları: `<klasör>/docs/` (yayınlamadan önce `E-POSTA-ADRESINIZ` yerine e-posta adresinizi yazın).
