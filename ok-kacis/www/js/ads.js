/*
 * Ok Kaçış — reklam katmanı.
 *
 * Oyun yalnızca OkAds nesnesiyle konuşur. Reklam ağını değiştirmek için oyun
 * koduna dokunmana gerek yok: config.js'deki adProvider yeterli.
 *
 *   OkAds.maybeInterstitial(level)  seviye arası geçiş reklamı (sıklık sınırıyla)
 *   OkAds.rewarded(placement)       ödüllü reklam -> true (ödül), false (yarıda kapattı),
 *                                   null (şu an reklam yok)
 *   OkAds.showBanner(slot)          alt banner
 *
 * Sağlayıcılar: mock (test), admob (Capacitor uygulaması), adsense (web),
 * crazygames (portal), none (reklamsız).
 */
(function (root) {
  'use strict';

  const lang = (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  const TXT = {
    tr: {
      test: 'TEST REKLAMI',
      inter: 'Geçiş reklamı',
      reward: 'Ödüllü reklam',
      body: 'Yayındaki oyunda burada gerçek bir reklam oynar. Bu kutu sadece reklamın nerede ve ne zaman çıkacağını gösterir.',
      close: 'Kapat',
      closeIn: 'Kapat ({n})',
      claim: 'Ödülü al',
      skip: 'Ödülsüz kapat',
      ad: 'REKLAM',
      banner: 'Banner alanı · 320×50 · test',
    },
    en: {
      test: 'TEST AD',
      inter: 'Interstitial',
      reward: 'Rewarded ad',
      body: 'In the live game a real ad plays here. This box only shows where and when the ad appears.',
      close: 'Close',
      closeIn: 'Close ({n})',
      claim: 'Claim reward',
      skip: 'Close without reward',
      ad: 'AD',
      banner: 'Banner slot · 320×50 · test',
    },
  };
  const tx = (k, n) => (TXT[lang][k] || k).replace('{n}', n);

  function loadScript(src, attrs) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      for (const k in attrs || {}) s.setAttribute(k, attrs[k]);
      s.onload = resolve;
      s.onerror = () => reject(new Error('yüklenemedi: ' + src));
      document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------- Test (mock)
  class MockProvider {
    constructor(cfg) {
      this.name = 'mock';
      this.cfg = Object.assign({ interstitialSeconds: 3, rewardedSeconds: 5 }, cfg);
    }
    async init() {}
    async showInterstitial(placement, hooks) {
      await this._show(false, hooks);
    }
    showRewarded(placement, hooks) {
      return this._show(true, hooks);
    }
    _show(rewarded, hooks) {
      return new Promise((resolve) => {
        hooks.pause();
        const total = rewarded ? this.cfg.rewardedSeconds : this.cfg.interstitialSeconds;
        const el = document.createElement('div');
        el.className = 'ad-mock';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', tx('test'));
        el.innerHTML =
          '<div class="ad-mock-top"><span class="ad-mock-tag"></span><span class="ad-mock-kind"></span></div>' +
          '<div class="ad-mock-body"><div class="ad-mock-art" aria-hidden="true"></div><p></p></div>' +
          '<div class="ad-mock-bar"><i></i></div>' +
          '<button type="button" class="ad-mock-btn"></button>';
        el.querySelector('.ad-mock-tag').textContent = tx('test');
        el.querySelector('.ad-mock-kind').textContent = tx(rewarded ? 'reward' : 'inter');
        el.querySelector('.ad-mock-body p').textContent = tx('body');
        document.body.appendChild(el);
        const bar = el.querySelector('.ad-mock-bar i');
        const btn = el.querySelector('.ad-mock-btn');
        const t0 = performance.now();
        let done = false;
        let closed = false;
        const tick = () => {
          if (closed) return;
          const elapsed = (performance.now() - t0) / 1000;
          done = elapsed >= total;
          bar.style.width = Math.min(100, (elapsed / total) * 100) + '%';
          if (rewarded) {
            btn.textContent = done ? tx('claim') : tx('skip');
            btn.classList.toggle('is-primary', done);
          } else {
            btn.textContent = done ? tx('close') : tx('closeIn', Math.max(1, Math.ceil(total - elapsed)));
            btn.disabled = !done;
          }
          if (!done) requestAnimationFrame(tick);
          else if (!rewarded) btn.focus();
        };
        tick();
        btn.addEventListener('click', () => {
          if (closed || (!rewarded && !done)) return;
          closed = true;
          el.remove();
          hooks.resume();
          resolve(rewarded ? done : true);
        });
      });
    }
    showBanner(slot) {
      slot.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'mock-banner';
      const tag = document.createElement('b');
      tag.textContent = tx('ad');
      box.appendChild(tag);
      box.appendChild(document.createTextNode(' ' + tx('banner')));
      slot.appendChild(box);
      slot.hidden = false;
    }
    hideBanner(slot) {
      slot.hidden = true;
      slot.innerHTML = '';
    }
  }

  // ---------------------------------------------------------------- Reklamsız
  class NoAdsProvider {
    // grant=true: reklamsız sürüm, ödüller bedava. grant=false: reklam yüklenemedi.
    constructor(grant) {
      this.name = grant ? 'none' : 'unavailable';
      this.grant = grant;
    }
    async init() {}
    async showInterstitial() {}
    async showRewarded() {
      return this.grant ? true : null;
    }
  }

  // ---------------------------------------------------------------- Google AdSense (web)
  // H5 oyun reklamları (Ad Placement API): adBreak({type:'next'|'reward'}).
  class AdSenseProvider {
    constructor(cfg) {
      this.name = 'adsense';
      this.cfg = cfg || {};
    }
    async init() {
      if (!this.cfg.client) throw new Error('config.js içinde adsense.client boş');
      root.adsbygoogle = root.adsbygoogle || [];
      root.adBreak = root.adConfig = function (o) {
        root.adsbygoogle.push(o);
      };
      const attrs = {
        'data-ad-client': this.cfg.client,
        'data-ad-frequency-hint': this.cfg.frequencyHint || '30s',
        crossorigin: 'anonymous',
      };
      if (this.cfg.testMode) attrs['data-adbreak-test'] = 'on';
      await loadScript(
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(this.cfg.client),
        attrs
      );
      root.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
    }
    setSound(on) {
      try {
        root.adConfig({ sound: on ? 'on' : 'off' });
      } catch (e) {}
    }
    showInterstitial(placement, hooks) {
      return new Promise((resolve) => {
        let settled = false;
        let paused = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (paused) hooks.resume();
          resolve();
        };
        const timer = setTimeout(finish, 3000); // betik hiç cevap vermezse oyunu bekletme
        root.adBreak({
          type: 'next',
          name: placement,
          beforeAd: () => {
            clearTimeout(timer);
            paused = true;
            hooks.pause();
          },
          afterAd: () => {
            if (paused) {
              paused = false;
              hooks.resume();
            }
          },
          adBreakDone: finish,
        });
      });
    }
    showRewarded(placement, hooks) {
      return new Promise((resolve) => {
        let settled = false;
        let shown = false;
        let viewed = false;
        let paused = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (paused) hooks.resume();
          resolve(viewed ? true : shown ? false : null);
        };
        const timer = setTimeout(finish, 4000);
        root.adBreak({
          type: 'reward',
          name: placement,
          beforeAd: () => {
            clearTimeout(timer);
            shown = true;
            paused = true;
            hooks.pause();
          },
          afterAd: () => {
            if (paused) {
              paused = false;
              hooks.resume();
            }
          },
          // Oyuncu "reklam izle" düğmesine zaten bastı; reklamı hemen başlat.
          beforeReward: (showAdFn) => {
            clearTimeout(timer);
            shown = true;
            showAdFn();
          },
          adDismissed: () => {
            viewed = false;
          },
          adViewed: () => {
            viewed = true;
          },
          adBreakDone: finish,
        });
      });
    }
    showBanner(slot) {
      if (!this.cfg.bannerSlot) return;
      slot.innerHTML = '';
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:inline-block;width:320px;height:50px';
      ins.setAttribute('data-ad-client', this.cfg.client);
      ins.setAttribute('data-ad-slot', this.cfg.bannerSlot);
      slot.appendChild(ins);
      slot.hidden = false;
      try {
        (root.adsbygoogle = root.adsbygoogle || []).push({});
      } catch (e) {}
    }
    hideBanner(slot) {
      slot.hidden = true;
    }
  }

  // ---------------------------------------------------------------- Google AdMob (Capacitor uygulaması)
  // @capacitor-community/admob eklentisini kullanır. Kurulum: README.md
  function capacitorAdMob() {
    const C = root.Capacitor;
    if (!C) return null;
    const native = typeof C.isNativePlatform === 'function' ? C.isNativePlatform() : !!C.isNative;
    if (!native) return null;
    return (
      (C.Plugins && C.Plugins.AdMob) ||
      (root.capacitorAdMob && root.capacitorAdMob.AdMob) ||
      (typeof C.registerPlugin === 'function' ? C.registerPlugin('AdMob') : null)
    );
  }

  class AdMobProvider {
    constructor(cfg) {
      this.name = 'admob';
      this.cfg = cfg || {};
      this.ad = capacitorAdMob();
      this.ready = { inter: false, reward: false };
      this.slot = null;
    }
    async init() {
      if (!this.ad) throw new Error('AdMob eklentisi bulunamadı');
      await this.ad.initialize({ initializeForTesting: !!this.cfg.testing });
      // Avrupa'daki oyuncular için Google'ın izin (GDPR) formu
      try {
        const info = await this.ad.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await this.ad.showConsentForm();
      } catch (e) {}
      try {
        await this.ad.addListener('bannerAdSizeChanged', (size) => {
          if (this.slot && size && size.height) this.slot.style.height = size.height + 'px';
        });
      } catch (e) {}
      this._prepare('inter');
      this._prepare('reward');
    }
    async _prepare(kind) {
      try {
        if (kind === 'inter') await this.ad.prepareInterstitial({ adId: this.cfg.interstitialId, isTesting: !!this.cfg.testing });
        else await this.ad.prepareRewardVideoAd({ adId: this.cfg.rewardedId, isTesting: !!this.cfg.testing });
        this.ready[kind] = true;
      } catch (e) {
        this.ready[kind] = false;
      }
    }
    async _listen(ev, cb) {
      try {
        return (await this.ad.addListener(ev, cb)) || null;
      } catch (e) {
        return null;
      }
    }
    // Reklam kapanana kadar bekler. Olay dinlenemiyorsa eklentinin cevabıyla yetinir.
    async _waitFor(events, action, ms) {
      let done;
      const finished = new Promise((r) => (done = r));
      const handles = await Promise.all(events.map((ev) => this._listen(ev, () => done(ev))));
      const canListen = handles.some(Boolean);
      const timer = setTimeout(() => done('timeout'), ms);
      try {
        await action();
        if (!canListen) done('resolved');
      } catch (e) {
        done('error');
      }
      const result = await finished;
      clearTimeout(timer);
      handles.forEach((h) => h && h.remove && h.remove());
      return result;
    }
    async showInterstitial(placement, hooks) {
      if (!this.ready.inter) {
        this._prepare('inter');
        return;
      }
      this.ready.inter = false;
      hooks.pause();
      try {
        await this._waitFor(['interstitialAdDismissed', 'interstitialAdFailedToShow'], () => this.ad.showInterstitial(), 90000);
      } finally {
        hooks.resume();
        this._prepare('inter');
      }
    }
    async showRewarded(placement, hooks) {
      if (!this.ready.reward) {
        await this._prepare('reward');
        if (!this.ready.reward) return null;
      }
      this.ready.reward = false;
      let rewarded = false;
      const handle = await this._listen('onRewardedVideoAdReward', () => {
        rewarded = true;
      });
      hooks.pause();
      let end = 'error';
      try {
        end = await this._waitFor(
          ['onRewardedVideoAdDismissed', 'onRewardedVideoAdFailedToShow'],
          async () => {
            const item = await this.ad.showRewardVideoAd();
            if (!handle && item && (item.amount != null || item.type)) rewarded = true;
          },
          120000
        );
      } finally {
        if (handle && handle.remove) handle.remove();
        hooks.resume();
        this._prepare('reward');
      }
      if (rewarded) return true;
      return end === 'onRewardedVideoAdDismissed' || end === 'resolved' ? false : null;
    }
    async showBanner(slot) {
      this.slot = slot;
      slot.innerHTML = '';
      slot.style.height = '56px'; // gerçek yükseklik bannerAdSizeChanged ile gelir
      slot.hidden = false;
      try {
        await this.ad.showBanner({
          adId: this.cfg.bannerId,
          adSize: 'ADAPTIVE_BANNER',
          position: 'BOTTOM_CENTER',
          margin: 0,
          isTesting: !!this.cfg.testing,
        });
      } catch (e) {
        slot.hidden = true;
      }
    }
    hideBanner(slot) {
      try {
        this.ad.hideBanner();
      } catch (e) {}
      slot.hidden = true;
    }
  }

  // ---------------------------------------------------------------- CrazyGames portalı
  class CrazyGamesProvider {
    constructor(cfg) {
      this.name = 'crazygames';
      this.cfg = cfg || {};
    }
    async init() {
      if (!(root.CrazyGames && root.CrazyGames.SDK)) await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
      this.sdk = root.CrazyGames.SDK;
      await this.sdk.init();
    }
    _ad(type, hooks) {
      return new Promise((resolve) => {
        let paused = false;
        this.sdk.ad.requestAd(type, {
          adStarted: () => {
            paused = true;
            hooks.pause();
          },
          adFinished: () => {
            if (paused) hooks.resume();
            resolve(true);
          },
          adError: () => {
            if (paused) hooks.resume();
            resolve(null);
          },
        });
      });
    }
    async showInterstitial(placement, hooks) {
      await this._ad('midgame', hooks);
    }
    showRewarded(placement, hooks) {
      return this._ad('rewarded', hooks);
    }
    event(name) {
      try {
        const g = this.sdk.game;
        if (name === 'gameplayStart') g.gameplayStart();
        else if (name === 'gameplayStop') g.gameplayStop();
        else if (name === 'happytime') g.happytime();
      } catch (e) {}
    }
  }

  // ---------------------------------------------------------------- Oyunun kullandığı arayüz
  const OkAds = {
    provider: null,
    cfg: {},
    hooks: { pause() {}, resume() {} },
    ready: Promise.resolve(),
    lastAdAt: 0,
    levelsSince: 0,
    busy: false,

    _pick(cfg) {
      let want = new URLSearchParams(location.search).get('ads') || cfg.adProvider || 'auto';
      if (want === 'auto') {
        if (capacitorAdMob()) want = 'admob';
        else if (/(^|\.)crazygames\./i.test(location.hostname)) want = 'crazygames';
        else if (cfg.adsense && cfg.adsense.client) want = 'adsense';
        else want = 'mock';
      }
      switch (want) {
        case 'admob':
          return new AdMobProvider(cfg.admob);
        case 'adsense':
          return new AdSenseProvider(cfg.adsense);
        case 'crazygames':
          return new CrazyGamesProvider(cfg.crazygames);
        case 'none':
          return new NoAdsProvider(true);
        default:
          return new MockProvider(cfg.mock);
      }
    },

    init(cfg, hooks) {
      this.cfg = cfg || {};
      Object.assign(this.hooks, hooks || {});
      this.provider = this._pick(this.cfg);
      this.ready = Promise.resolve()
        .then(() => this.provider.init())
        .catch((e) => {
          console.warn('[OkAds] ' + this.provider.name + ' açılamadı, reklamlar kapalı:', e);
          this.provider = new NoAdsProvider(false);
        });
      return this.ready;
    },

    get name() {
      return this.provider ? this.provider.name : 'none';
    },

    /** Seviye bitince çağrılır; sıklık kuralları uygunsa geçiş reklamı gösterir. */
    async maybeInterstitial(completedLevel) {
      await this.ready;
      this.levelsSince++;
      const c = this.cfg;
      if (completedLevel < (c.firstInterstitialLevel || 3)) return false;
      if (this.levelsSince < (c.interstitialEveryNLevels || 2)) return false;
      if (Date.now() - this.lastAdAt < (c.interstitialMinSeconds || 45) * 1000) return false;
      if (this.busy) return false;
      this.busy = true;
      try {
        await this.provider.showInterstitial('level_complete', this.hooks);
      } catch (e) {
        console.warn('[OkAds] geçiş reklamı hatası', e);
      } finally {
        this.busy = false;
      }
      this.lastAdAt = Date.now();
      this.levelsSince = 0;
      return true;
    },

    /** true: ödül ver. false: oyuncu yarıda kapattı. null: reklam yok. */
    async rewarded(placement) {
      await this.ready;
      if (this.busy) return null;
      this.busy = true;
      let result = null;
      try {
        result = await this.provider.showRewarded(placement, this.hooks);
      } catch (e) {
        console.warn('[OkAds] ödüllü reklam hatası', e);
        result = null;
      } finally {
        this.busy = false;
      }
      if (result !== null) this.lastAdAt = Date.now(); // ödüllü reklamdan hemen sonra geçiş reklamı çıkmasın
      return result === undefined ? null : result;
    },

    async showBanner(slot) {
      if (!this.cfg.banner || !slot) return;
      await this.ready;
      try {
        if (this.provider.showBanner) await this.provider.showBanner(slot);
      } catch (e) {}
    },

    hideBanner(slot) {
      try {
        if (this.provider && this.provider.hideBanner) this.provider.hideBanner(slot);
      } catch (e) {}
    },

    setSound(on) {
      if (this.provider && this.provider.setSound) this.provider.setSound(on);
    },

    /** Portallar için oyun olayları: gameplayStart, gameplayStop, happytime */
    event(name) {
      if (this.provider && this.provider.event) this.provider.event(name);
    },
  };

  root.OkAds = OkAds;
})(window);
