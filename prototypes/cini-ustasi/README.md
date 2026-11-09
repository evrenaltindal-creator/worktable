# Çini Ustası: blok bulmaca prototipi

8×8 blok yerleştirme bulmacası. Amaç, iOS'a geçmeden önce türün temel döngüsünü ve reklam akışını (ödüllü, geçiş, banner) tarayıcıda denemek.

Tek dosyadır: `index.html` dosyasını tarayıcıda açmak yeterli. Derleme ya da sunucu gerekmez. Yazı tipleri Google Fonts'tan gelir; internet yoksa sistem fontu kullanılır.

## Oynanış

- Alttaki üç parçadan birini sürükleyip tahtaya bırakırsın. Üçü de bitince yeni üçlü gelir.
- Dolan satır ve sütun kırılır. Aynı anda birden çok çizgi kırmak puanı katlar.
- **Seri:** Üç hamle içinde tekrar çizgi kırarsan seri artar ve puan seri sayısıyla çarpılır.
- Hiçbir parça sığmazsa oyun biter. Önce "devam et" seçeneği sunulur.

## Türün kopyasından ayıran özgün dokunuşlar

| Özellik | Ne yapar |
|---|---|
| İznik çini teması | Her rengin kendi motifi var: rozet, baklava, lale, saz yaprağı, sekiz köşeli yıldız. Tahta, kenar suyu (bordür) olan bir çini pano gibi. |
| Altın çini | Bazı parçalarda altın hücre bulunur. Kırılınca +5 altın verir. |
| Desen tamam | Tek renkten oluşan bir satır ya da sütun kırılırsa +100 × seri puan ve +3 altın. |
| Döndür güçlendiricisi | Bu türde nadir bulunur: alttaki bir parçayı 90° çevirir. |

Not: "Çini Ustası" adı bir çalışma adıdır. Yayından önce App Store'da ad ve marka kontrolü yapılmalı.

## Görsel ve ses geri bildirimi

Arka plan ve efektler iki ayrı tam ekran canvas'ta çizilir: `#bg` içeriğin altında, `#fx` her şeyin üstünde. İkisi de dokunmayı geçirir.

- **Hareketli sahne:** Yavaşça kayan yıldız-haç çini deseni, skor plakasının arkasında ters yönlere dönen şemse madalyonu ve aşağıdan yükselen lale, karanfil, saz yaprağı, yıldız ve rozet motifleri. Sakin anlarda saniyede ~30 kare çizilir.
- **Skor tablosu:** Çini pano gibi çerçeveli plaka. Skor yuvarlanarak artar, çubuk rekora ne kadar kaldığını gösterir, oyun içinde rekor geçilince altına döner. Oyun sonunda ilk 5 skorluk **rekor tablosu** görünür.
- **Çizgi kırınca:** Her çiniden kıvılcım, tahtadan yayılan şok dalgası, şemse nabzı, yükselen motif patlaması. 2+ çizgide renk parlaması, ekran sallanması ve "Harika!", "Muhteşem!", "Efsane!" övgüleri. Seri sürerken tahta kenarındaki baklavalar ve şemsenin arkası ısınır.
- **Altın:** Altın çiniden ve desenli satırdan çıkan altınlar üstteki sayaca uçar. Altın artık kazanıldığı anda hesaba geçer; oyun sonunda yalnızca skor altını eklenir.
- **Rekor ve tertemiz duvar:** Havai fişek, konfeti ve fanfar.
- **Ses:** WebAudio ile anında üretilir, dosya yoktur. Seri büyüdükçe kırılma sesi yükselir. Üst bardaki hoparlör düğmesiyle kapatılır.
- **Titreşim:** Android tarayıcıda çalışır; iOS Safari desteklemez. Unity sürümünde iOS haptics kullanılmalı.
- **Erişilebilirlik:** Cihazda "hareketi azalt" açıksa arka plan durağan kalır; sallanma, kıvılcım ve havai fişek gösterilmez.

Efekt şiddeti tek yerden ayarlanır: `Scene.onClear`, `Scene.onRecord` ve `shakeBoard`.

## Diller

Oyun 7 dilde: Türkçe, İngilizce, Portekizce (Brezilya), Almanca, Fransızca, Japonca, Korece.

- **Seçim sırası:** Oyuncunun kaydettiği seçim, yoksa cihaz dili, o da listede yoksa İngilizce. Üst bardaki küre düğmesiyle değiştirilir.
- **Tablo:** Bütün oyuncu metinleri `STR` içinde. Yeni dil için `LANGS` ve `LOCALES`'e birer satır, `STR`'ye bir blok eklenir. Eksik anahtar İngilizceye düşer.
- **Sayı, tarih, fiyat:** Dile göre biçimlenir (1,264 / 1.264 / 1 264; $2.99 / 2,99 $). Canlıda fiyatlar StoreKit'ten oyuncunun para birimiyle gelir.
- **Yazı tipleri:** Japonca ve Korece için Noto Sans JP/KR ve Shippori Mincho / Gowun Batang yüklenir. Latin harfler ve rakamlar markanın yazı tipinde kalır.
- **Oyun adı:** Plakadaki ad dile göre çevrildi (Tile Master, Mestre do Azulejo, Fliesenmeister, Maître Céramiste, タイル職人, 타일 장인). Bunlar çalışma çevirileri. Mağaza adı için her dilde ayrıca ad ve marka kontrolü gerekir.
- Geliştirici paneli (Reklam akışı) oyuncuya gösterilmediği için Türkçe kaldı.
- Çeviriler yayından önce ana dili konuşan biri tarafından gözden geçirilmeli. Özellikle övgü sözleri ("Harika!" karşılıkları) ve mağaza metinleri.

