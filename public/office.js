/**
 * Piksel ofis cizici.
 *
 * Ajanlar masalarinda oturur; bir gorev uzerinde tartisirken toplanti
 * masasina yuruyup orada calisirlar, is bitince masalarina donerler.
 * Karakterler kod ile cizilir - disaridan gorsel/asset gerektirmez.
 */

const LOGICAL_W = 420;
const LOGICAL_H = 250;

// Toplantiya sayilan gorev durumlari
const ACTIVE_TASK_STATES = ['discussing', 'in_progress', 'handed_off'];

const PALETTE = {
  wallTop: '#8f9bb3',
  wallBottom: '#7a8699',
  baseboard: '#5f6a7d',
  floorA: '#d9cfbe',
  floorB: '#d0c5b2',
  deskTop: '#9b7b52',
  deskSide: '#7a5f3d',
  monitorFrame: '#2f3640',
  screenOn: '#63d2ff',
  screenOff: '#1e272e',
  chair: '#3d4756',
  skin: '#f2c9a0',
  hair: '#3b2f2a',
  shadow: 'rgba(0,0,0,0.18)',
};

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Rengi koyulastirir/acar (gölge ve vurgu tonlari icin). */
function shade(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `rgb(${r},${g},${b})`;
}

class PixelOffice {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Piksel sanati once dusuk cozunurluklu bir tampona cizilir, sonra
    // buyutulerek ekrana basilir - boylece kenarlar net kalir.
    this.buffer = document.createElement('canvas');
    this.buffer.width = LOGICAL_W;
    this.buffer.height = LOGICAL_H;
    this.bctx = this.buffer.getContext('2d');

