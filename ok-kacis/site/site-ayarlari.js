/*
 * Ok Kaçış sitesinin TEK ayar dosyası.
 * Bu dosyayı doldur, sonra "site" klasörünün tamamını sitene yükle
 * (ör. siten.com/ok-kacis/ olacak şekilde). Ayrıntılar: ok-kacis/SITEYE-YUKLE.md
 */
window.OK_KACIS_SITE = {
  // App Store'daki uygulama sayfan (uygulama yayınlanınca doldur),
  // ör. 'https://apps.apple.com/app/id1234567890'. Boşken "çok yakında" yazar.
  appStoreUrl: '',

  // Google Play sayfan (varsa). Boşken düğme görünmez.
  googlePlayUrl: '',

  // Google AdSense yayıncı kimliğin, ör. 'ca-pub-1234567890123456'.
  // Boşken sitede hiç reklam çıkmaz ve oyunda ödüller reklamsız verilir.
  adsenseClient: '',

  // Oyun sayfasının altındaki banner için AdSense reklam birimi kimliği (isteğe bağlı).
  adsenseBannerSlot: '',

  // AdSense "oyun içi reklamlar" (H5 Games Ads) başvurun onaylandıysa true yap.
  // false iken oyun içi reklamlar test modunda çalışır.
  adsenseGameAdsApproved: false,

  // Gizlilik politikasında ve iletişim bölümünde görünecek e-posta adresi.
  contactEmail: '',

  // Gizlilik politikasında "geliştirici" olarak görünecek ad (kişi ya da şirket).
  developerName: '',
};

// Oyun sayfasında (oyna/) oyunun reklam ayarlarını bu dosyaya göre kur.
(function () {
  var S = window.OK_KACIS_SITE;
  var C = window.OK_KACIS_CONFIG;
  if (!C) return;
  C.rewardWhenNoAd = true; // reklam gelmezse oyuncu ödülü yine alsın
  if (S.adsenseClient) {
    C.adProvider = 'adsense';
    C.adsense = Object.assign({}, C.adsense, {
      client: S.adsenseClient,
      bannerSlot: S.adsenseBannerSlot,
      testMode: !S.adsenseGameAdsApproved,
    });
    C.banner = !!S.adsenseBannerSlot;
  } else {
    C.adProvider = 'none'; // sitede asla test reklamı gösterme
    C.banner = false;
  }
})();