## Parça üretme algoritması (`genTray`)

1. **Zorluk eğrisi:** Her parça ailesinin bir "erken" ve bir "geç" ağırlığı var. Skor 0'dan 6.000'e çıkarken ağırlık erkenden geçe kayar, büyük parçalar sıklaşır.
2. **Merhamet:** Tahta %50'den fazla doluysa 1–3 hücrelik parçaların ağırlığı artar.
3. **Yardımcı parça:** Tahta doldukça, satır tamamlayabilen bir parçanın üçlüye girme olasılığı %12'den %60'a kadar çıkar.
4. **Adalet garantisi:** 1.500 puanın altında, gelen üç parçanın bir sırayla mutlaka yerleşebildiği arama ile doğrulanır. Skor arttıkça bu garanti %70'e kadar gevşer. Oyunu bitiren de bu gevşemedir.
5. Her üçlüde en az bir parçanın bir yere sığması şarttır.

Ayar noktaları kodda: `SHAPE_DEFS` (ağırlıklar), `guaranteeChance`, `genTray` içindeki `mercy` ve `pHelp`.

## Reklam yerleşimleri

| Yer (`placement`) | Tür | Ne zaman | Oyuncuya ne kazandırır |
|---|---|---|---|
| `devam_et` | Ödüllü | Hamle kalmayınca, oyun başına bir kez | En dolu 4×4 alan temizlenir, sığan üç yeni parça gelir |
| `altin_2x` | Ödüllü | Oyun sonu ekranı | O oyunda kazanılan altın ikiye katlanır |
| `guclendirici_*` | Ödüllü | Döndür, Yenile ya da Çekiç hakkı bitince | +1 hak (alternatif: altınla almak) |
| `oyun_arasi` | Geçiş | "Yeni oyun"a basınca | Aşağıdaki kurallara uyuyorsa gösterilir |
| `oyun_ici_mola` | Geçiş | Uzun oyunda üçlü yenilenince | Varsayılan kapalı, A/B testi için |
| `alt` | Banner | Sürekli, 30 sn'de bir yenilenir | Reklamsız sürümde kalkar |

**Geçiş reklamı kuralları** (panelden değiştirilebilir):

- İlk 2 oyun bitmeden geçiş reklamı yok. İlk izlenim bozulmasın diye.
- İki geçiş reklamı arasında en az 90 sn olmalı. Uygulama açılışı da sayılır.
- Ödüllü reklamdan sonraki 45 sn geçiş reklamı yok. Oyuncu az önce gönüllü izledi.
- Reklamsız sürümü alan oyuncuya geçiş reklamı ve banner gösterilmez. Ödüllü reklam isteğe bağlı olduğu için kalır.

Sağdaki **Reklam akışı** panelinde (telefonda grafik simgesi) gösterim sayıları, eCPM varsayımına göre tahmini gelir, geçiş reklamının şu an neden engelli olduğu ve tüm olay günlüğü görünür.

## Gerçek SDK'ya geçiş (Unity + AppLovin MAX örneği)

Kodda `GERÇEK:` yorumları SDK çağrılarının gideceği yeri gösterir.

| Prototipteki fonksiyon | MAX karşılığı |
|---|---|
| `Ads.showRewarded(placement)` | `MaxSdk.ShowRewardedAd(adUnitId, placement)`. Ödül `MaxSdkCallbacks.Rewarded.OnAdReceivedRewardEvent` ile verilir, kapatma geri çağrısıyla değil. |
| `Ads.maybeInterstitial(placement)` | Kurallar aynı kalır. Gösterim: `MaxSdk.IsInterstitialReady(id)` ve ardından `MaxSdk.ShowInterstitial(id, placement)`. |
| Banner | `MaxSdk.CreateBanner(...)` ve `MaxSdk.ShowBanner(id)`, alt-orta konumda. |
| `track(name, params)` | GameAnalytics ya da Firebase Analytics olayı. |

LevelPlay kullanılırsa çağrı adları değişir, akış aynı kalır.

## iOS yayını öncesi yapılacaklar

- ATT izin penceresi (App Tracking Transparency) ve Info.plist'e reklam ağlarının SKAdNetwork kimlikleri.
- App Store Connect'te App Privacy etiketleri (reklam SDK'larının topladığı veriler).
- Reklamsız sürüm için **Satın alımları geri yükle** düğmesi (Apple bunu zorunlu tutar; prototipte mağazada var).
- Reklam yüklenemediğinde (no fill) ödüllü düğmeyi gizlemek ya da "Şu an reklam yok" demek.
- Ses ve titreşim (kırılma anında). Bu türde tatmin hissinin önemli bir parçası.

## İlk test için ölçülecekler

1. Küçük bir reklam testiyle **oyuncu başına edinme maliyeti (CPI)**.
2. **1. gün geri dönüş (D1)** ve ortalama oturum süresi.
3. Oyuncu başına günlük reklam gösterimi ve **ARPDAU**.

Kural: Oyuncunun ömür boyu getirisi (LTV) CPI'dan yüksek değilse ölçeklemeden önce oyun döngüsü düzeltilir. Meta katman (koleksiyon, dekorasyon) ancak bu sayılar iyi çıkarsa eklenir.
