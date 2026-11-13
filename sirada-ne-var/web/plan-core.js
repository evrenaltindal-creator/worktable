import { id, assign } from "./groups-core.js?v=tasks-3";
export const activePlan = (g) =>
  g.plans?.find((p) => p.id === g.activePlanId) || null;
export function planContext(g, p) {
  return {
    members: g.members,
    mode: p.mode,
    round: p.round,
    events: g.events.filter((e) => e.planId === p.id),
    periodStart: p.createdAt,
  };
}
export function progress(g, p) {
  if (!p) return { assigned: 0, total: 0, next: null, finished: false };
  const next = p.tasks.find((t) => !t.eventId) || null;
  return {
    assigned: p.tasks.filter((t) => !!t.eventId).length,
    total: p.tasks.length,
    next,
    finished: !!p.tasks.length && !next,
  };
}
export function createPlan(g, title, titles) {
  if ((g.plans || []).length >= 30) throw Error("planLimit");
  if (
    !title.trim() ||
    title.length > 60 ||
    !titles.length ||
    titles.length > 100 ||
    titles.some((x) => typeof x !== "string" || !x.trim() || x.length > 120)
  )
    throw Error("planInvalid");
  const p = {
    id: id(),
    title: title.trim(),
    createdAt: new Date().toISOString(),
    mode: "round",
    round: { number: 1, drawn: [] },
    tasks: titles.map((title) => ({
      id: id(),
      title: title.trim(),
      points: 1,
      eventId: null,
    })),
  };
  g.plans ||= [];
  g.plans.push(p);
  g.activePlanId = p.id;
  return p;
}
export function appendTasks(p, titles) {
  if (
    !titles.length ||
    p.tasks.length + titles.length > 100 ||
    titles.some((x) => typeof x !== "string" || !x.trim() || x.length > 120)
  )
    throw Error("planInvalid");
  p.tasks.push(
    ...titles.map((title) => ({
      id: id(),
      title: title.trim(),
      points: 1,
      eventId: null,
    })),
  );
}
export function editPendingTask(p, taskId, title, points) {
  const task = p.tasks.find((t) => t.id === taskId);
  if (
    !task ||
    task.eventId ||
    !title.trim() ||
    title.length > 120 ||
    !Number.isInteger(points) ||
    points < 1 ||
    points > 5
  )
    throw Error("planInvalid");
  task.title = title.trim();
  task.points = points;
}
export function removePendingTask(g, p, taskId) {
  const task = p.tasks.find((t) => t.id === taskId);
  if (
    !task ||
    task.eventId ||
    p.tasks.length <= 1 ||
    g.events.some((e) => e.planId === p.id && e.taskId === taskId)
  )
    throw Error("planInvalid");
  p.tasks = p.tasks.filter((t) => t.id !== taskId);
}
export function assignNextTask(g, p, random) {
  if (g.events.length >= 5000) throw Error("historyFull");
  const task = progress(g, p).next;
  if (!task) throw Error("planFinished");
  const ctx = planContext(g, p),
    event = assign(ctx, task.title, task.points, random);
  event.planId = p.id;
  event.taskId = task.id;
  p.round = ctx.round;
  task.eventId = event.id;
  g.events.unshift(event);
  return event;
}
export function allocations(g, p) {
  return g.members.map((member) => ({
    member,
    events: p
      ? p.tasks
          .filter((t) => t.eventId)
          .map((t) => g.events.find((e) => e.id === t.eventId))
          .filter((e) => e?.memberId === member.id)
      : [],
  }));
}
export function planText(g, p, labels) {
  return (
    `${g.name} — ${p.title}\n\n` +
    allocations(g, p)
      .map(
        ({ member, events }) =>
          `${member.name}\n${events.length ? events.map((e) => `${e.status === "done" ? "[x]" : "[ ]"} ${e.title} (${labels[e.status]})`).join("\n") : "—"}`,
      )
      .join("\n\n")
  );
}
