/*
 * Ok Kaçış — seviye üretici.
 *
 * Her ok, ızgara üzerinde kıvrılabilen bir çizgidir (kuyruk -> baş). Oka
 * dokunulunca başı gösterdiği yöne doğru ilerler, gövdesi de arkasından gelir.
 * Başın önündeki hücreler tahtanın kenarına kadar boşsa ok kaçar; değilse
 * çarpar.
 *
 * Seviyeler ters sırayla üretilir: her yeni okun önü, o ana kadar yerleştirilen
 * oklara karşı boş olmak zorundadır. Böylece "son yerleştirilenden ilk
 * yerleştirilene" sırası her zaman geçerli bir çözümdür. Bir oku çıkarmak
 * başka bir okun yolunu asla kapatmadığı için oyuncu kilitlenmez; zorluk,
 * hangi okların önünün açık olduğunu görebilmektir.
 *
 * Aynı seviye numarası herkeste aynı tahtayı üretir (tohumlu rastgelelik).
 * Tarayıcıda window.OkLevels, Node'da require() ile kullanılır.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OkLevels = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const COLORS = 7;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashLevel(level) {
    let h = Math.imul(level >>> 0, 2654435761) >>> 0;
    h ^= h >>> 16;
    h = Math.imul(h, 0x45d9f3b) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  /** Seviye numarasına göre tahta boyutu ve zorluk ayarları. */
  function levelParams(level) {
    const n = Math.max(1, Math.floor(level));
    let w, h;
    if (n <= 15) {
      w = Math.min(10, 4 + Math.floor(n / 2.5));
      h = Math.min(13, w + Math.min(3, Math.floor(n / 4)));
    } else {
      // 15'ten sonra boyut biraz oynasın ki tahtalar birbirine benzemesin
      const r = mulberry32(hashLevel(n) ^ 0x5bd1e995);
      w = 8 + Math.floor(r() * 3);
      h = Math.min(13, w + 2 + Math.floor(r() * 2));
    }
    return {
      w,
      h,
      minLen: 2,
      maxLen: Math.min(9, 3 + Math.floor(n / 3)),
      fill: Math.min(0.95, 0.66 + n * 0.012),
      twist: Math.min(0.7, 0.2 + n * 0.025),
      pick: Math.min(6, 1 + Math.floor(n / 3)),
    };
  }

  function generate(level) {
    const n = Math.max(1, Math.floor(level));
    const p = levelParams(n);
    const rng = mulberry32(hashLevel(n));
    const { w, h } = p;
    const N = w * h;
    const occ = new Int16Array(N).fill(-1);
    const rays = new Uint16Array(N); // her hücreden geçen "kaçış yolu" sayısı
    const arrows = [];
    const idx = (x, y) => y * w + x;
    const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;

    function shuffle(list) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
      }
      return list;
    }

    function rayCells(x, y, d) {
      const out = [];
      let cx = x + d[0];
      let cy = y + d[1];
      while (inside(cx, cy)) {
        out.push(idx(cx, cy));
        cx += d[0];
        cy += d[1];
      }
      return out;
    }

    function tryBuild(hx, hy, d) {
      const ray = rayCells(hx, hy, d);
      for (const c of ray) if (occ[c] !== -1) return null;
      const raySet = new Set(ray);
      const bx = hx - d[0];
      const by = hy - d[1];
      if (!inside(bx, by) || occ[idx(bx, by)] !== -1) return null;

      const body = [[hx, hy], [bx, by]]; // baştan kuyruğa doğru
      const used = new Set([idx(hx, hy), idx(bx, by)]);
      const target = p.minLen + Math.floor(rng() * (p.maxLen - p.minLen + 1));
      let travel = d; // son hücreden başa doğru gidiş yönü

      while (body.length < target) {
        const [cx, cy] = body[body.length - 1];
        const options = [];
        for (const e of DIRS) {
          const nx = cx - e[0];
          const ny = cy - e[1];
          if (!inside(nx, ny)) continue;
          const c = idx(nx, ny);
          if (occ[c] !== -1 || used.has(c) || raySet.has(c)) continue;
          options.push({ e, nx, ny, c, straight: e[0] === travel[0] && e[1] === travel[1] });
        }
        if (!options.length) break;
        const straight = options.find((o) => o.straight);
        const turns = options.filter((o) => !o.straight);
        let next;
        if (straight && (rng() > p.twist || !turns.length)) next = straight;
        else next = turns[Math.floor(rng() * turns.length)];
        body.push([next.nx, next.ny]);
        used.add(next.c);
        travel = next.e;
      }
      if (body.length < p.minLen) return null;

      let score = 0;
      for (const [x, y] of body) score += rays[idx(x, y)];
      return { cells: body.reverse(), dir: d, ray, score: score + rng() * 0.5 };
    }

    function candidate() {
      const empties = [];
      for (let i = 0; i < N; i++) if (occ[i] === -1) empties.push(i);
      if (!empties.length) return null;
      for (let tries = 0; tries < 6; tries++) {
        const c = empties[Math.floor(rng() * empties.length)];
        const hx = c % w;
        const hy = (c / w) | 0;
        for (const d of shuffle(DIRS.slice())) {
          const a = tryBuild(hx, hy, d);
          if (a) return a;
        }
      }
      return null;
    }

    let filled = 0;
    let misses = 0;
    while (filled < N * p.fill && misses < 60) {
      // Birkaç aday arasından, mevcut okların yolunu en çok kapatanı seç:
      // ileri seviyelerde oklar birbirine daha çok kenetlenir.
      let best = null;
      for (let k = 0; k < p.pick; k++) {
        const c = candidate();
        if (c && (!best || c.score > best.score)) best = c;
      }
      if (!best) {
        misses++;
        continue;
      }
      const id = arrows.length;
      for (const [x, y] of best.cells) occ[idx(x, y)] = id;
      for (const c of best.ray) rays[c]++;
      filled += best.cells.length;
      arrows.push({ id, cells: best.cells, dir: best.dir, color: 0 });
    }

    // Yan yana duran oklar farklı renkte olsun
    const colorOf = new Int8Array(arrows.length).fill(-1);
    for (const a of arrows) {
      const banned = new Set();
      for (const [x, y] of a.cells) {
        for (const d of DIRS) {
          const nx = x + d[0];
          const ny = y + d[1];
          if (!inside(nx, ny)) continue;
          const o = occ[idx(nx, ny)];
          if (o !== -1 && o !== a.id && colorOf[o] !== -1) banned.add(colorOf[o]);
        }
      }
      const pool = [];
      for (let k = 0; k < COLORS; k++) if (!banned.has(k)) pool.push(k);
      const from = pool.length ? pool : [0, 1, 2, 3, 4, 5, 6];
      a.color = from[Math.floor(rng() * from.length)];
      colorOf[a.id] = a.color;
    }

    return { level: n, w, h, arrows };
  }

  /**
   * Okun önünde ne var? blocker: yolu kesen okun id'si (yoksa -1),
   * dist: baş ile engel (veya kenar) arasındaki boş hücre sayısı.
   */
  function probe(w, h, occ, arrow) {
    const head = arrow.cells[arrow.cells.length - 1];
    const d = arrow.dir;
    let x = head[0] + d[0];
    let y = head[1] + d[1];
    let dist = 0;
    while (x >= 0 && y >= 0 && x < w && y < h) {
      const o = occ[y * w + x];
      if (o !== -1 && o !== arrow.id) return { blocker: o, dist };
      dist++;
      x += d[0];
      y += d[1];
    }
    return { blocker: -1, dist };
  }

  /** Tahtayı açgözlü şekilde çözer; çözüm sırasını ya da null döndürür. */
  function solve(board) {
    const { w, h, arrows } = board;
    const occ = new Int16Array(w * h).fill(-1);
    for (const a of arrows) for (const [x, y] of a.cells) occ[y * w + x] = a.id;
    const alive = new Set(arrows.map((a) => a.id));
    const byId = new Map(arrows.map((a) => [a.id, a]));
    const order = [];
    let progress = true;
    while (alive.size && progress) {
      progress = false;
      for (const id of Array.from(alive)) {
        const a = byId.get(id);
        if (probe(w, h, occ, a).blocker === -1) {
          for (const [x, y] of a.cells) occ[y * w + x] = -1;
          alive.delete(id);
          order.push(id);
          progress = true;
        }
      }
    }
    return alive.size === 0 ? order : null;
  }

  return { generate, levelParams, probe, solve, DIRS, COLORS };
});
