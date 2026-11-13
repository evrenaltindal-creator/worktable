// Local, versioned group records. No network or UI dependencies.
export const KEY = "sirada-groups-v2";
export const LANGS = ["tr", "en", "pt", "de", "fr", "ja", "ko"];
const modes = ["round", "random", "balance"];
const statuses = ["assigned", "done", "skipped", "canceled"];
export function id() {
  return (
    crypto.randomUUID?.() ||
    `s${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  );
}
export const copy = (value) => JSON.parse(JSON.stringify(value));
export function empty(lang = "tr") {
  return { version: 2, lang, activeId: "", groups: [] };
}
export function group(name, names) {
  return {
    id: id(),
    name: name.trim().slice(0, 60),
    mode: "round",
    round: { number: 1, drawn: [] },
    periodStart: new Date().toISOString(),
    members: names.map((name) => ({
      id: id(),
      name: name.trim().slice(0, 60),
      weight: 1,
      available: true,
    })),
    events: [],
  };
}
export function loadPoints(g, memberId) {
  return g.events
    .filter(
      (e) =>
        e.memberId === memberId &&
        e.at >= g.periodStart &&
        ["assigned", "done"].includes(e.status),
    )
    .reduce((sum, e) => sum + e.points, 0);
}
export function candidates(g) {
  const active = g.members.filter((m) => m.available);
  if (g.mode === "round") {
    const remaining = active.filter((m) => !g.round.drawn.includes(m.id));
    return {
      members: remaining.length ? remaining : active,
      nextRound: !!active.length && !remaining.length,
    };
  }
  if (g.mode === "balance" && active.length) {
    const min = Math.min(...active.map((m) => loadPoints(g, m.id)));
    return {
      members: active.filter((m) => loadPoints(g, m.id) === min),
      minimum: min,
    };
  }
  return { members: active };
}
export function randomBelow(n) {
  const limit = 0x100000000 - (0x100000000 % n);
  const bytes = new Uint32Array(1);
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return bytes[0] % n;
}
export function assign(g, title, points, random = randomBelow) {
  const pool = candidates(g);
  if (!pool.members.length) throw new Error("noCandidates");
  if (
    !title.trim() ||
    title.length > 120 ||
    !Number.isInteger(points) ||
    points < 1 ||
    points > 5
  )
    throw new Error("invalid");
  const weights = pool.members.map((m) => (g.mode === "random" ? m.weight : 1));
  let ticket = random(weights.reduce((a, b) => a + b, 0));
  let chosen = pool.members[0];
  for (let i = 0; i < weights.length; i++) {
    if (ticket < weights[i]) {
      chosen = pool.members[i];
      break;
    }
    ticket -= weights[i];
  }
  if (pool.nextRound) g.round = { number: g.round.number + 1, drawn: [] };
  if (g.mode === "round") g.round.drawn.push(chosen.id);
  const e = {
    id: id(),
    memberId: chosen.id,
    memberName: chosen.name,
    title: title.trim(),
    points,
    status: "assigned",
    mode: g.mode,
    round: g.round.number,
    at: new Date().toISOString(),
    reason: {
      pool: pool.members.length,
      minimum: pool.minimum ?? null,
      weight: g.mode === "random" ? chosen.weight : 1,
      total: weights.reduce((a, b) => a + b, 0),
    },
  };
  g.events.unshift(e);
  return e;
}
export function setStatus(g, eventId, status) {
  if (!statuses.includes(status)) throw new Error("invalid");
  const e = g.events.find((e) => e.id === eventId);
  if (!e) throw new Error("invalid");
  e.status = status;
  e.updatedAt = new Date().toISOString();
  // Canceling a current-round assignment gives that turn back; skipping consumes it.
  if (e.mode === "round" && e.round === g.round.number) {
    const consumed = g.events.some(
      (x) =>
        x.memberId === e.memberId &&
        x.mode === "round" &&
        x.round === e.round &&
        x.status !== "canceled",
    );
    g.round.drawn = g.round.drawn.filter((key) => key !== e.memberId);
    if (consumed) g.round.drawn.push(e.memberId);
  }
}
export function migrate(legacy, lang = "tr") {
  const state = empty(lang);
  if (!legacy || !Array.isArray(legacy.options) || legacy.example) return state;
  const options = legacy.options
    .filter((o) => o && typeof o.text === "string" && o.text.trim())
    .slice(0, 30);
  if (!options.length) return state;
  const g = group(
    "Imported",
    options.map((o) => o.text),
  );
  g.members.forEach((m, i) => {
    m.weight = Math.min(9, Math.max(1, Math.round(options[i].weight || 1)));
  });
  g.imported = true;
  state.groups.push(g);
  state.activeId = g.id;
  return state;
}
// Validate before accepting backups: bounds, dates, identifiers and cross-references.
export function validate(raw) {
  const fail = () => {
    throw new Error("badBackup");
  };
  const text = (x, max) =>
    typeof x === "string" && x.trim().length > 0 && x.length <= max;
  const date = (x) => typeof x === "string" && Number.isFinite(Date.parse(x));
  const integer = (x, min, max) => Number.isInteger(x) && x >= min && x <= max;
  const unique = (rows) =>
    rows.every((x) => x && typeof x === "object") &&
    new Set(rows.map((x) => x.id)).size === rows.length;
  if (
    !raw ||
    raw.version !== 2 ||
    !LANGS.includes(raw.lang) ||
    !Array.isArray(raw.groups) ||
    raw.groups.length > 30 ||
    !unique(raw.groups)
  )
    fail();
  const s = empty(raw.lang);
  for (const r of raw.groups) {
    if (
      !r ||
      !text(r.id, 100) ||
      !text(r.name, 60) ||
      !modes.includes(r.mode) ||
      !date(r.periodStart) ||
      !Array.isArray(r.members) ||
      r.members.length > 30 ||
      !unique(r.members) ||
      !Array.isArray(r.events) ||
      r.events.length > 5000 ||
      !unique(r.events)
    )
      fail();
    const g = {
      id: r.id,
      name: r.name,
      mode: r.mode,
      periodStart: new Date(r.periodStart).toISOString(),
      members: [],
      events: [],
      round: r.round && {
        number: r.round.number,
        drawn: Array.isArray(r.round.drawn) ? [...r.round.drawn] : null,
      },
    };
    for (const m of r.members) {
      if (
        !m ||
        !text(m.id, 100) ||
        !text(m.name, 60) ||
        !integer(m.weight, 1, 9) ||
        typeof m.available !== "boolean"
      )
        fail();
      g.members.push({
        id: m.id,
        name: m.name,
        weight: m.weight,
        available: m.available,
      });
    }
    if (
      !g.round ||
      !integer(g.round.number, 1, 1000000) ||
      !Array.isArray(g.round.drawn) ||
      new Set(g.round.drawn).size !== g.round.drawn.length ||
      g.round.drawn.some((mid) => !g.members.some((m) => m.id === mid))
    )
      fail();
    for (const e of r.events) {
      if (
        !e ||
        !text(e.id, 100) ||
        !g.members.some((m) => m.id === e.memberId) ||
        !text(e.memberName, 60) ||
        !text(e.title, 120) ||
        !integer(e.points, 1, 5) ||
        !statuses.includes(e.status) ||
        !modes.includes(e.mode) ||
        !integer(e.round, 1, 1000000) ||
        !date(e.at) ||
        (e.updatedAt && !date(e.updatedAt)) ||
        !e.reason ||
        !integer(e.reason.pool, 1, 30) ||
        !integer(e.reason.weight, 1, 9) ||
        !integer(e.reason.total, 1, 270) ||
        (e.reason.minimum !== null && !integer(e.reason.minimum, 0, 25000))
      )
        fail();
      g.events.push({
        id: e.id,
        memberId: e.memberId,
        memberName: e.memberName,
        title: e.title,
        points: e.points,
        status: e.status,
        mode: e.mode,
        round: e.round,
        at: e.at,
        ...(e.updatedAt ? { updatedAt: e.updatedAt } : {}),
        reason: {
          pool: e.reason.pool,
          weight: e.reason.weight,
          total: e.reason.total,
          minimum: e.reason.minimum,
        },
      });
    }
    s.groups.push(g);
  }
  if (raw.groups.length && !s.groups.some((g) => g.id === raw.activeId)) fail();
  s.activeId = s.groups.length ? raw.activeId : "";
  return s;
}