    this.chars = new Map();
    this.meetingIds = new Set();
    this.tick = 0;
    this.scale = 1;
    this.onAgentClick = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('click', (e) => this.handleClick(e));
    canvas.style.cursor = 'pointer';
  }

  resize() {
    const parentWidth = this.canvas.parentElement?.clientWidth || LOGICAL_W;
    const dpr = window.devicePixelRatio || 1;
    // Tam sayi olcek piksel sanatini bulanik olmaktan korur.
    this.scale = Math.max(1, Math.floor(parentWidth / LOGICAL_W)) || 1;
    if (parentWidth < LOGICAL_W) this.scale = parentWidth / LOGICAL_W;

    const cssW = LOGICAL_W * this.scale;
    const cssH = LOGICAL_H * this.scale;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.dpr = dpr;
  }

  /** Masa konumu (deskPosition) -> ofis icindeki piksel koordinati. */
  deskSlot(agent) {
    const dx = Math.max(1, Math.min(3, agent.deskPosition?.x ?? 1));
    const dy = Math.max(1, Math.min(2, agent.deskPosition?.y ?? 1));
    return { x: 46 + (dx - 1) * 86, y: 74 + (dy - 1) * 84 };
  }

  /** Toplanti masasi etrafindaki duraklar. */
  meetingSlot(index, total) {
    const cx = 350;
    const cy = 140;
    const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
    return { x: cx + Math.cos(angle) * 34, y: cy + Math.sin(angle) * 24 + 6 };
  }

  setState(agents, tasks) {
    const activeTasks = (tasks || []).filter((t) => ACTIVE_TASK_STATES.includes(t.status));
    this.meetingIds = new Set(activeTasks.flatMap((t) => t.previousAgentIds || []));

    const seen = new Set();
    for (const agent of agents) {
      seen.add(agent.id);
      let c = this.chars.get(agent.id);
      if (!c) {
        const slot = this.deskSlot(agent);
        c = { x: slot.x, y: slot.y, phase: Math.random() * 100 };
        this.chars.set(agent.id, c);
      }
      c.agent = agent;
    }
    for (const id of [...this.chars.keys()]) {
      if (!seen.has(id)) this.chars.delete(id);
    }

    // Toplantidakilerin masa etrafindaki yerlerini dagit
    const attendees = [...this.chars.entries()].filter(([id]) => this.meetingIds.has(id));
    attendees.forEach(([, c], i) => {
      const slot = this.meetingSlot(i, attendees.length);
      c.target = slot;
      c.atMeeting = true;
    });
    for (const [id, c] of this.chars) {
      if (!this.meetingIds.has(id)) {
        c.target = this.deskSlot(c.agent);
        c.atMeeting = false;
      }
    }
  }

  start() {
    const loop = () => {
      this.tick++;
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    for (const c of this.chars.values()) {
      if (!c.target) continue;
      const dx = c.target.x - c.x;
      const dy = c.target.y - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.7) {
        const speed = 1.1;
        c.x += (dx / dist) * speed;
        c.y += (dy / dist) * speed;
        c.moving = true;
        c.facingLeft = dx < -0.1;
      } else {
        c.moving = false;
      }
    }
  }

  draw() {
    const b = this.bctx;
    b.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    this.drawRoom(b);
    this.drawMeetingTable(b);

    const ordered = [...this.chars.values()].sort((a, z) => a.y - z.y);
    const seated = (c) => !c.atMeeting && !c.moving;

    // Sahibi masasinda olmayan masalar bos mobilya olarak arkada kalir
    for (const c of ordered) {
      if (!seated(c)) this.drawDeskFront(b, c);
    }

    // Karakterler (onde duranlar sonra - basit derinlik siralamasi)
    for (const c of ordered) this.drawCharacter(b, c);

    // Oturanlarin masasi karakterin onunde cizilir
    for (const c of ordered) {
      if (seated(c)) this.drawDeskFront(b, c);
    }

    // Tamponu ekrana buyuterek bas
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);

    // Yazilar tam cozunurlukte cizilir ki okunakli olsun
    ctx.scale(this.dpr, this.dpr);
    this.drawLabels(ctx);
  }

  drawRoom(b) {
    px(b, 0, 0, LOGICAL_W, 34, PALETTE.wallTop);
    px(b, 0, 26, LOGICAL_W, 8, PALETTE.wallBottom);
    px(b, 0, 34, LOGICAL_W, 3, PALETTE.baseboard);

    for (let y = 37; y < LOGICAL_H; y += 14) {
      for (let x = 0; x < LOGICAL_W; x += 14) {
        const even = ((x / 14) | 0) % 2 === ((y / 14) | 0) % 2;
        px(b, x, y, 14, 14, even ? PALETTE.floorA : PALETTE.floorB);
      }
    }

    // Duvar pencereleri
    for (const wx of [40, 150, 260]) {
      px(b, wx, 6, 46, 18, '#2f3640');
      px(b, wx + 2, 8, 42, 14, '#8fd6f5');
      px(b, wx + 22, 8, 2, 14, '#2f3640');
    }
    // Saat
    px(b, 370, 8, 14, 14, '#f5f6fa');
    px(b, 376, 11, 2, 6, '#2f3640');
  }

  /** Masa karakterin ONUNDE cizilir - boylece oturan karakter tam gorunur. */
  drawDeskFront(b, c) {
    const slot = this.deskSlot(c.agent);
    const x = slot.x;
    const y = slot.y;
    const working = c.agent.status === 'working';

    // Monitor (arkadan gorunur, masanin uzerinde durur)
    if (working) {
      // Calisirken ekranin isigi masaya vurur
      const glow = this.tick % 30 < 15 ? 'rgba(99,210,255,0.35)' : 'rgba(99,210,255,0.18)';
      b.fillStyle = glow;
      b.fillRect(x + 4, y - 10, 20, 12);
    }
    px(b, x + 8, y - 8, 14, 11, PALETTE.monitorFrame);
    px(b, x + 10, y - 6, 10, 7, working ? shade('#63d2ff', -40) : '#141a1f');
    px(b, x + 13, y + 3, 4, 2, PALETTE.monitorFrame);

    // Masa
    px(b, x - 24, y + 4, 48, 11, PALETTE.deskTop);
    px(b, x - 24, y + 14, 48, 4, PALETTE.deskSide);

    // Klavye ve kupa
    px(b, x - 17, y + 7, 16, 4, '#cfd6e4');
    px(b, x - 21, y + 6, 3, 4, '#e17055');
  }

  drawMeetingTable(b) {
    const cx = 350;
    const cy = 140;
    px(b, cx - 30, cy - 14, 60, 26, '#a9835b');
    px(b, cx - 30, cy + 10, 60, 5, '#87673f');
    px(b, cx - 22, cy - 10, 44, 18, shade('#a9835b', 18));
    // Masadaki evraklar
    px(b, cx - 14, cy - 6, 10, 8, '#f5f6fa');
    px(b, cx + 4, cy - 4, 8, 6, '#e8eaf0');
  }

  drawCharacter(b, c) {
    const a = c.agent;
    const x = Math.round(c.x);
    const y = Math.round(c.y);
    const body = a.avatarColor || '#6c5ce7';
    const walkFrame = c.moving ? Math.floor(this.tick / 7) % 2 : 0;
    const isWorking = a.status === 'working';
    const sitting = !c.moving && !c.atMeeting;

    // Golge
    b.fillStyle = PALETTE.shadow;
    b.beginPath();
    b.ellipse(x, y + 1, 7, 3, 0, 0, Math.PI * 2);
    b.fill();

    if (sitting) {
      // Sandalye (karakterin arkasinda)
      px(b, x - 7, y - 8, 14, 8, PALETTE.chair);
      px(b, x - 7, y - 16, 3, 10, PALETTE.chair);
    }

    const headY = y - 26;
    const bodyY = y - 18;

    // Bacaklar
    if (c.moving) {
      px(b, x - 4, y - 7, 3, 7, shade(body, -50));
      px(b, x + 1, y - 7 + (walkFrame ? 2 : 0), 3, 7 - (walkFrame ? 2 : 0), shade(body, -50));
    } else {
      px(b, x - 4, y - 7, 3, 7, shade(body, -50));
      px(b, x + 1, y - 7, 3, 7, shade(body, -50));
    }

    // Govde
    px(b, x - 5, bodyY, 10, 12, body);
    px(b, x - 5, bodyY + 9, 10, 3, shade(body, -25));

    // Kollar - calisirken klavyede hareket eder
    const typeOffset = isWorking && !c.moving ? (Math.floor(this.tick / 6) % 2 ? 1 : 0) : 0;
    px(b, x - 8, bodyY + 2 + typeOffset, 3, 7, shade(body, 12));
    px(b, x + 5, bodyY + 2 + (typeOffset ? 0 : 1), 3, 7, shade(body, 12));

    // Eller
    px(b, x - 8, bodyY + 8 + typeOffset, 3, 2, PALETTE.skin);
    px(b, x + 5, bodyY + 8 + (typeOffset ? 0 : 1), 3, 2, PALETTE.skin);

    // Kafa
    px(b, x - 5, headY, 10, 9, PALETTE.skin);
    px(b, x - 5, headY - 2, 10, 4, PALETTE.hair);
    px(b, x - 6, headY, 1, 4, PALETTE.hair);
    px(b, x + 5, headY, 1, 4, PALETTE.hair);

    // Gozler (goz kirpma)
    const blink = (this.tick + c.phase * 10) % 220 < 6;
    const eyeColor = '#2d3436';
    if (!blink) {
      px(b, x - 3, headY + 4, 2, 2, eyeColor);
      px(b, x + 1, headY + 4, 2, 2, eyeColor);
    } else {
      px(b, x - 3, headY + 5, 2, 1, eyeColor);
      px(b, x + 1, headY + 5, 2, 1, eyeColor);
    }

    this.drawStatusBubble(b, x, headY - 12, a.status);
  }

  drawStatusBubble(b, x, y, status) {
    if (status === 'idle') return;

    let bg = '#ffffff';
    let fg = '#2d3436';
    if (status === 'error') {
      bg = '#ff7675';
      fg = '#ffffff';
    } else if (status === 'quota_low') {
      bg = '#fdcb6e';
      fg = '#6b4c00';
    }

    px(b, x - 9, y, 18, 11, bg);
    px(b, x - 2, y + 11, 4, 2, bg);

    if (status === 'working' || status === 'discussing') {
      // Yaziyor: sirayla yanip sonen uc nokta
      const step = Math.floor(this.tick / 14) % 3;
      for (let i = 0; i < 3; i++) {
        px(b, x - 5 + i * 4, y + 5, 2, 2, i === step ? '#0984e3' : '#b2bec3');
      }
    } else {
      // Uyari isareti
      px(b, x - 1, y + 2, 2, 5, fg);
      px(b, x - 1, y + 8, 2, 2, fg);
    }
  }

  /** Isim, rol ve token cubugu - tam cozunurlukte, okunakli. */
  drawLabels(ctx) {
    const s = this.scale;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (const c of this.chars.values()) {
      if (c.atMeeting) continue;
      const a = c.agent;
      const slot = this.deskSlot(a);
      const cx = slot.x * s;
      const cy = (slot.y + 21) * s;

      ctx.font = `600 ${Math.max(9, 4.2 * s)}px system-ui, sans-serif`;
      ctx.fillStyle = '#232221';
      ctx.fillText(a.name, cx, cy);

      ctx.font = `${Math.max(8, 3.4 * s)}px system-ui, sans-serif`;
      ctx.fillStyle = '#6b6560';
      ctx.fillText(a.role, cx, cy + Math.max(10, 5 * s));

      // Token kullanim cubugu
      const ratio = a.tokenBudget ? Math.min(1, a.tokensUsed / a.tokenBudget) : 0;
      const barW = 34 * s;
      const barH = Math.max(3, 1.6 * s);
      const barX = cx - barW / 2;
      const barY = cy + Math.max(22, 11 * s);
      ctx.fillStyle = '#b9b2a6';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = ratio > 0.9 ? '#d63031' : ratio > 0.6 ? '#f39c12' : '#00b894';
      ctx.fillRect(barX, barY, Math.max(barW * ratio, ratio > 0 ? 2 : 0), barH);
    }

    // Toplanti etiketi - masanin altinda, karakterlerin altinda kalir
    if (this.meetingIds.size > 0) {
      ctx.font = `600 ${Math.max(9, 4 * s)}px system-ui, sans-serif`;
      ctx.fillStyle = '#232221';
      ctx.fillText('Toplantı', 350 * s, 176 * s);
    }
  }

  handleClick(e) {
    if (!this.onAgentClick) return;
    const rect = this.canvas.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
    const ly = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;

    let best = null;
    let bestDist = 34;
    for (const c of this.chars.values()) {
      const d = Math.hypot(c.x - lx, c.y - 16 - ly);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (best) this.onAgentClick(best.agent);
  }
}

window.PixelOffice = PixelOffice;
