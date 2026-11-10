# Ok Kaçış'ı kendi sitene koyma rehberi

`ok-kacis/site/` klasörü, sitene olduğu gibi yükleyeceğin hazır bir pakettir:

| Dosya | Ne işe yarar |
| --- | --- |
| `index.html` | Oyunun tanıtım sayfası (7 dil, App Store düğmesi, "Tarayıcıda oyna") |
| `oyna/` | Oyunun kendisi; AdSense reklamlarıyla çalışır |
| `gizlilik.html` | Gizlilik politikası (App Store ve AdSense bunu ister) |
| `tanitim-kutusu.html` | Sitenin başka sayfalarına yapıştıracağın tanıtım kutusu kodunu üretir |
| `site-ayarlari.js` | **Tek ayar dosyası**: e-posta, AdSense ve App Store bağlantıların |
| `kok-dizin/` | `ads.txt` ve `app-ads.txt` şablonları (sitenin kök dizinine gider) |

Yükleyince adresler şöyle olur (örnek): `https://siten.com/ok-kacis/`,
`https://siten.com/ok-kacis/oyna/`, `https://siten.com/ok-kacis/gizlilik.html`.

## 1. Ayar dosyasını doldur

`site/site-ayarlari.js` dosyasını Not Defteri ile aç:

- `contactEmail`: gizlilik politikasında ve iletişim bölümünde görünecek e-posta. **Şimdi doldur.**
- `developerName`: geliştirici olarak görünecek ad. **Şimdi doldur.**
- `adsenseClient`: AdSense onaylanınca `ca-pub-...` kimliğin. Boşken hiç reklam çıkmaz.
- `appStoreUrl`: uygulama App Store'da yayınlanınca bağlantısı. Boşken "çok yakında" yazar.
- `googlePlayUrl`: Android sürümü olursa.

## 2. Dosyaları sitene yükle

1. GitHub'da depoyu aç, dalı `claude/festive-wright-wotpi5` seç (ya da birleştirdiysen ana dal),
   **Code** > **Download ZIP**. ZIP'i aç, `ok-kacis/site` klasörünü bul.
2. Hosting panelinde (cPanel **Dosya Yöneticisi**) ya da FileZilla ile sitenin
   ana klasöründe (genelde `public_html`) `ok-kacis` adında bir klasör aç.
3. `site` klasörünün **içindekileri** (`kok-dizin` hariç) bu klasöre yükle.
4. Tarayıcıda `https://siten.com/ok-kacis/` adresini aç: tanıtım sayfası ve
   "Tarayıcıda oyna" düğmesi çalışmalı.

## 3. ads.txt ve app-ads.txt

1. `kok-dizin/ads.txt` ve `kok-dizin/app-ads.txt` dosyalarında `pub-0000000000000000`
   yerine kendi yayıncı kimliğini yaz (AdSense ve AdMob aynı Google hesabıysa kimlik aynıdır).
2. İkisini sitenin **kök dizinine** yükle (`public_html/ads.txt`), alt klasöre değil.
3. Sitende zaten bir `ads.txt` varsa üzerine yazma; Google satırını dosyanın sonuna ekle.
4. Kontrol: `https://siten.com/ads.txt` ve `https://siten.com/app-ads.txt` açılmalı.

`app-ads.txt`, App Store'da "geliştirici web sitesi" olarak bu siteyi
yazdığında AdMob'un gelirini doğrulamak için gerekir.

## 4. AdSense

1. https://adsense.google.com > siteni ekle. AdSense sana bir kod verir; bu kodu
   sitenin **ana sayfasının** `<head>` bölümüne yapıştır (doğrulama için bir kerelik).
2. Onay birkaç gün ile birkaç hafta sürebilir. Onaylanınca `site-ayarlari.js` >
   `adsenseClient` alanına `ca-pub-...` kimliğini yaz ve yalnızca bu dosyayı yeniden yükle.
   Tanıtım sayfasında Google reklam yerlerini kendisi seçer (otomatik reklamlar).
3. **Oyun içi reklamlar** (oyuncu reklam izleyip can veya ipucu kazanır) için
   AdSense'in oyunlara özel reklam programına ayrıca başvurman gerekir. Onay
   gelene kadar oyun normal çalışır; reklam gelmediği için oyuncu ödülü
   reklamsız alır. Onaylanınca `adsenseGameAdsApproved: true` yap.
4. İstersen oyunun altına banner: AdSense'te bir **görüntülü reklam birimi**
   oluştur, kimliğini `adsenseBannerSlot` alanına yaz.
5. Avrupa'dan ziyaretçin varsa AdSense > **Gizlilik ve mesajlaşma** bölümünden
   izin (GDPR) mesajını aç.

Kendi reklamlarına asla tıklama; Google hesabı kapatır.

## 5. Sitenin diğer sayfalarına tanıtım kutusu koy

1. `https://siten.com/ok-kacis/tanitim-kutusu.html` adresini aç.
2. Kutunun dilini seç, **Kodu kopyala**.
3. Sitende kutunun görünmesini istediğin sayfanın HTML'inde istediğin yere yapıştır.

Aynı sayfada, oyunu başka bir sayfanın **içine gömmek** için ikinci bir kod da var.

## 6. Uygulama App Store'da yayınlanınca

`site-ayarlari.js` > `appStoreUrl` alanına App Store bağlantısını yaz ve bu
dosyayı yeniden yükle. "Çok yakında" yazısı "App Store'dan indir" düğmesine dönüşür.

## Oyunu güncellediğimde

Oyunda değişiklik yapılınca `site/oyna/` klasörü yeniden üretilir
(`ok-kacis` klasöründe `npm run site`, Node.js gerekir; ya da bana söyle).
Sonra yalnızca `oyna/` klasörünü yeniden yükle.
