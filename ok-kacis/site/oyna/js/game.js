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
  const TA = (CFG.timeAttack = Object.assign(
    { startSeconds: 60, clearBonusSeconds: 8, mistakePenaltySeconds: 3, reviveSeconds: 15, interstitialEveryNRuns: 1 },
    CFG.timeAttack || {}
  ));
  const SC = (CFG.score = Object.assign(
    { perArrowCell: 10, comboWindow: 2.4, clearBonus: 100, perfectBonus: 150 },
    CFG.score || {}
  ));
  const Fx = window.OkFx;
  const Bg = window.OkBackground;
  const Levels = window.OkLevels;
  const Sound = window.OkSound;
  const Ads = window.OkAds;
  const DEBUG = /[?&]debug\b/.test(location.search);
  const reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ------------------------------------------------------------------ Dil (metinler js/i18n.js içinde)
  const I18n = window.OkI18n;
  const t = I18n.t;

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
  const save = Object.assign({
      level: 1,
      hints: CFG.startHints,
      sound: true,
      tutorialDone: false,
      best: {},
      timeTop: [],
      levelTop: [],
      totalPts: 0,
      bestChain: 0,
    },
    readSave()
  );
  if (!Array.isArray(save.timeTop)) save.timeTop = [];
  if (!Array.isArray(save.levelTop)) save.levelTop = [];
  save.lang = I18n.set(I18n.detect(save.lang));
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
  const btnHome = $('btnHome');
  const timerEl = $('timer');
  const timerNum = $('timerNum');
  const timerBar = $('timerBar');
  const timerDelta = $('timerDelta');
  const scorebar = $('scorebar');
  const sbScore = $('sbScore');
  const sbSub = $('sbSub');
  const sbCombo = $('sbCombo');
  const sbComboVal = $('sbComboVal');
  const sbComboBar = $('sbComboBar');
  const sbScoreLabel = $('sbScoreLabel');
  const sbComboLabel = $('sbComboLabel');

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
      accent: v('--accent'),
      gold: v('--gold'),
      boardShadow: v('--board-shadow'),
    };
    Fx.setFont(v('--font-display'));
    Bg.setTheme({ grid: theme.grid, arrows: theme.arrows });
  }
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', readTheme);
  }
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ------------------------------------------------------------------ Durum
  const S = {
    mode: 'classic', // classic | time
    run: null, // zamana karşı turu
    pausedBy: '',
    points: 0, // bu seviyenin / bu turun puanı
    shownPoints: 0, // ekranda sayarak yükselen değer
    committed: false, // seviye puanı toplam puana eklendi mi
    combo: { count: 0, mult: 1, left: 0, best: 0 },
    level: 1,
    board: null,
    arrows: [],
    occ: null,
    hearts: CFG.hearts,
    mistakes: 0,
    phase: 'menu', // menu | play | paused | won | lost | timeup
    shake: 0,
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
  function setupBoard(board, phase) {
    S.board = board;
    S.mistakes = 0;
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
    S.tutorial = false;
    S.phase = phase || 'play';
    S.pausedBy = '';
    clearTimeout(S.tipTimer);
    layoutBoard();
  }

  function loadLevel(n, phase) {
    S.mode = 'classic';
    S.level = n;
    S.revivedThisLevel = false;
    S.hearts = CFG.hearts;
    resetScore();
    setupBoard(Levels.generate(n), phase);
    S.tutorial = n === 1 && !save.tutorialDone;
    renderHearts();
    updateHud();
    setTip(levelTip());
  }

  // ------------------------------------------------------------------ Zamana karşı
  // Süre azalırken art arda tahta temizlenir. Her tur farklı tahtalarla başlar,
  // tahtalar giderek büyür. Bu modda can yok: çarpmak süre kaybettirir.
  const timeLevel = (stage) => Math.min(40, 2 + stage * 2);

  function startRun() {
    S.mode = 'time';
    S.hearts = CFG.hearts;
    resetScore();
    S.run = {
      seed: (Math.random() * 2147483647) | 0,
      stage: 1,
      score: 0,
      timeLeft: TA.startSeconds,
      revived: false,
      active: true,
      lastWhole: -1,
    };
    loadStage('play');
    setTip(t('timeRules', { b: TA.clearBonusSeconds, p: TA.mistakePenaltySeconds }));
    S.tipTimer = setTimeout(() => setTip(''), 4000);
    Ads.event('gameplayStart');
  }

  function loadStage(phase) {
    const r = S.run;
    setupBoard(Levels.generate(timeLevel(r.stage), (r.seed + Math.imul(r.stage, 2654435761)) >>> 0), phase);
    updateHud();
  }

  function stageClear() {
    S.phase = 'won';
    const r = S.run;
    r.timeLeft += TA.clearBonusSeconds;
    r.stage++;
    Sound.win();
    const perfect = S.mistakes === 0;
    const bonus = SC.clearBonus + (perfect ? SC.perfectBonus : 0);
    addPoints(bonus);
    boardFireworks(perfect, bonus);
    showDelta(TA.clearBonusSeconds);
    setTip(t('stageClear', { b: TA.clearBonusSeconds }));
    updateHud();
    setTimeout(() => {
      if (S.mode !== 'time' || S.phase !== 'won' || S.run !== r) return;
      loadStage('play');
      setTip('');
    }, reducedMotion ? 300 : 1100);
  }

  function timeUp() {
    const r = S.run;
    r.timeLeft = 0;
    S.phase = 'timeup';
    if (!r.entry) r.entry = { p: 0, a: 0, b: 0, d: Date.now() };
    Object.assign(r.entry, { p: S.points, a: r.score, b: r.stage });
    const rank = pushTop(save.timeTop, r.entry);
    const record = rank === 0;
    writeSave();
    if (record) {
      confetti();
      Bg.boost(4);
    }
    clearTimeout(S.tipTimer);
    setTip('');
    Sound.lose();
    haptic(60);
    Ads.event('gameplayStop');
    updateHud();
    setTimeout(() => showTimeUp(record, rank), 450);
  }

  function showTimeUp(record, rank) {
    const r = S.run;
    const actions = [];
    if (!r.revived) {
      actions.push({
        kind: 'primary',
        icon: adsOff() ? 'play' : 'ad',
        label: adsOff() ? t('moreTimeFree', { s: TA.reviveSeconds }) : t('moreTime', { s: TA.reviveSeconds }),
        onClick: async () => {
          dialogBusy = true;
          const res = await Ads.rewarded('more_time');
          dialogBusy = false;
          if (res === true) {
            r.revived = true;
            r.timeLeft = TA.reviveSeconds;
            r.lastWhole = -1;
            hideDialog();
            S.phase = 'play';
            updateHud();
            toast(t('moreTimeToast', { s: TA.reviveSeconds }));
            Ads.event('gameplayStart');
          } else toast(res === false ? t('noReward') : t('noAd'));
        },
      });
    }
    actions.push({
      kind: r.revived ? 'primary' : 'secondary',
      icon: 'restart',
      label: t('playAgain'),
      onClick: async () => {
        dialogBusy = true;
        hideDialog();
        r.active = false;
        try {
          await Ads.maybeInterstitialAfterRun();
        } finally {
          dialogBusy = false;
        }
        startRun();
      },
    });
    actions.push({
      kind: 'ghost',
      label: t('mainMenu'),
      onClick: () => {
        r.active = false;
        S.phase = 'menu';
        showMenu();
      },
    });
    showDialog({
      variant: record ? 'record' : 'timeup',
      eyebrow: record ? t('newRecordEyebrow') : t('timeUpEyebrow'),
      title: record ? t('newRecordTitle') : t('timeUpTitle', { n: r.score }),
      points: S.points,
      badge: rank > 0 ? t('rankBadge', { n: rank + 1 }) : null,
      list: { items: timeItems(rank), empty: t('lbEmptyTime') },
      actions,
    });
  }

  function fmtTime(sec) {
    const v = Math.max(0, Math.ceil(sec));
    return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0');
  }

  let lastTimerText = '';
  function renderTimer() {
    const r = S.run;
    if (!r) return;
    const txt = fmtTime(r.timeLeft);
    if (txt !== lastTimerText) {
      lastTimerText = txt;
      timerNum.textContent = txt;
      timerEl.setAttribute('aria-label', t('aTimer', { t: txt }));
    }
    timerBar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, r.timeLeft / TA.startSeconds)) + ')';
    timerEl.classList.toggle('is-low', r.timeLeft < 10);
  }

  function showDelta(sec) {
    timerDelta.textContent = sec > 0 ? t('plusSec', { n: sec }) : t('minusSec', { n: -sec });
    timerDelta.className = 'timer-delta ' + (sec > 0 ? 'is-good' : 'is-bad');
    void timerDelta.offsetWidth;
    timerDelta.classList.add('show');
  }

  // ------------------------------------------------------------------ Puan, kombo ve patlamalar
  // Ok başına puan = hücre sayısı × perArrowCell × kombo çarpanı. Kombo,
  // comboWindow saniye içinde yeni bir ok kaçırıldıkça sürer; çarpmak bozar.
  const multFor = (c) => (c >= 15 ? 5 : c >= 10 ? 4 : c >= 6 ? 3 : c >= 3 ? 2 : 1);
  const COMBO_COLOR = [2, 2, 2, 3, 1, 4];
  let numFmt;
  let dateFmt;
  function makeFormatters() {
    numFmt = new Intl.NumberFormat(I18n.locale);
    dateFmt = new Intl.DateTimeFormat(I18n.locale, { day: 'numeric', month: 'short' });
  }
  makeFormatters();
  const fmtNum = (n) => numFmt.format(Math.round(n));
  const fmtDate = (ms) => {
    try {
      return dateFmt.format(new Date(ms));
    } catch (e) {
      return '';
    }
  };

  function restartAnim(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function resetScore() {
    S.points = 0;
    S.shownPoints = 0;
    S.committed = false;
    S.combo.count = 0;
    S.combo.mult = 1;
    S.combo.left = 0;
    S.combo.best = 0;
    sbScore.textContent = '0';
  }

  function breakCombo() {
    if (!S.combo.count) return;
    S.combo.count = 0;
    S.combo.mult = 1;
    S.combo.left = 0;
    restartAnim(sbCombo, 'is-broken');
    updateScorebar();
  }

  function addPoints(n) {
    S.points += n;
    updateScorebar();
    restartAnim(sbScore, 'bump');
  }

  function onEscape(a) {
    const c = S.combo;
    c.count = c.left > 0 ? c.count + 1 : 1;
    c.left = SC.comboWindow;
    c.best = Math.max(c.best, c.count);
    const prev = c.mult;
    c.mult = multFor(c.count);
    const pts = SC.perArrowCell * a.cells.length * c.mult;
    const head = a.cells[a.cells.length - 1];
    Fx.text(px(head[0]), py(head[1]) - cell * 0.2, '+' + fmtNum(pts), {
      color: theme.arrows[a.color % theme.arrows.length],
      outline: theme.board,
      size: 16 + 4 * c.mult,
    });
    addPoints(pts);
    Sound.whoosh(c.mult);
    if (c.mult > prev) comboUp(c.mult);
  }

  function comboUp(m) {
    const color = theme.arrows[COMBO_COLOR[Math.min(5, m)]];
    Fx.banner(t('comboBanner', { n: m }), { color, outline: theme.board, size: 44 + m * 4 });
    Fx.flash(color, 0.1 + 0.03 * m, 0.4);
    Bg.boost(m);
    const r = canvas.getBoundingClientRect();
    Bg.pulse(r.left + cw / 2, r.top + ch * 0.42, color, 0.5 + 0.15 * m);
    Sound.combo(m);
    haptic([12, 40, 18]);
    restartAnim(sbCombo, 'is-up');
  }

  /** Ok tahtanın kenarından çıktığı anda: kıvılcım, halka, arka planda dalga. */
  function edgeBurst(a) {
    const head = a.cells[a.cells.length - 1];
    const k = a.rayLen + 0.5;
    const x = px(head[0] + a.dir[0] * k);
    const y = py(head[1] + a.dir[1] * k);
    const color = theme.arrows[a.color % theme.arrows.length];
    const m = S.combo.mult;
    Fx.burst(x, y, [color, color, theme.hint], 14 + 5 * m, 360 + 60 * m, [-a.dir[0], -a.dir[1]]);
    Fx.ring(x, y, color, cell * (1.1 + 0.25 * m), 3 + m);
    const r = canvas.getBoundingClientRect();
    Bg.pulse(r.left + x, r.top + y, color, 0.25 + 0.05 * m);
  }

  /** Tahta bitince: havai fişek, konfeti, büyük yazı, bonus puan. */
  function boardFireworks(perfect, bonus) {
    const bw = cell * S.board.w;
    const bh = cell * S.board.h;
    const cx = ox + bw / 2;
    const cy = oy + bh / 2;
    Fx.confetti(cx, cy, theme.arrows, 100);
    Fx.banner(perfect ? t('perfect') : t('boardClear'), {
      color: perfect ? theme.gold : theme.accent,
      outline: theme.board,
      size: 54,
      life: 1.4,
    });
    Fx.text(cx, cy + Math.min(70, bh * 0.2), '+' + fmtNum(bonus), {
      color: theme.gold,
      outline: theme.board,
      size: 30,
      life: 1.3,
      rise: 40,
    });
    Fx.flash(theme.hint, 0.22, 0.5);
    const shots = reducedMotion ? 1 : 5;
    for (let i = 0; i < shots; i++) {
      setTimeout(() => {
        const x = ox + bw * (0.15 + Math.random() * 0.7);
        const y = oy + bh * (0.15 + Math.random() * 0.7);
        const col = theme.arrows[i % theme.arrows.length];
        Fx.burst(x, y, [col, theme.hint, theme.arrows[(i + 3) % theme.arrows.length]], 30, 560);
        Fx.ring(x, y, col, cell * 2.4, 5);
        Sound.pop(i);
      }, i * 130);
    }
    const r = canvas.getBoundingClientRect();
    Bg.pulse(r.left + cx, r.top + cy, theme.accent, 1.3);
    Bg.boost(3);
    haptic([20, 50, 20, 50, 40]);
  }

  // ------------------------------------------------------------------ Skor tablosu (bu cihazda, en iyi 5)
  function pushTop(list, entry) {
    if (!(entry.p > 0)) return -1;
    if (!list.includes(entry)) list.push(entry);
    list.sort((a, b) => b.p - a.p);
    const idx = list.indexOf(entry);
    if (list.length > 5) list.length = 5;
    return idx < 5 ? idx : -1;
  }
  const bestTime = () => (save.timeTop.length ? save.timeTop[0].p : 0);
  function timeItems(hi) {
    return save.timeTop.map((e, i) => ({
      main: fmtNum(e.p),
      sub: t('arrowsCount', { n: e.a }) + ' · ' + t('boardsCount', { n: e.b }) + ' · ' + fmtDate(e.d),
      me: i === hi,
    }));
  }
  function levelItems(hi) {
    return save.levelTop.map((e, i) => ({
      main: fmtNum(e.p),
      sub: t('lbEntryLevel', { l: e.l, s: '★'.repeat(e.s || 0), d: fmtDate(e.d) }),
      me: i === hi,
    }));
  }

  function showLeaderboard(tab) {
    const time = tab !== 'levels';
    showDialog({
      variant: 'board',
      eyebrow: t('lbEyebrow'),
      title: t('leaderboard'),
      tabs: [
        { label: t('lbTime'), active: time, onClick: () => showLeaderboard('time') },
        { label: t('lbLevels'), active: !time, onClick: () => showLeaderboard('levels') },
      ],
      list: time ? { items: timeItems(-1), empty: t('lbEmptyTime') } : { items: levelItems(-1), empty: t('lbEmptyLevels') },
      rows: time
        ? null
        : [
            [t('statTotal'), fmtNum(save.totalPts || 0)],
            [t('statLevel'), String(Math.max(0, save.level - 1))],
            [t('statChain'), String(save.bestChain || 0)],
          ],
      actions: [{ kind: 'secondary', label: t('back'), onClick: showMenu }],
    });
  }

  function updateScorebar() {
    let sub;
    let hot = false;
    if (S.mode === 'time') {
      const best = bestTime();
      if (best > 0 && S.points > best) {
        sub = t('liveRecord');
        hot = true;
      } else sub = t('bestLabel', { n: fmtNum(best) });
    } else sub = t('totalLabel', { n: fmtNum((save.totalPts || 0) + (S.committed ? 0 : S.points)) });
    if (sbSub.textContent !== sub) sbSub.textContent = sub;
    sbSub.classList.toggle('is-hot', hot);
    const m = S.combo.mult;
    sbCombo.dataset.level = String(m);
    sbComboVal.textContent = 'x' + m;
    scorebar.classList.toggle('is-fire', m >= 4 && !reducedMotion);
    sbScoreLabel.textContent = t('score');
    sbComboLabel.textContent = t('comboLabel');
  }

  let countToken = 0;
  function countUp(node, target) {
    const my = ++countToken;
    const dur = reducedMotion ? 0 : Math.min(1400, 500 + target * 0.4);
    const t0 = performance.now();
    let lastTick = 0;
    const stepFn = (now) => {
      if (my !== countToken) return;
      const u = dur ? Math.min(1, (now - t0) / dur) : 1;
      node.textContent = fmtNum(target * (1 - Math.pow(1 - u, 3)));
      if (u < 1 && now - lastTick > 70) {
        Sound.tick();
        lastTick = now;
      }
      if (u < 1) requestAnimationFrame(stepFn);
    };
    requestAnimationFrame(stepFn);
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
    if (S.phase !== 'play' || a.state !== 'idle' || (S.mode === 'classic' && S.hearts <= 0)) return;
    const now = performance.now();
    const pr = Levels.probe(S.board.w, S.board.h, S.occ, a);
    a.hintUntil = 0;
    if (pr.blocker === -1) {
      a.state = 'exit';
      a.v = 9;
      a.rayLen = pr.dist;
      a.exitEnd = pr.dist + a.len + 3;
      for (const [x, y] of a.cells) S.occ[y * S.board.w + x] = -1;
      haptic(10);
      if (S.mode === 'time') S.run.score++;
      onEscape(a);
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
    S.mistakes++;
    breakCombo();
    Fx.flash(theme.danger, 0.16, 0.3);
    if (S.mode === 'time') {
      S.run.timeLeft = Math.max(0, S.run.timeLeft - TA.mistakePenaltySeconds);
      showDelta(-TA.mistakePenaltySeconds);
    } else S.hearts = Math.max(0, S.hearts - 1);
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
    if (S.mode === 'time' || S.hearts > 0) {
      setTip(t('bumped'));
      clearTimeout(S.tipTimer);
      S.tipTimer = setTimeout(() => setTip(S.phase === 'play' && S.mode === 'classic' ? levelTip() : ''), 2400);
    }
  }

  function win() {
    S.phase = 'won';
    const perfect = S.mistakes === 0;
    const stars = perfect ? 3 : S.mistakes === 1 ? 2 : 1;
    const bonus = SC.clearBonus + (perfect ? SC.perfectBonus : 0);
    addPoints(bonus);
    boardFireworks(perfect, bonus);
    const rank = pushTop(save.levelTop, { p: S.points, l: S.level, s: stars, d: Date.now() });
    save.level = S.level + 1;
    save.best[S.level] = Math.max(save.best[S.level] || 0, stars);
    save.totalPts = (save.totalPts || 0) + S.points;
    save.bestChain = Math.max(save.bestChain || 0, S.combo.best);
    S.committed = true;
    writeSave();
    updateScorebar();
    clearTimeout(S.tipTimer);
    setTip('');
    Sound.win();
    Ads.event('gameplayStop');
    Ads.event('happytime');
    const level = S.level;
    const points = S.points;
    const mistakes = S.mistakes;
    const chain = S.combo.best;
    setTimeout(
      () =>
        showDialog({
          variant: 'win',
          eyebrow: t('winEyebrow'),
          title: t('winTitle', { n: level }),
          stars,
          points,
          badge: rank >= 0 && rank < 3 && save.levelTop.length > 1 ? t('rankBadge', { n: rank + 1 }) : null,
          rows: [
            [t('rowBoard'), S.board.w + '×' + S.board.h],
            [t('rowMistakes'), String(mistakes)],
            [t('rowChain'), String(chain)],
          ],
          actions: [{ kind: 'primary', icon: 'play', label: t('next'), onClick: goNext }],
        }),
      reducedMotion ? 250 : 1100
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
    const free = adsOff();
    const canRevive = !(free && S.revivedThisLevel);
    const actions = [];
    if (canRevive) {
      actions.push({
          kind: 'primary',
          icon: free ? 'play' : 'ad',
          label: free ? t('reviveFree') : t('revive'),
          onClick: async () => {
            dialogBusy = true;
            const r = await Ads.rewarded('revive');
            dialogBusy = false;
            if (r === true) {
              S.revivedThisLevel = true;
              S.hearts = 1;
              hideDialog();
              S.phase = 'play';
              renderHearts();
              updateHud();
              toast(t('revived'));
              Ads.event('gameplayStart');
            } else toast(r === false ? t('noReward') : t('noAd'));
          },
      });
    }
    actions.push({
      kind: canRevive ? 'secondary' : 'primary',
      icon: 'restart',
      label: t('restart'),
      onClick: () => {
        hideDialog();
        loadLevel(S.level, 'play');
        Ads.event('gameplayStart');
      },
    });
    showDialog({
      variant: 'fail',
      eyebrow: t('failEyebrow'),
      title: t('failTitle'),
      body: canRevive ? (free ? t('failBodyFree') : t('failBody')) : null,
      actions,
    });
  }

  // Reklamlar kapalıyken (config.js > adProvider: 'none') ödüller ücretsiz verilir
  // ve düğmelerde "reklam izle" yazmaz. Can, reklamsızken seviye başına bir kez verilir.
  const adsOff = () => Ads.name === 'none';

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
    S.pausedBy = 'hints';
    showDialog({
      eyebrow: t('hintsEyebrow'),
      title: t('hintsTitle'),
      body: adsOff() ? t('hintsBodyFree', { n: CFG.hintsPerAd }) : t('hintsBody', { n: CFG.hintsPerAd }),
      actions: [
        {
          kind: 'primary',
          icon: adsOff() ? 'play' : 'ad',
          label: adsOff() ? t('getHintsFree', { n: CFG.hintsPerAd }) : t('getHints', { n: CFG.hintsPerAd }),
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
        if (!a.burst && a.s >= a.rayLen + 0.1) {
          a.burst = true;
          edgeBurst(a);
        }
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
            if (S.mode === 'classic' && S.hearts <= 0 && S.phase === 'play') fail();
          } else a.s = a.bumpTarget * (1 - easeInOutQuad(u));
        }
      }
    }
    if (S.mode === 'time' && S.run && S.phase === 'play') {
      const r = S.run;
      r.timeLeft -= dt;
      const whole = Math.ceil(r.timeLeft);
      if (whole !== r.lastWhole) {
        if (whole > 0 && whole <= 5 && r.lastWhole !== -1) Sound.clock();
        r.lastWhole = whole;
      }
      if (r.timeLeft <= 0) timeUp();
      renderTimer();
    }
    if (S.phase === 'play' && S.arrows.length && S.arrows.every((a) => a.state === 'gone')) {
      if (S.mode === 'time') stageClear();
      else win();
    }

    Fx.update(dt);
    if (S.phase === 'play' && S.combo.left > 0) {
      S.combo.left -= dt;
      if (S.combo.left <= 0) {
        S.combo.left = 0;
        S.combo.count = 0;
        S.combo.mult = 1;
        updateScorebar();
      }
    }
    sbComboBar.style.transform = 'scaleX(' + (S.combo.left / SC.comboWindow).toFixed(3) + ')';
    if (S.shownPoints !== S.points) {
      const diff = S.points - S.shownPoints;
      S.shownPoints = Math.abs(diff) < 1 ? S.points : S.shownPoints + diff * Math.min(1, dt * 10);
      sbScore.textContent = fmtNum(S.shownPoints);
    }
  }

  function confetti() {
    if (!S.board) return;
    Fx.confetti(ox + (cell * S.board.w) / 2, oy + (cell * S.board.h) / 2, theme.arrows, 100);
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
    ctx.save();
    ctx.shadowColor = theme.boardShadow;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = theme.board;
    roundRect(ox - 8, oy - 8, bw + 16, bh + 16, 10);
    ctx.fill();
    ctx.restore();

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

    Fx.draw(ctx, cw, ch);
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
    clock: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M9.5 3h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4"/>',
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
    const timed = S.mode === 'time' && !!S.run;
    $('lvLabel').textContent = timed ? t('boardLabel') : t('level');
    $('lvNum').textContent = String(timed ? S.run.stage : S.level);
    $('lvSize').textContent = t('size', { w: S.board.w, h: S.board.h });
    $('lvLeft').textContent = t('left', { n: aliveCount() });
    heartsEl.hidden = timed;
    timerEl.hidden = !timed;
    if (timed) renderTimer();
    btnHome.setAttribute('aria-label', t('aHome'));
    const badge = $('hintBadge');
    badge.textContent = save.hints > 0 ? String(save.hints) : '+';
    badge.classList.toggle('is-empty', save.hints <= 0);
    btnHint.setAttribute('aria-label', t('aHint', { n: save.hints }));
    btnRestart.setAttribute('aria-label', t('aRestart'));
    btnSound.setAttribute('aria-pressed', String(!!save.sound));
    btnSound.setAttribute('aria-label', save.sound ? t('aSoundOn') : t('aSoundOff'));
    btnSound.classList.toggle('is-off', !save.sound);
    updateScorebar();
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
    if (o.corner) {
      const c = el('button', 'card-corner');
      c.type = 'button';
      c.setAttribute('aria-label', o.corner.aria + ': ' + o.corner.label);
      c.appendChild(svgIcon(o.corner.icon));
      c.appendChild(el('span', null, o.corner.label));
      c.addEventListener('click', () => {
        Sound.unlock();
        Sound.tick();
        o.corner.onClick();
      });
      card.appendChild(c);
    }
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
    if (o.tabs) {
      const tabs = el('div', 'tabs');
      tabs.setAttribute('role', 'tablist');
      for (const tb of o.tabs) {
        const b = el('button', 'tab' + (tb.active ? ' is-active' : ''), tb.label);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(!!tb.active));
        b.addEventListener('click', () => {
          Sound.tick();
          tb.onClick();
        });
        tabs.appendChild(b);
      }
      card.appendChild(tabs);
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
    if (o.points != null) {
      const box = el('div', 'card-points');
      const val = el('span', 'cp-value', '0');
      box.appendChild(val);
      box.appendChild(el('span', 'cp-label', t('pointsUnit')));
      card.appendChild(box);
      countUp(val, o.points);
    }
    if (o.badge) card.appendChild(el('p', 'card-badge', o.badge));
    if (o.body) card.appendChild(el('p', 'card-body', o.body));
    if (o.choices) {
      const grid = el('div', 'lang-grid');
      for (const c of o.choices) {
        const b = el('button', 'lang-btn' + (c.active ? ' is-active' : ''), c.label);
        b.type = 'button';
        b.lang = c.lang;
        b.setAttribute('aria-pressed', String(!!c.active));
        b.addEventListener('click', () => {
          Sound.unlock();
          Sound.tick();
          c.onClick();
        });
        grid.appendChild(b);
      }
      card.appendChild(grid);
    }
    if (o.list) {
      if (!o.list.items.length) card.appendChild(el('p', 'lb-empty', o.list.empty));
      else {
        const ol = el('ol', 'lb');
        for (const it of o.list.items) {
          const li = el('li', it.me ? 'is-me' : null);
          li.appendChild(el('span', 'lb-rank', String(ol.childElementCount + 1)));
          li.appendChild(el('span', 'lb-sub', it.sub));
          li.appendChild(el('span', 'lb-main', it.main));
          ol.appendChild(li);
        }
        card.appendChild(ol);
      }
    }
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
    const paused = S.phase === 'paused' && S.pausedBy === 'menu';
    const classicResume = paused && S.mode === 'classic';
    const timeResume = paused && S.mode === 'time' && !!S.run && S.run.active;
    let timeSub = t('timeSubNew', { s: TA.startSeconds });
    if (timeResume) timeSub = t('timeSubResume', { t: fmtTime(S.run.timeLeft) });
    else if (bestTime()) timeSub = t('timeSubBest', { n: fmtNum(bestTime()) });
    showDialog({
      variant: 'menu',
      eyebrow: t('menuEyebrow'),
      title: t('gameTitle'),
      corner: { label: I18n.lang.toUpperCase(), icon: 'globe', aria: t('language'), onClick: showLanguages },
      body: t('howto'),
      actions: [
        {
          kind: 'primary',
          icon: 'play',
          label: classicResume ? t('resume') : t('play'),
          sub: t('playLevel', { n: classicResume ? S.level : save.level }),
          onClick: classicResume ? resumeGame : startClassic,
        },
        {
          kind: 'secondary',
          icon: 'clock',
          label: timeResume ? t('resume') : t('modeTime'),
          sub: timeSub,
          onClick: timeResume ? resumeGame : startTimeAttack,
        },
        { kind: 'ghost', icon: 'trophy', label: t('leaderboard'), onClick: () => showLeaderboard('time') },
      ],
    });
  }

  function showLanguages() {
    showDialog({
      variant: 'lang',
      title: t('language'),
      choices: I18n.LANGS.map((l) => ({
        label: l.name,
        lang: l.code,
        active: l.code === I18n.lang,
        onClick: () => setLang(l.code),
      })),
      actions: [{ kind: 'secondary', label: t('back'), onClick: showMenu }],
    });
  }

  function setLang(code) {
    save.lang = I18n.set(code);
    writeSave();
    makeFormatters();
    readTheme();
    applyStatic();
    updateHud();
    setTip(S.mode === 'classic' ? levelTip() : '');
    if (bannerShown && Ads.name === 'mock') Ads.showBanner(bannerSlot);
    showMenu();
  }

  /** HTML'de sabit duran erişilebilirlik etiketleri. */
  function applyStatic() {
    canvas.setAttribute('aria-label', t('aBoard'));
    scorebar.setAttribute('aria-label', t('aScore'));
    bannerSlot.setAttribute('aria-label', t('aAd'));
  }

  let bannerShown = false;
  function ensureBanner() {
    if (bannerShown) return;
    bannerShown = true;
    Ads.showBanner(bannerSlot);
  }

  function startClassic() {
    hideDialog();
    if (S.run) S.run.active = false;
    ensureBanner();
    // açılışta menünün arkasında hazırlanan tahtayı kullan
    if (S.mode === 'classic' && S.phase === 'menu' && S.board && S.level === save.level) {
      S.phase = 'play';
      setTip(levelTip());
    } else loadLevel(save.level, 'play');
    Ads.event('gameplayStart');
  }

  function startTimeAttack() {
    hideDialog();
    ensureBanner();
    startRun();
  }

  function resumeGame() {
    hideDialog();
    S.phase = 'play';
    S.pausedBy = '';
    Ads.event('gameplayStart');
  }

  btnHint.addEventListener('click', () => {
    Sound.unlock();
    onHint();
  });
  btnRestart.addEventListener('click', () => {
    Sound.unlock();
    if (S.phase !== 'play') return;
    Sound.tick();
    if (S.mode === 'time') startRun();
    else loadLevel(S.level, 'play');
  });
  btnHome.addEventListener('click', () => {
    Sound.unlock();
    if (S.phase !== 'play') return;
    Sound.tick();
    S.phase = 'paused';
    S.pausedBy = 'menu';
    Ads.event('gameplayStop');
    showMenu();
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
    if (e.key === 'Escape' && !overlay.hidden && S.phase === 'paused' && !dialogBusy) resumeGame();
  });

  // ------------------------------------------------------------------ Açılış
  function boot(hotData) {
    if (!hadSave && hotData && hotData.level) {
      save.level = hotData.level;
      if (typeof hotData.hints === 'number') save.hints = hotData.hints;
    }
    Sound.setEnabled(save.sound);
    Fx.setReduced(reducedMotion);
    readTheme();
    Bg.init($('bg'), { reduced: reducedMotion });
    applyStatic();
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
        leaderboard: (tab) => showLeaderboard(tab),
        setLang: (code) => setLang(code),
        startRun: () => {
          hideDialog();
          startRun();
        },
        setTime: (sec) => {
          if (S.run) S.run.timeLeft = sec;
        },
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
