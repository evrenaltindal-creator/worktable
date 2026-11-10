// Gizlilik/destek sayfasi: adresteki #dil ya da tarayici diline gore tek bir dili gosterir
(function () {
  var langs = ['tr', 'en', 'pt', 'de', 'fr', 'ja', 'ko'];
  function pick() {
    var h = location.hash.slice(1).toLowerCase();
    if (langs.indexOf(h) !== -1) return h;
    var stored = null;
    try { stored = (JSON.parse(localStorage.getItem('hediye-carki-v1') || 'null') || {}).lang; } catch (e) {}
    if (langs.indexOf(stored) !== -1) return stored;
    var prefs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < prefs.length; i++) {
      var base = String(prefs[i]).toLowerCase().split('-')[0];
      if (langs.indexOf(base) !== -1) return base;
    }
    return 'en';
  }
  function show() {
    var lang = pick();
    document.documentElement.lang = lang;
    langs.forEach(function (l) {
      var el = document.getElementById(l);
      if (el) el.classList.toggle('on', l === lang);
      var a = document.querySelector('.langs a[href="#' + l + '"]');
      if (a) a.setAttribute('aria-current', l === lang ? 'true' : 'false');
    });
    var h1 = document.querySelector('#' + lang + ' h1');
    if (h1) document.title = h1.textContent;
  }
  window.addEventListener('hashchange', show);
  show();
})();
