/*
 * Ok Kaçış — ses efektleri. Dosya gerektirmez; sesler Web Audio ile anında
 * üretilir. Reklam oynarken oyun sesi kısılır (setDucked).
 */
(function (root) {
  'use strict';

  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let enabled = true;
  let ducked = false;
  const VOLUME = 0.5;

  function ensure() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch (e) {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = enabled && !ducked ? VOLUME : 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function apply() {
    if (master) master.gain.setTargetAtTime(enabled && !ducked ? VOLUME : 0, ctx.currentTime, 0.02);
  }

  function tone(o) {
    if (!enabled || ducked) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + o.dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.03);
  }

  function noise(o) {
    if (!enabled || ducked) return;
    const c = ensure();
    if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t0 = c.currentTime + (o.delay || 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(o.f0, t0);
    filter.frequency.exponentialRampToValueAtTime(o.f1 || o.f0, t0 + o.dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + o.dur + 0.03);
  }

  root.OkSound = {
    /** İlk dokunuşta çağrılmalı: tarayıcılar sesi ancak kullanıcı etkileşiminden sonra açar. */
    unlock() {
      ensure();
    },
    setEnabled(v) {
      enabled = !!v;
      apply();
    },
    setDucked(v) {
      ducked = !!v;
      apply();
    },
    whoosh() {
      noise({ f0: 500, f1: 3400, dur: 0.24, vol: 0.32 });
      tone({ type: 'triangle', f0: 360, f1: 920, dur: 0.14, vol: 0.1 });
    },
    bump() {
      tone({ type: 'sine', f0: 170, f1: 52, dur: 0.22, vol: 0.55 });
      noise({ f0: 900, f1: 280, dur: 0.07, vol: 0.22 });
    },
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone({ type: 'triangle', f0: f, dur: 0.24, vol: 0.2, delay: i * 0.09 })
      );
    },
    lose() {
      [392, 311.13, 233.08].forEach((f, i) =>
        tone({ type: 'triangle', f0: f, f1: f * 0.96, dur: 0.3, vol: 0.18, delay: i * 0.15 })
      );
    },
    tick() {
      tone({ type: 'square', f0: 880, dur: 0.035, vol: 0.05 });
    },
  };
})(window);
