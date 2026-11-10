/*
 * Ok Kaçış — ayarlar.
 * Reklamlarla para kazanmak için gerekli kimlikleri BURAYA yazarsın.
 * Hangi yolu seçeceğini ve kimlikleri nereden alacağını ../README.md anlatıyor.
 */
window.OK_KACIS_CONFIG = {
  // Hangi reklam ağı kullanılsın?
  //   'auto'       : Android/iOS uygulamasında AdMob, CrazyGames sitesinde CrazyGames SDK,
  //                  aşağıya AdSense kimliği girildiyse AdSense, hiçbiri yoksa TEST reklamları
  //   'mock'       : her zaman sahte test reklamları (geliştirirken)
  //   'admob'      : Capacitor ile yapılmış Android/iOS uygulaması (Google AdMob)
  //   'adsense'    : kendi web siten (Google AdSense, H5 oyun reklamları)
  //   'crazygames' : CrazyGames oyun portalı
  //   'none'       : reklamsız (ödüller reklamsız verilir)
  // Denemek için adres çubuğuna ?ads=mock yazarak da seçebilirsin.
  // ŞİMDİLİK REKLAMLAR KAPALI: uygulama reklamsız, ödüller (can, ipucu, süre) ücretsiz.
  // Açmak için 'auto' yap ve AdMob eklentisini geri ekle (ok-kacis/README.md > Reklamları açmak).
  adProvider: 'none',

  admob: {
    // Aşağıdakiler Google'ın herkese açık TEST kimlikleri. Para kazandırmazlar.
    // Yayınlamadan önce AdMob panelinde her platform için ayrı bir uygulama
    // açıp kendi reklam birimi kimliklerini yaz ve testing'i false yap.
    // iOS uygulama kimliği ayrıca ios/App/App/Info.plist > GADApplicationIdentifier içinde.
    testing: true,
    android: {
      bannerId: 'ca-app-pub-3940256099942544/6300978111',
      interstitialId: 'ca-app-pub-3940256099942544/1033173712',
      rewardedId: 'ca-app-pub-3940256099942544/5224354917',
    },
    ios: {
      bannerId: 'ca-app-pub-3940256099942544/2934735716',
      interstitialId: 'ca-app-pub-3940256099942544/4411468910',
      rewardedId: 'ca-app-pub-3940256099942544/1712485313',
    },
  },

  adsense: {
    client: '', // ör. 'ca-pub-1234567890123456'
    bannerSlot: '', // isteğe bağlı: alttaki banner için AdSense reklam birimi kimliği
    testMode: true, // yayına alırken false yap
  },

  crazygames: {},

  // Reklam yüklenemezse (ör. AdSense oyun reklamları henüz onaylanmadıysa)
  // oyuncu ödülü yine alsın mı? Web sitesi için true önerilir.
  rewardWhenNoAd: false,

  mock: {
    interstitialSeconds: 3,
    rewardedSeconds: 5,
  },

  // Reklam sıklığı. Çok sık reklam oyuncuyu kaçırır; bu değerler iyi bir başlangıçtır.
  banner: true, // oyun sırasında altta banner
  firstInterstitialLevel: 3, // ilk geçiş reklamı en erken bu seviye bitince
  interstitialEveryNLevels: 2, // sonra her 2 seviyede bir
  interstitialMinSeconds: 45, // iki reklam arasında en az bu kadar saniye

  // Zamana karşı modu
  timeAttack: {
    startSeconds: 60, // tur bu süreyle başlar
    clearBonusSeconds: 8, // her temizlenen tahta için eklenen süre
    mistakePenaltySeconds: 3, // her çarpmada düşen süre (bu modda can yok)
    reviveSeconds: 15, // süre bitince ödüllü reklamla eklenen süre (tur başına bir kez)
    interstitialEveryNRuns: 1, // "Tekrar oyna"da kaç turda bir geçiş reklamı (45 sn kuralı da geçerli)
  },

  // Puanlama
  score: {
    perArrowCell: 10, // ok başına puan = hücre sayısı × bu değer × kombo çarpanı
    comboWindow: 2.4, // bu kadar saniye içinde yeni ok kaçırılırsa kombo sürer
    clearBonus: 100, // tahta bitince
    perfectBonus: 150, // tahta hatasız bitince ek
  },

  // Oyun ekonomisi
  hearts: 3, // seviye başına can
  startHints: 3, // ilk açılışta verilen ipucu
  hintsPerAd: 3, // bir ödüllü reklam karşılığı ipucu
};
