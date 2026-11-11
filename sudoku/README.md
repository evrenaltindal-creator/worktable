# Huzur Sudoku

Büyük rakamlı, sakin bir sudoku. Huzur Mahjong ile aynı aileden: aynı hareketli sahneler,
sesler, büyük düğmeler ve 7 dil. App Store'a **ayrı bir uygulama** olarak yüklenir.

## Özellikler

- **Dört zorluk:** Kolay, Orta, Zor, Uzman; her birinde sınırsız bulmaca (numara ile her zaman aynı bulmaca).
- **Her bulmacanın tek çözümü var.** Kolay ve Orta bulmacalar sadece temel mantıkla çözülür (tahmin gerekmez).
- **Günün Sudokusu:** her gün tarihe göre yeni bir bulmaca.
- Not alma, sınırsız geri alma ve silme, hatalı rakamları kırmızı gösterme, aynı rakamları vurgulama.
- **Sınırlı ipucu:** başlangıçta 3; her çözülen bulmaca +1. Hatasız ve ipuçsuz bitirmek 3 yıldız.
- Tamamlanan satır/sütun/kutu parlar, bitişte konfeti ve yıldızlar.
- Yarım kalan bulmaca otomatik kaydedilir. İnternet gerekmez, veri toplamaz.
- 7 dil: Türkçe, İngilizce, Portekizce (Brezilya), Almanca, Fransızca, Japonca, Korece
  (Japonca'da tescilli 「数独」 yerine 「ナンプレ」 kullanılır).

## Telefonda deneme

```bash
npm install
npx expo start      # iPhone'da Expo Go ile QR kodu okutun
```

## App Store'a yükleme

Adım adım rehber: [`store/APP-STORE-CONNECT.md`](store/APP-STORE-CONNECT.md). Kısaca:

```bash
npx eas-cli@latest init     # bir kez: Expo'da ayrı proje
npm run build:ios
npm run submit:ios
```

Paket kimliği: `com.evrenaltindal.huzursudoku` (ilk yüklemeden sonra değişmez).

## Proje yapısı

```
App.tsx                    Ana sayfa / oyun geçişi, ilerleme ve ödüller
src/game/sudoku.ts         Bulmaca üretimi, tek çözüm kontrolü, zorluk
src/screens/               HomeScreen, GameScreen
src/components/            SudokuBoard + Mahjong ile ortak parçalar (sahne, düğmeler, efektler)
src/i18n.ts                7 dilde tüm metinler
store/                     Mağaza metinleri, ekran görüntüleri, doldurma rehberi
docs/                      Destek ve gizlilik sayfaları
```

## Kontroller

```bash
npm run typecheck
npx expo lint
npm run check:game     # her zorlukta bulmacaların tek çözümlü ve tutarlı olduğunu doğrular
npx expo-doctor
```
