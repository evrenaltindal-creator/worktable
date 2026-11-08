/*
 * Ok Kaçış — oyun döngüsü, çizim, dokunma ve ekranlar.
 * Bağımlılıklar: config.js (OK_KACIS_CONFIG), levels.js (OkLevels),
 * sound.js (OkSound), ads.js (OkAds)
 */
(function () {
  'use strict';

  const CFG = Object.assign(
    { hearts: 3, startHints: 3, hintsPerAd: 3, banner: true },
    window.OK_KACIS_CONFIG || {}
  );
  const Levels = window.OkLevels;
  const Sound = window.OkSound;
  const Ads = window.OkAds;
  const DEBUG = /[?&]debug\b/.test(location.search);
  const reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ------------------------------------------------------------------ Dil
  const lang = (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  const STRINGS = {
    tr: {
      level: 'SEVİYE',
      size: '{w}×{h}',
      left: '{n} ok',
      menuEyebrow: 'BULMACA',
      howto: 'Bir oka dokun. Önü boşsa kayıp çıkar. Önünde başka bir ok varsa çarpar ve bir can gider.',
      play: 'Oyna',
      playLevel: 'Seviye {n}',
      tip1: 'Önü açık bir oka dokun.',
      tip2: 'Önü kapalı oklara dokunma, can gider.',
      bumped: 'Çarptı! Önce yolundaki oku çıkar.',
      winEyebrow: 'TAMAMLANDI',
      winTitle: 'Seviye {n} bitti',
      next: 'Sonraki seviye',
      rowBoard: 'TAHTA',
      rowMistakes: 'HATA',
      failEyebrow: 'CAN: 0',
      failTitle: 'Canın bitti',
      failBody: 'Tahta olduğu gibi kalır. Kısa bir reklam izle, 1 canla devam et.',
      revive: 'Reklam izle, +1 can',
      restart: 'Baştan başla',
      hintsEyebrow: 'İPUCU: 0',
      hintsTitle: 'İpucun kalmadı',
      hintsBody: 'Kısa bir reklam izle, {n} ipucu kazan.',
      getHints: 'Reklam izle, +{n} ipucu',
      cancel: 'Vazgeç',
      noAd: 'Şu an reklam yok. Biraz sonra tekrar dene.',
      noReward: 'Ödül için reklamı sonuna kadar izle.',
      hintsAdded: '+{n} ipucu eklendi',
      revived: '+1 can. Devam!',
      aHint: 'İpucu göster ({n} kaldı)',
      aRestart: 'Seviyeyi baştan başlat',
      aSoundOn: 'Sesi kapat',
      aSoundOff: 'Sesi aç',
      aHearts: '{n} can kaldı',
    },
    en: {
      level: 'LEVEL',
      size: '{w}×{h}',
      left: '{n} arrows',
      menuEyebrow: 'PUZZLE',
      howto: 'Tap an arrow. If its path is clear it slides out. If another arrow is in the way it crashes and you lose a heart.',
      play: 'Play',
      playLevel: 'Level {n}',
      tip1: 'Tap an arrow with a clear path.',
      tip2: 'Blocked arrows cost a heart.',
      bumped: 'Crash! Clear the arrow in its way first.',
      winEyebrow: 'CLEARED',
      winTitle: 'Level {n} done',
      next: 'Next level',
      rowBoard: 'BOARD',
      rowMistakes: 'MISTAKES',
      failEyebrow: 'HEARTS: 0',
      failTitle: 'Out of hearts',
      failBody: 'The board stays as it is. Watch a short ad to continue with 1 heart.',
      revive: 'Watch ad, +1 heart',
      restart: 'Restart',
      hintsEyebrow: 'HINTS: 0',
      hintsTitle: 'No hints left',
      hintsBody: 'Watch a short ad to get {n} hints.',
      getHints: 'Watch ad, +{n} hints',
      cancel: 'Not now',
      noAd: 'No ad available right now. Try again in a moment.',
      noReward: 'Watch the ad to the end to get the reward.',
      hintsAdded: '+{n} hints added',
      revived: '+1 heart. Keep going!',
      aHint: 'Show a hint ({n} left)',
      aRestart: 'Restart level',
      aSoundOn: 'Mute',
      aSoundOff: 'Unmute',
      aHearts: '{n} hearts left',
    },
  };
  function t(key, vars) {
    let s = STRINGS[lang][key] != null ? STRINGS[lang][key] : STRINGS.tr[key] || key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  // ------------------------------------------------------------------ Kayıt
  const SAVE_KEY = 'okKacis.v1';
  let hadSave = false;
  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      hadSave = !!raw;
      return raw ? JSON.parse(raw) || {} : {};
    } catch (e) {
      return {};
    }
  }
  const save = Object.assign({ level: 1, hints: CFG.startHints, sound: true, tutorialDone: false, best: {} }, readSave());
  function writeSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {}
  }

  // ------------------------------------------------------------------ DOM
  const $ = (id) => document.getElementById(id);
  const canvas = $('board');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');
  const overlay = $('overlay');
  const card = $('card');
  const tipEl = $('tip');
  const toastEl = $('toast');
  const heartsEl = $('hearts');
  const bannerSlot = $('bannerSlot');
  const btnHint = $('btnHint');
  const btnRestart = $('btnRestart');
  const btnSound = $('btnSound');

  // ------------------------------------------------------------------ Tema (renkler CSS'ten okunur)
  let theme = { arrows: [] };
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    theme = {
      board: v('--board'),
      grid: v('--grid'),
      gridStrong: v('--grid-strong'),
      ink: v('--ink'),
      danger: v('--danger'),
      hint: v('--hint'),
      arrows: [1, 2, 3, 4, 5, 6, 7].map((i) => v('--a' + i)),
    };
  }
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', readTheme);
  }
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ------------------------------------------------------------------ Durum
  const S = {
    level: 1,
    board: null,
    arrows: [],
    occ: null,
    hearts: CFG.hearts,
    mistakes: 0,
    phase: 'menu', // menu | play | paused | won | lost
    shake: 0,
    particles: [],
    tutorial: false,
    tipTimer: 0,
  };
  let dialogBusy = false;

  // ------------------------------------------------------------------ Yerleşim
  let dpr = 1;
  let cw = 0;
  let ch = 0;
  let cell = 40;
  let ox = 0;
  let oy = 0;

  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cw = Math.max(1, r.width);
    ch = Math.max(1, r.height);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    layoutBoard();
  }

  function layoutBoard() {
    if (!S.board) return;
    const padX = 14;
    const padY = 40; // altta ipucu yazısına yer kalsın
    cell = Math.max(12, Math.floor(Math.min((cw - padX * 2) / S.board.w, (ch - padY * 2) / S.board.h, 76)));
    ox = Math.round((cw - cell * S.board.w) / 2);
    oy = Math.round((ch - cell * S.board.h) / 2);
  }

  // ------------------------------------------------------------------ Seviye
  function loadLevel(n, phase) {
    const board = Levels.generate(n);
    S.level = n;
    S.board = board;
    S.hearts = CFG.hearts;
    S.mistakes = 0;
    S.particles.length = 0;
    S.occ = new Int16Array(board.w * board.h).fill(-1);
    const now = performance.now();
    const cx = (board.w - 1) / 2;
    const cy = (board.h - 1) / 2;
    S.arrows = board.arrows.map((a) => {
      const head = a.cells[a.cells.length - 1];
      const path = a.cells.map((c) => c.slice());
      const ext = Math.max(board.w, board.h) + a.cells.length + 6;
      for (let j = 1; j <= ext; j++) path.push([head[0] + a.dir[0] * j, head[1] + a.dir[1] * j]);
      return {
        id: a.id,
        cells: a.cells,
        dir: a.dir,
        color: a.color,
        path,
        len: a.cells.length - 1,
        state: 'idle', // idle | bump | exit | gone
        s: 0, // yol üzerinde kaç hücre ilerledi
        v: 0,
        appearAt: now + 60 + Math.hypot(head[0] - cx, head[1] - cy) * 45,
        flashAt: -1e9,
        shakeAt: -1e9,
        hintUntil: 0,
      };
    });
    for (const a of S.arrows) for (const [x, y] of a.cells) S.occ[y * board.w + x] = a.id;
    S.tutorial = n === 1 && !save.tutorialDone;
    S.phase = phase || 'play';
    layoutBoard();
    renderHearts();
    updateHud();
    setTip(levelTip());
  }

  function levelTip() {
    if (S.level === 1) return t('tip1');
    if (S.level === 2) return t('tip2');
    return '';
  }

  function isFree(a) {
    return Levels.probe(S.board.w, S.board.h, S.occ, a).blocker === -1;
  }

  function aliveCount() {
    let n = 0;
    for (const a of S.arrows) if (a.state === 'idle' || a.state === 'bump') n++;
    return n;
  }

  // ------------------------------------------------------------------ Hamle
  function tapArrow(a) {
    if (S.phase !== 'play' || a.state !== 'idle' || S.hearts <= 0) return;
    const now = performance.now();
    const pr = Levels.probe(S.board.w, S.board.h, S.occ, a);
    a.hintUntil = 0;
    if (pr.blocker === -1) {
      a.state = 'exit';
      a.v = 9;
      a.rayLen = pr.dist;
      a.exitEnd = pr.dist + a.len + 3;
      for (const [x, y] of a.cells) S.occ[y * S.board.w + x] = -1;
      Sound.whoosh();
      haptic(10);
      if (S.tutorial) {
        S.tutorial = false;
        save.tutorialDone = true;
        writeSave();
      }
      updateHud();
    } else {
      a.state = 'bump';
      a.t0 = now;
      a.blocker = pr.blocker;
      a.hit = false;
      a.bumpTarget = pr.dist + 0.32;
      a.fwd = 0.07 + a.bumpTarget * 0.03;
      a.back = 0.16 + a.bumpTarget * 0.025;
    }
  }

  function onImpact(a, now) {
    const b = S.arrows[a.blocker];
    S.hearts = Math.max(0, S.hearts - 1);
    S.mistakes++;
    a.flashAt = now;
    if (b) {
      b.flashAt = now;
      b.shakeAt = now;
    }
    S.shake = reducedMotion ? 0 : 0.22;
    Sound.bump();
    haptic(45);
    renderHearts(true);
    updateHud();
    if (S.hearts > 0) {
      setTip(t('bumped'));
      clearTimeout(S.tipTimer);
      S.tipTimer = setTimeout(() => setTip(S.phase === 'play' ? levelTip() : ''), 2400);
    }
  }

  function win() {
    S.phase = 'won';
    const stars = S.mistakes === 0 ? 3 : S.mistakes === 1 ? 2 : 1;
    save.level = S.level + 1;
    save.best[S.level] = Math.max(save.best[S.level] || 0, stars);
    writeSave();
    clearTimeout(S.tipTimer);
    setTip('');
    Sound.win();
    confetti();
    Ads.event('gameplayStop');
    Ads.event('happytime');
    const level = S.level;
    setTimeout(
      () =>
        showDialog({
          variant: 'win',
          eyebrow: t('winEyebrow'),
          title: t('winTitle', { n: level }),
          stars,
          rows: [
            [t('rowBoard'), S.board.w + '×' + S.board.h],
            [t('rowMistakes'), String(S.mistakes)],
          ],
          actions: [{ kind: 'primary', icon: 'play', label: t('next'), onClick: goNext }],
        }),
      reducedMotion ? 250 : 800
    );
  }

  async function goNext() {
    dialogBusy = true;
    hideDialog();
    try {
      await Ads.maybeInterstitial(S.level);
    } finally {
      dialogBusy = false;
    }
    loadLevel(save.level, 'play');
    Ads.event('gameplayStart');
  }

  function fail() {
    S.phase = 'lost';
    clearTimeout(S.tipTimer);
    setTip('');
    Sound.lose();
    Ads.event('gameplayStop');
    setTimeout(showFail, 450);
  }

  function showFail() {
    showDialog({
      variant: 'fail',
      eyebrow: t('failEyebrow'),
      title: t('failTitle'),
      body: t('failBody'),
      actions: [
        {
          kind: 'primary',
          icon: 'ad',
          label: t('revive'),
          onClick: async () => {
            dialogBusy = true;
            const r = await Ads.rewarded('revive');
            dialogBusy = false;
            if (r === true) {
              S.hearts = 1;
              hideDialog();
              S.phase = 'play';
              renderHearts();
              updateHud();
              toast(t('revived'));
              Ads.event('gameplayStart');
            } else toast(r === false ? t('noReward') : t('noAd'));
          },
        },
        {
          kind: 'secondary',
          icon: 'restart',
          label: t('restart'),
          onClick: () => {
            hideDialog();
            loadLevel(S.level, 'play');
            Ads.event('gameplayStart');
          },
        },
      ],
    });
  }

  // ------------------------------------------------------------------ İpucu
  function onHint() {
    if (S.phase !== 'play') return;
    if (save.hints <= 0) return showNoHints();
    useHint();
  }

  function useHint() {
    const now = performance.now();
    if (S.arrows.some((a) => a.state === 'idle' && a.hintUntil > now)) return; // zaten bir ipucu yanıyor
    const free = S.arrows.filter((a) => a.state === 'idle' && isFree(a));
    if (!free.length) return;
    const a = free[Math.floor(Math.random() * free.length)];
    a.hintUntil = now + 4000;
    save.hints = Math.max(0, save.hints - 1);
    writeSave();
    Sound.tick();
    updateHud();
  }

  function showNoHints() {
    S.phase = 'paused';
    showDialog({
      eyebrow: t('hintsEyebrow'),
      title: t('hintsTitle'),
      body: t('hintsBody', { n: CFG.hintsPerAd }),
      actions: [
        {
          kind: 'primary',
          icon: 'ad',
          label: t('getHints', { n: CFG.hintsPerAd }),
          onClick: async () => {
            dialogBusy = true;
            const r = await Ads.rewarded('hints');
            dialogBusy = false;
            if (r === true) {
              save.hints += CFG.hintsPerAd;
              writeSave();
              hideDialog();
              S.phase = 'play';
              toast(t('hintsAdded', { n: CFG.hintsPerAd }));
              useHint();
            } else toast(r === false ? t('noReward') : t('noAd'));
          },
        },
        {
          kind: 'ghost',
          label: t('cancel'),
          onClick: () => {
            hideDialog();
            S.phase = 'play';
          },
        },
      ],
    });
  }

  // ------------------------------------------------------------------ Güncelleme
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

  function update(dt, now) {
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
    for (const a of S.arrows) {
      if (a.state === 'exit') {
        a.v += 85 * dt;
        a.s += a.v * dt;
        if (a.s >= a.exitEnd) a.state = 'gone';
      } else if (a.state === 'bump') {
        const tt = (now - a.t0) / 1000;
        if (tt < a.fwd) {
          a.s = a.bumpTarget * easeOutCubic(tt / a.fwd);
        } else {
          if (!a.hit) {
            a.hit = true;
            onImpact(a, now);
          }
          const u = (tt - a.fwd) / a.back;
          if (u >= 1) {
            a.s = 0;
            a.state = 'idle';
            if (S.hearts <= 0 && S.phase === 'play') fail();
          } else a.s = a.bumpTarget * (1 - easeInOutQuad(u));
        }
      }
    }
    if (S.phase === 'play' && S.arrows.length && S.arrows.every((a) => a.state === 'gone')) win();

    for (let i = S.particles.length - 1; i >= 0; i--) {
      const p = S.particles[i];
      p.vy += 1300 * dt;
      p.vx *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= dt;
      if (p.life <= 0) S.particles.splice(i, 1);
    }
  }

  function confetti() {
    if (reducedMotion || !S.board) return;
    const x = ox + (cell * S.board.w) / 2;
    const y = oy + (cell * S.board.h) / 2;
    for (let i = 0; i < 90; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 250 + Math.random() * 520;
      S.particles.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 380,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 14,
        size: 6 + Math.random() * 6,
        color: theme.arrows[i % theme.arrows.length],
        life: 1.4 + Math.random() * 0.9,
      });
    }
  }

  // ------------------------------------------------------------------ Çizim
  function pointAt(path, s) {
    const i = Math.max(0, Math.min(Math.floor(s), path.length - 2));
    const f = s - i;
    const p = path[i];
    const q = path[i + 1];
    return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  }

  function subpath(path, s0, s1) {
    const pts = [pointAt(path, s0)];
    for (let i = Math.floor(s0) + 1; i < s1; i++) pts.push(path[i]);
    pts.push(pointAt(path, s1));
    return pts;
  }

  const px = (gx) => ox + (gx + 0.5) * cell;
  const py = (gy) => oy + (gy + 0.5) * cell;

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBoard() {
    const { w, h } = S.board;
    const bw = cell * w;
    const bh = cell * h;
    ctx.fillStyle = theme.board;
    roundRect(ox - 8, oy - 8, bw + 16, bh + 16, 10);
    ctx.fill();

    // milimetrik kağıt: yarım hücre çizgileri silik, hücre çizgileri belirgin
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.grid;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const x = Math.round(ox + (i + 0.5) * cell) + 0.5;
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + bh);
    }
    for (let j = 0; j < h; j++) {
      const y = Math.round(oy + (j + 0.5) * cell) + 0.5;
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + bw, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 1; i < w; i++) {
      const x = Math.round(ox + i * cell) + 0.5;
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + bh);
    }
    for (let j = 1; j < h; j++) {
      const y = Math.round(oy + j * cell) + 0.5;
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + bw, y);
    }
    ctx.stroke();

    ctx.strokeStyle = theme.gridStrong;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(Math.round(ox) + 0.5, Math.round(oy) + 0.5, Math.round(bw), Math.round(bh));

    // köşelerde çizim kağıdı hizalama işaretleri
    const m = 14;
    const g = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    [
      [ox - g, oy - g, 1, 1],
      [ox + bw + g, oy - g, -1, 1],
      [ox - g, oy + bh + g, 1, -1],
      [ox + bw + g, oy + bh + g, -1, -1],
    ].forEach(([x, y, sx, sy]) => {
      ctx.moveTo(x, y + sy * m);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * m, y);
    });
    ctx.stroke();
  }

  function arrowGeometry(a, now) {
    const appear = clamp01((now - a.appearAt) / 260);
    if (appear <= 0) return null;
    const grow = easeOutCubic(appear);
    const s1 = a.s + a.len;
    const s0 = a.s + a.len * (1 - grow);
    let jx = 0;
    let jy = 0;
    const st = (now - a.shakeAt) / 320;
    if (st >= 0 && st < 1 && !reducedMotion) {
      const amp = (1 - st) * cell * 0.07 * Math.sin(st * 42);
      jx = amp;
      jy = amp * 0.5;
    }
    let alpha = Math.min(1, appear * 1.6);
    if (a.state === 'exit') {
      const over = a.s - a.rayLen;
      if (over > 0) alpha *= clamp01(1 - over / (a.len + 2.5));
    }
    return { pts: subpath(a.path, s0, s1), jx, jy, alpha };
  }

  function strokePath(g, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    g.pts.forEach((p, i) => {
      const X = px(p[0]) + g.jx;
      const Y = py(p[1]) + g.jy;
      if (i) ctx.lineTo(X, Y);
      else ctx.moveTo(X, Y);
    });
    ctx.stroke();
  }

  function drawHalo(a, now, g) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 180);
    ctx.globalAlpha = g.alpha * (0.35 + 0.35 * pulse);
    strokePath(g, cell * (0.62 + 0.08 * pulse), theme.hint);
    ctx.globalAlpha = 1;
  }

  function drawArrow(a, now, g) {
    let color = theme.arrows[a.color % theme.arrows.length];
    const ft = (now - a.flashAt) / 520;
    if (ft >= 0 && ft < 1 && Math.floor(ft * 6) % 2 === 0) color = theme.danger;
    ctx.globalAlpha = g.alpha;
    strokePath(g, cell * 0.3, color);

    const hp = g.pts[g.pts.length - 1];
    const hx = px(hp[0]) + g.jx;
    const hy = py(hp[1]) + g.jy;
    const dx = a.dir[0];
    const dy = a.dir[1];
    const tip = cell * 0.4;
    const back = cell * 0.05;
    const half = cell * 0.28;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = cell * 0.06;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + dx * tip, hy + dy * tip);
    ctx.lineTo(hx - dx * back - dy * half, hy - dy * back + dx * half);
    ctx.lineTo(hx - dx * back + dy * half, hy - dy * back - dx * half);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  let tutorialTarget = null;
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    if (!S.board) return;
    ctx.save();
    if (S.shake > 0) {
      const m = S.shake * 16;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    drawBoard();

    if (S.tutorial && S.phase === 'play') {
      if (!tutorialTarget || tutorialTarget.state !== 'idle') {
        tutorialTarget = S.arrows.find((a) => a.state === 'idle' && isFree(a)) || null;
      }
    } else tutorialTarget = null;

    const geo = new Map();
    for (const a of S.arrows) {
      if (a.state === 'gone') continue;
      const g = arrowGeometry(a, now);
      if (g) geo.set(a, g);
    }
    for (const [a, g] of geo) {
      if (a.state === 'idle' && (a.hintUntil > now || a === tutorialTarget)) drawHalo(a, now, g);
    }
    for (const [a, g] of geo) drawArrow(a, now, g);

    for (const p of S.particles) {
      ctx.save();
      ctx.globalAlpha = clamp01(p.life / 0.5);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    ctx.restore();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt, now);
    draw(now);
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------------ Dokunma
  function arrowAt(x, y) {
    const gx = (x - ox) / cell;
    const gy = (y - oy) / cell;
    const cx = Math.floor(gx);
    const cy = Math.floor(gy);
    const { w, h } = S.board;
    if (cx >= 0 && cy >= 0 && cx < w && cy < h) {
      const id = S.occ[cy * w + cx];
      if (id !== -1) return S.arrows[id];
    }
    // parmak hücrenin kenarına denk geldiyse en yakın oku seç
    let best = null;
    let bd = 0.75;
    for (const a of S.arrows) {
      if (a.state !== 'idle' && a.state !== 'bump') continue;
      for (const [ax, ay] of a.cells) {
        const d = Math.hypot(gx - (ax + 0.5), gy - (ay + 0.5));
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
    }
    return best;
  }

  canvas.addEventListener('pointerdown', (e) => {
    Sound.unlock();
    if (S.phase !== 'play' || !S.board) return;
    const r = canvas.getBoundingClientRect();
    const a = arrowAt(e.clientX - r.left, e.clientY - r.top);
    if (a) tapArrow(a);
  });

  function haptic(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (e) {}
  }

  // ------------------------------------------------------------------ Arayüz
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    ad: '<rect x="3" y="5" width="18" height="13" rx="2.5"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none"/><path d="M8 21h8"/>',
    restart: '<path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3"/><path d="M3.5 4v5h5"/>',
    heart:
      '<path d="M12 20.3s-7.4-4.5-9.2-9C1.5 8 3.4 4.6 6.9 4.6c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.4 3.4 4.1 6.7-1.8 4.5-9.2 9-9.2 9z"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
  };
  function svgIcon(name, cls) {
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    s.innerHTML = ICONS[name];
    return s;
  }
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderHearts(lostOne) {
    if (heartsEl.childElementCount !== CFG.hearts) {
      heartsEl.innerHTML = '';
      for (let i = 0; i < CFG.hearts; i++) heartsEl.appendChild(svgIcon('heart', 'heart'));
    }
    Array.from(heartsEl.children).forEach((h, i) => {
      const full = i < S.hearts;
      const was = h.classList.contains('is-full');
      h.classList.toggle('is-full', full);
      if (lostOne && was && !full) {
        h.classList.remove('is-lost');
        void h.getBoundingClientRect();
        h.classList.add('is-lost');
      }
    });
    heartsEl.setAttribute('aria-label', t('aHearts', { n: S.hearts }));
  }

  function updateHud() {
    if (!S.board) return;
    $('lvLabel').textContent = t('level');
    $('lvNum').textContent = String(S.level);
    $('lvSize').textContent = t('size', { w: S.board.w, h: S.board.h });
    $('lvLeft').textContent = t('left', { n: aliveCount() });
    const badge = $('hintBadge');
    badge.textContent = save.hints > 0 ? String(save.hints) : '+';
    badge.classList.toggle('is-empty', save.hints <= 0);
    btnHint.setAttribute('aria-label', t('aHint', { n: save.hints }));
    btnRestart.setAttribute('aria-label', t('aRestart'));
    btnSound.setAttribute('aria-pressed', String(!!save.sound));
    btnSound.setAttribute('aria-label', save.sound ? t('aSoundOn') : t('aSoundOff'));
    btnSound.classList.toggle('is-off', !save.sound);
  }

  function setTip(msg) {
    tipEl.textContent = msg || '';
    tipEl.classList.toggle('show', !!msg);
  }

  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2400);
  }

  function showDialog(o) {
    card.innerHTML = '';
    card.className = 'card' + (o.variant ? ' card--' + o.variant : '');
    if (o.eyebrow) card.appendChild(el('p', 'card-eyebrow', o.eyebrow));
    const h = el('h2', 'card-title', o.title);
    h.id = 'cardTitle';
    card.appendChild(h);
    if (o.variant === 'menu') {
      const mark = document.createElementNS(SVG_NS, 'svg');
      mark.setAttribute('viewBox', '0 0 220 28');
      mark.setAttribute('class', 'menu-mark');
      mark.setAttribute('aria-hidden', 'true');
      mark.innerHTML =
        '<path d="M6 22 H70 V8 H150 V16 H196" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M194 6 L214 16 L194 26 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
      card.appendChild(mark);
    }
    if (o.stars != null) {
      const row = el('div', 'stars');
      row.setAttribute('role', 'img');
      row.setAttribute('aria-label', o.stars + ' / 3');
      for (let i = 0; i < 3; i++) {
        const s = svgIcon('star', 'star' + (i < o.stars ? ' is-on' : ''));
        s.style.animationDelay = 0.12 + i * 0.12 + 's';
        row.appendChild(s);
      }
      card.appendChild(row);
    }
    if (o.body) card.appendChild(el('p', 'card-body', o.body));
    if (o.rows) {
      const dl = el('dl', 'tb-table');
      for (const [k, v] of o.rows) {
        const row = el('div', 'tb-row');
        row.appendChild(el('dt', null, k));
        row.appendChild(el('dd', null, v));
        dl.appendChild(row);
      }
      card.appendChild(dl);
    }
    const acts = el('div', 'card-actions');
    let first = null;
    for (const a of o.actions || []) {
      const b = el('button', 'btn btn--' + (a.kind || 'secondary'));
      b.type = 'button';
      if (a.icon) b.appendChild(svgIcon(a.icon));
      const label = el('span', 'btn-label');
      label.appendChild(el('span', null, a.label));
      if (a.sub) label.appendChild(el('small', null, a.sub));
      b.appendChild(label);
      b.addEventListener('click', () => {
        if (dialogBusy) return;
        Sound.unlock();
        Sound.tick();
        a.onClick(b);
      });
      acts.appendChild(b);
      if (!first) first = b;
    }
    card.appendChild(acts);
    overlay.hidden = false;
    requestAnimationFrame(() => first && first.focus({ preventScroll: true }));
  }

  function hideDialog() {
    overlay.hidden = true;
  }

  function showMenu() {
    showDialog({
      variant: 'menu',
      eyebrow: t('menuEyebrow'),
      title: 'Ok Kaçış',
      body: t('howto'),
      actions: [{ kind: 'primary', icon: 'play', label: t('play'), sub: t('playLevel', { n: S.level }), onClick: startPlay }],
    });
  }

  function startPlay() {
    hideDialog();
    S.phase = 'play';
    Ads.event('gameplayStart');
    Ads.showBanner(bannerSlot);
  }

  btnHint.addEventListener('click', () => {
    Sound.unlock();
    onHint();
  });
  btnRestart.addEventListener('click', () => {
    Sound.unlock();
    if (S.phase !== 'play') return;
    Sound.tick();
    loadLevel(S.level, 'play');
  });
  btnSound.addEventListener('click', () => {
    save.sound = !save.sound;
    writeSave();
    Sound.setEnabled(save.sound);
    Ads.setSound(save.sound);
    Sound.unlock();
    Sound.tick();
    updateHud();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden && S.phase === 'paused') {
      hideDialog();
      S.phase = 'play';
    }
  });

  // ------------------------------------------------------------------ Açılış
  function boot(hotData) {
    if (!hadSave && hotData && hotData.level) {
      save.level = hotData.level;
      if (typeof hotData.hints === 'number') save.hints = hotData.hints;
    }
    Sound.setEnabled(save.sound);
    readTheme();
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);

    Ads.init(CFG, {
      pause: () => Sound.setDucked(true),
      resume: () => Sound.setDucked(false),
    }).then(() => Ads.setSound(save.sound));

    loadLevel(save.level, 'menu');
    showMenu();
    requestAnimationFrame(loop);

    if (DEBUG) {
      window.OkKacisDebug = {
        S,
        save,
        ads: Ads,
        free: () => S.arrows.filter((a) => a.state === 'idle' && isFree(a)).map((a) => a.id),
        blocked: () => S.arrows.filter((a) => a.state === 'idle' && !isFree(a)).map((a) => a.id),
        point(id) {
          const a = S.arrows[id];
          const head = a.cells[a.cells.length - 1];
          const r = canvas.getBoundingClientRect();
          return { x: r.left + px(head[0]), y: r.top + py(head[1]) };
        },
        load: (n) => loadLevel(n, 'play'),
      };
    }
  }

  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.snapshot === 'function') {
    try {
      hot.snapshot(() => ({ level: save.level, hints: save.hints }));
    } catch (e) {}
  }
  if (hot && typeof hot.ready === 'function') hot.ready(boot);
  else boot((hot && hot.data) || {});
})();
