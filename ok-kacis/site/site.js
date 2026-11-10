/* Ok Kaçış tanıtım sitesi: dil seçimi, metinler, mağaza bağlantıları, AdSense ve hareketli arka plan. */
(function () {
  'use strict';
  var S = window.OK_KACIS_SITE || {};
  var T = window.OK_KACIS_TEXTS || {};
  var NAMES = { tr: 'Türkçe', en: 'English', pt: 'Português', de: 'Deutsch', fr: 'Français', ja: '日本語', ko: '한국어' };
  var KEY = 'okKacis.siteLang';

  function pickLang() {
    var q = (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
    if (q && T[q]) return q;
    try {
      var saved = localStorage.getItem(KEY);
      if (saved && T[saved]) return saved;
    } catch (e) {}
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < prefs.length; i++) {
      var base = String(prefs[i] || '').toLowerCase().split('-')[0];
      if (T[base]) return base;
    }
    return 'en';
  }

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o == null ? o : o[k];
    }, obj);
  }

  function el(tag, text) {
    var e = document.createElement(tag);
    if (text != null) e.textContent = text;
    return e;
  }

  function apply(lang) {
    var t = T[lang] || T.en;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (node) {
      var v = get(t, node.getAttribute('data-t'));
      if (v != null) node.textContent = v;
    });

    var cards = document.getElementById('cards');
    if (cards) {
      cards.innerHTML = '';
      t.web.features.forEach(function (f) {
        var c = el('article');
        c.className = 'card';
        c.appendChild(el('h3', f[0]));
        c.appendChild(el('p', f[1]));
        cards.appendChild(c);
      });
    }
    var steps = document.getElementById('steps');
    if (steps) {
      steps.innerHTML = '';
      t.web.how.forEach(function (s) {
        steps.appendChild(el('li', s));
      });
    }
    var shot = document.getElementById('shot');
    if (shot) {
      shot.src = 'img/screens/' + lang + '.jpg';
      shot.alt = t.title;
    }
    // Gizlilik sayfası: Türkçe ya da İngilizce metin
    var docLang = lang === 'tr' ? 'tr' : 'en';
    document.querySelectorAll('[data-lang]').forEach(function (node) {
      node.hidden = node.getAttribute('data-lang') !== docLang;
    });
    if (document.body.getAttribute('data-page') === 'home') {
      document.title = t.name;
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', t.promotionalText);
    }
    var sel = document.getElementById('lang');
    if (sel) sel.value = lang;
  }

  function applySettings() {
    var store = document.getElementById('appStore');
    var soon = document.getElementById('soon');
    if (store) {
      store.hidden = !S.appStoreUrl;
      if (S.appStoreUrl) store.href = S.appStoreUrl;
    }
    if (soon) soon.hidden = !!S.appStoreUrl;
    var play = document.getElementById('googlePlay');
    if (play) {
      play.hidden = !S.googlePlayUrl;
      if (S.googlePlayUrl) play.href = S.googlePlayUrl;
    }
    document.querySelectorAll('.js-email').forEach(function (node) {
      if (S.contactEmail) {
        node.textContent = S.contactEmail;
        if (node.tagName === 'A') node.href = 'mailto:' + S.contactEmail;
      } else node.textContent = '(e-posta: site-ayarlari.js)';
    });
    document.querySelectorAll('.js-dev').forEach(function (node) {
      node.textContent = S.developerName || 'Ok Kaçış';
    });
    document.querySelectorAll('.js-year').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function loadAdsense() {
    if (!S.adsenseClient || document.body.getAttribute('data-ads') === 'off') return;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(S.adsenseClient);
    document.head.appendChild(s);
  }

  function startBackground() {
    var canvas = document.getElementById('bg');
    if (!canvas || !window.OkBackground) return;
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function theme() {
      var cs = getComputedStyle(document.documentElement);
      window.OkBackground.setTheme({
        grid: cs.getPropertyValue('--grid').trim(),
        arrows: [1, 2, 3, 4, 5, 6, 7].map(function (i) {
          return cs.getPropertyValue('--a' + i).trim();
        }),
      });
    }
    theme();
    window.OkBackground.init(canvas, { reduced: reduced });
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', theme);
    }
  }

  var sel = document.getElementById('lang');
  if (sel) {
    Object.keys(T).forEach(function (code) {
      var o = el('option', NAMES[code] || code);
      o.value = code;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      try {
        localStorage.setItem(KEY, sel.value);
      } catch (e) {}
      apply(sel.value);
    });
  }

  apply(pickLang());
  applySettings();
  loadAdsense();
  startBackground();
})();
