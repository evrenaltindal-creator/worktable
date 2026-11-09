/*
 * Ok Kaçış — efektler: kıvılcım patlamaları, şok halkaları, konfeti, uçan puan
 * yazıları, ortada patlayan büyük yazılar ve ekran parlaması.
 * Oyun tuvalinin üstüne çizilir; koordinatlar tuval pikselidir.
 */
(function (root) {
  'use strict';

  const MAX_PARTS = 700;
  const parts = [];
  const rings = [];
  const texts = [];
  let flash = null;
  let reduced = false;
  let displayFont = '"Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif';

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const Fx = {
    setReduced(v) {
      reduced = !!v;
    },
    setFont(f) {
      if (f) displayFont = f;
    },
    clear() {
      parts.length = 0;
      rings.length = 0;
      texts.length = 0;
      flash = null;
    },

    /** Kıvılcım patlaması. dir verilirse o yöne doğru koni şeklinde saçılır. */
    burst(x, y, colors, n, power, dir) {
      if (reduced) n = Math.min(n, 5);
      const base = dir ? Math.atan2(dir[1], dir[0]) : 0;
      for (let i = 0; i < n && parts.length < MAX_PARTS; i++) {
        const ang = dir ? base + rand(-1.15, 1.15) : Math.random() * Math.PI * 2;
        const sp = rand(0.3, 1) * (power || 420);
        const life = rand(0.35, 0.85);
        parts.push({
          kind: Math.random() < 0.3 ? 'shard' : 'spark',
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life,
          max: life,
          size: rand(2, 4.5),
          color: colors[i % colors.length],
          drag: 3.4,
          g: 260,
          rot: rand(0, 6),
          vr: rand(-14, 14),
        });
      }
    },

    confetti(x, y, colors, n) {
      if (reduced) return;
      for (let i = 0; i < n && parts.length < MAX_PARTS; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = rand(250, 780);
        const life = rand(1.3, 2.3);
        parts.push({
          kind: 'confetti',
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 420,
          life,
          max: life,
          size: rand(6, 12),
          color: colors[i % colors.length],
          drag: 0.6,
          g: 1300,
          rot: rand(0, 6),
          vr: rand(-14, 14),
        });
      }
    },

    ring(x, y, color, radius, width) {
      rings.push({ x, y, color, max: radius, w: width || 4, t: 0, life: reduced ? 0.25 : 0.5 });
    },

    /** Yükselerek kaybolan küçük yazı (ör. "+40"). */
    text(x, y, str, o) {
      o = o || {};
      texts.push({
        x,
        y,
        str,
        color: o.color || '#000',
        outline: o.outline || null,
        size: o.size || 20,
        t: 0,
        life: o.life || 0.9,
        rise: o.rise == null ? 64 : o.rise,
        center: false,
        tilt: 0,
      });
    },

    /** Ekranın ortasında büyüyüp patlayan büyük yazı (ör. "KOMBO x3!"). */
    banner(str, o) {
      o = o || {};
      for (let i = texts.length - 1; i >= 0; i--) if (texts[i].center) texts.splice(i, 1);
      texts.push({
        x: 0,
        y: 0,
        str,
        color: o.color || '#000',
        outline: o.outline || null,
        size: o.size || 52,
        t: 0,
        life: o.life || 1.15,
        rise: 26,
        center: true,
        yFrac: o.yFrac == null ? 0.42 : o.yFrac,
        tilt: reduced ? 0 : rand(-0.07, 0.07),
      });
    },

    flash(color, alpha, life) {
      if (reduced) alpha *= 0.4;
      flash = { color, a: alpha, t: 0, life: life || 0.35 };
    },

    update(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const k = Math.exp(-p.drag * dt);
        p.vx *= k;
        p.vy = p.vy * k + p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.life -= dt;
        if (p.life <= 0) parts.splice(i, 1);
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].t += dt;
        if (rings[i].t >= rings[i].life) rings.splice(i, 1);
      }
      for (let i = texts.length - 1; i >= 0; i--) {
        texts[i].t += dt;
        if (texts[i].t >= texts[i].life) texts.splice(i, 1);
      }
      if (flash) {
        flash.t += dt;
        if (flash.t >= flash.life) flash = null;
      }
    },

    draw(ctx, w, h) {
      if (flash) {
        ctx.globalAlpha = flash.a * (1 - flash.t / flash.life);
        ctx.fillStyle = flash.color;
        ctx.fillRect(-20, -20, w + 40, h + 40);
        ctx.globalAlpha = 1;
      }

      for (const r of rings) {
        const u = r.t / r.life;
        const e = 1 - Math.pow(1 - u, 3);
        ctx.globalAlpha = (1 - u) * 0.9;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.w * (1 - u) + 0.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 4 + r.max * e, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.lineCap = 'round';
      for (const p of parts) {
        const a = clamp01(p.life / (p.kind === 'confetti' ? 0.5 : p.max));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        if (p.kind === 'spark') {
          // hız yönünde kısa çizgi: kıvılcım izi
          const sp = Math.hypot(p.vx, p.vy) || 1;
          const len = Math.min(18, 3 + sp * 0.03);
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (p.vx / sp) * len, p.y - (p.vy / sp) * len);
          ctx.stroke();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.kind === 'confetti') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          else {
            const s = p.size * 1.6;
            ctx.beginPath();
            ctx.moveTo(s, 0);
            ctx.lineTo(-s * 0.6, s * 0.6);
            ctx.lineTo(-s * 0.6, -s * 0.6);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      for (const tx of texts) {
        const u = tx.t / tx.life;
        let scale;
        if (tx.center) {
          const pop = clamp01(tx.t / 0.28);
          scale = 0.35 + 0.65 * easeOutBack(pop);
          if (u > 0.75) scale *= 1 + (u - 0.75) * 0.8;
        } else scale = 0.6 + 0.4 * easeOutBack(clamp01(tx.t / 0.18));
        const alpha = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
        const size = tx.center ? Math.min(tx.size, w * 0.13) : tx.size;
        ctx.font = '800 ' + Math.round(size) + 'px ' + displayFont;
        // yazı tuvalin kenarından taşmasın
        const half = (ctx.measureText(tx.str).width / 2) * 1.15 + size * 0.2;
        let x = tx.center ? w / 2 : tx.x;
        x = Math.max(half, Math.min(w - half, x));
        let y = (tx.center ? h * tx.yFrac : tx.y) - tx.rise * (1 - Math.pow(1 - u, 2));
        y = Math.max(size * 0.7, Math.min(h - size * 0.7, y));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tx.tilt);
        ctx.scale(scale, scale);
        ctx.globalAlpha = clamp01(alpha);
        if (tx.outline) {
          ctx.strokeStyle = tx.outline;
          ctx.lineWidth = Math.max(3, size * 0.2);
          ctx.strokeText(tx.str, 0, 0);
        }
        ctx.fillStyle = tx.color;
        ctx.fillText(tx.str, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };

  root.OkFx = Fx;
})(window);
