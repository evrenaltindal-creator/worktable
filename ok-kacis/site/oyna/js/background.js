/*
 * Ok Kaçış — hareketli arka plan.
 * Katmanlar: yavaşça dolaşan renkli ışık bulutları, kayan milimetrik ızgara,
 * akış alanında süzülen silik oklar ve ara sıra ekranı geçen "kayan yıldız" oklar.
 * Oyun olaylarına tepki verir: boost() hızlandırıp parlatır, pulse() bir
 * noktadan şok dalgası yayar. Hareket azaltma tercihinde durağan çizilir.
 */
(function (root) {
  'use strict';

  let canvas = null;
  let ctx = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let reduced = false;
  let theme = { grid: '#cccccc', arrows: ['#888888'] };
  let rgb = { grid: [204, 204, 204], arrows: [[136, 136, 136]] };
  let energy = 0;
  let time = Math.random() * 100;
  let last = 0;
  let nextStreak = 1.2;
  const flow = [];
  const streaks = [];
  const pulses = [];
  const DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  function toRgb(c) {
    c = (c || '').trim();
    let m = /^#([0-9a-f]{6})$/i.exec(c);
    if (m) {
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    m = /^#([0-9a-f]{3})$/i.exec(c);
    if (m) return m[1].split('').map((d) => parseInt(d + d, 16));
    m = /rgba?\(([^)]+)\)/i.exec(c);
    if (m) return m[1].split(',').slice(0, 3).map((v) => parseFloat(v));
    return [128, 128, 128];
  }
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';

  function makeFlow() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      a: Math.random() * Math.PI * 2,
      depth: 0.5 + Math.random(),
      size: 7 + Math.random() * 13,
      c: (Math.random() * 7) | 0,
      alpha: 0.13 + Math.random() * 0.2,
      len: 1 + Math.random() * 1.8,
      vx: 0,
      vy: 0,
    };
  }

  function field(x, y, t) {
    return (
      Math.sin(x * 0.0042 + t * 0.12) * 1.7 +
      Math.cos(y * 0.0037 - t * 0.09) * 1.7 +
      Math.sin((x + y) * 0.0021 + t * 0.05)
    );
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(1.5, root.devicePixelRatio || 1);
    w = root.innerWidth;
    h = root.innerHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const want = Math.round(Math.min(90, Math.max(26, (w * h) / 9500)));
    while (flow.length < want) flow.push(makeFlow());
    flow.length = want;
    if (reduced) draw();
  }

  function spawnStreak() {
    const d = DIRS[(Math.random() * 4) | 0];
    const len = 90 + Math.random() * 200;
    let x;
    let y;
    if (d[0]) {
      x = d[0] > 0 ? -20 : w + 20;
      y = 20 + Math.random() * (h - 40);
    } else {
      y = d[1] > 0 ? -20 : h + 20;
      x = 20 + Math.random() * (w - 40);
    }
    streaks.push({ x, y, d, len, sp: 520 + Math.random() * 520, c: (Math.random() * 7) | 0, width: 3 + Math.random() * 4 });
  }

  function step(dt) {
    time += dt;
    energy = Math.max(0, energy - dt * 0.4);
    const speedMul = 1 + energy * 3;
    const margin = 40;
    for (const f of flow) {
      const target = field(f.x, f.y, time);
      const da = Math.atan2(Math.sin(target - f.a), Math.cos(target - f.a));
      f.a += da * Math.min(1, dt * 1.2);
      const sp = (10 + 18 * f.depth) * speedMul;
      f.x += (Math.cos(f.a) * sp + f.vx) * dt;
      f.y += (Math.sin(f.a) * sp + f.vy) * dt;
      const k = Math.exp(-2.5 * dt);
      f.vx *= k;
      f.vy *= k;
      if (f.x < -margin) f.x += w + margin * 2;
      else if (f.x > w + margin) f.x -= w + margin * 2;
      if (f.y < -margin) f.y += h + margin * 2;
      else if (f.y > h + margin) f.y -= h + margin * 2;
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt;
      if (p.t > 1.1) pulses.splice(i, 1);
    }
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      s.x += s.d[0] * s.sp * dt;
      s.y += s.d[1] * s.sp * dt;
      if (s.x < -s.len - 60 || s.x > w + s.len + 60 || s.y < -s.len - 60 || s.y > h + s.len + 60) streaks.splice(i, 1);
    }
    nextStreak -= dt * (1 + energy * 4);
    if (nextStreak <= 0) {
      spawnStreak();
      nextStreak = 1.8 + Math.random() * 3.2;
    }
  }

  function arrowGlyph(x, y, ang, size, len) {
    const cx = Math.cos(ang);
    const cy = Math.sin(ang);
    const tail = size * len;
    ctx.beginPath();
    ctx.moveTo(x - cx * tail, y - cy * tail);
    ctx.lineTo(x, y);
    ctx.stroke();
    const hs = size * 0.55;
    ctx.beginPath();
    ctx.moveTo(x + cx * hs, y + cy * hs);
    ctx.lineTo(x - cx * hs * 0.4 - cy * hs * 0.8, y - cy * hs * 0.4 + cx * hs * 0.8);
    ctx.lineTo(x - cx * hs * 0.4 + cy * hs * 0.8, y - cy * hs * 0.4 - cx * hs * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cols = rgb.arrows.length ? rgb.arrows : [[128, 128, 128]];

    // 1) ışık bulutları
    const big = Math.max(w, h);
    for (let i = 0; i < 3; i++) {
      const c = cols[[0, 2, 4][i] % cols.length];
      const cx = w * (0.5 + 0.42 * Math.cos(time * 0.07 + i * 2.1));
      const cy = h * (0.5 + 0.36 * Math.sin(time * 0.05 + i * 1.7));
      const r = big * (0.42 + 0.08 * i);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgba(c, Math.min(0.36, 0.19 + energy * 0.1)));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // 2) kayan milimetrik ızgara
    const gs = 56;
    const gx = (time * 7) % gs;
    const gy = (time * 4.5) % gs;
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(rgb.grid, 0.55);
    ctx.beginPath();
    for (let x = gx - gs; x < w + gs; x += gs) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = gy - gs; y < h + gs; y += gs) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();

    // 3) şok dalgaları
    for (const p of pulses) {
      const u = p.t / 1.1;
      ctx.strokeStyle = rgba(p.c, (1 - u) * 0.35 * p.k);
      ctx.lineWidth = 3 + 10 * (1 - u);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20 + u * big * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4) süzülen oklar
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const f of flow) {
      const c = cols[f.c % cols.length];
      const a = Math.min(0.55, f.alpha * (1 + energy * 1.2));
      ctx.strokeStyle = rgba(c, a);
      ctx.fillStyle = rgba(c, a);
      ctx.lineWidth = Math.max(1.5, f.size * 0.22);
      arrowGlyph(f.x, f.y, f.a, f.size, f.len);
    }

    // 5) kayan yıldız oklar
    for (const s of streaks) {
      const c = cols[s.c % cols.length];
      const tx = s.x - s.d[0] * s.len;
      const ty = s.y - s.d[1] * s.len;
      const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
      g.addColorStop(0, rgba(c, 0));
      g.addColorStop(1, rgba(c, 0.5));
      ctx.strokeStyle = g;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.fillStyle = rgba(c, 0.55);
      const hs = s.width * 2.2;
      ctx.beginPath();
      ctx.moveTo(s.x + s.d[0] * hs * 1.3, s.y + s.d[1] * hs * 1.3);
      ctx.lineTo(s.x - s.d[1] * hs, s.y + s.d[0] * hs);
      ctx.lineTo(s.x + s.d[1] * hs, s.y - s.d[0] * hs);
      ctx.closePath();
      ctx.fill();
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt);
    draw();
    root.requestAnimationFrame(loop);
  }

  root.OkBackground = {
    init(c, opts) {
      canvas = c;
      ctx = c.getContext('2d');
      reduced = !!(opts && opts.reduced);
      resize();
      root.addEventListener('resize', resize);
      if (reduced) draw();
      else {
        last = performance.now();
        root.requestAnimationFrame(loop);
      }
    },
    setTheme(t) {
      theme = Object.assign({}, theme, t);
      rgb = { grid: toRgb(theme.grid), arrows: (theme.arrows || []).map(toRgb) };
      if (reduced) draw();
    },
    /** Kombo/başarı: arka plan hızlanır, parlar, kayan oklar çoğalır. */
    boost(level) {
      if (reduced) return;
      energy = Math.min(1.6, energy + 0.22 * (level || 1));
      for (let i = 0; i < Math.min(4, level || 1); i++) spawnStreak();
    },
    /** Ekran koordinatında bir noktadan şok dalgası; oklar dışa itilir. */
    pulse(x, y, color, strength) {
      if (reduced) return;
      const k = strength == null ? 1 : strength;
      pulses.push({ x, y, t: 0, k, c: toRgb(color) });
      const reach = 520 * Math.max(0.4, k);
      for (const f of flow) {
        const dx = f.x - x;
        const dy = f.y - y;
        const d = Math.hypot(dx, dy) + 1;
        const push = Math.max(0, 1 - d / reach) * 460 * k;
        f.vx += (dx / d) * push;
        f.vy += (dy / d) * push;
      }
    },
  };
})(window);
