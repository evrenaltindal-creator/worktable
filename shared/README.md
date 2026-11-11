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
