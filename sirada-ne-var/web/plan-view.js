import { activePlan, progress, allocations } from "./plan-core.js?v=tasks-3";
export function planToolbar(g, p, { t, esc, button }) {
  if (!p)
    return `<section class="plan-toolbar plan-onboarding"><div><h2>${esc(t("planEmpty"))}</h2><p class="hint">${esc(t("planEmptyHint"))}</p></div><div class="plan-toolbar-actions">${button("planNew", "planNew", "primary")}${button("planSample", "planSample")}</div></section>`;
  const status = progress(g, p),
    pending = p.tasks.filter((task) => !task.eventId);
  return `<section class="plan-toolbar"><div class="plan-toolbar-top"><label>${esc(t("planLists"))}<select id="plan-select">${g.plans.map((x, i) => `<option value="${esc(x.id)}" ${x.id === p.id ? "selected" : ""}>${esc(x.title)} · ${i + 1}</option>`).join("")}</select></label><div class="plan-toolbar-actions">${button("planNew", "planNew", "small")}${button("planAppend", "planAppend", "small")}</div></div><div class="plan-progress-heading"><strong>${esc(t("planProgress", { n: status.assigned, total: status.total }))}</strong><span>${Math.round((status.assigned / status.total) * 100)}%</span></div><div class="plan-progress" role="progressbar" aria-label="${esc(t("planProgress", { n: status.assigned, total: status.total }))}" aria-valuenow="${status.assigned}" aria-valuemin="0" aria-valuemax="${status.total}"><span style="width:${(status.assigned / status.total) * 100}%"></span></div>${
    pending.length
      ? `<details class="plan-pending"><summary>${esc(t("planPending"))} · ${pending.length}</summary><ol>${pending
          .map((task) => {
            const removable =
              p.tasks.length > 1 &&
              !g.events.some((e) => e.planId === p.id && e.taskId === task.id);
            return `<li><span>${esc(task.title)}<small>${task.points} · ${esc(t("effort"))}</small></span><div>${button("planEdit", "edit", "small", `data-task="${esc(task.id)}" aria-label="${esc(t("planEdit"))}: ${esc(task.title)}"`)}${button("planRemove", "delete", "small danger", `data-task="${esc(task.id)}" ${removable ? "" : "disabled"}`)}</div></li>`;
          })
          .join("")}</ol></details>`
      : ""
  }</section>`;
}
export function planSummary(g, p, { t, esc, button, celebrate = false }) {
  const status = progress(g, p);
  return `<section class="card plan-summary ${celebrate ? "is-celebrating" : ""}" aria-label="${esc(t("planFlow"))}"><div class="section-heading"><h2>${esc(p?.title || t("planFlow"))}</h2>${p && status.assigned ? `<div class="plan-share-actions">${button("planShare", "planShare", "small")}${button("planCopy", "planCopy", "small")}</div>` : ""}</div>${status.finished ? `<div class="plan-finished"><span aria-hidden="true">✦</span><h3>${esc(t("planFinished"))}</h3><p>${esc(t("planFinishedHint"))}</p></div>` : ""}<div class="plan-recipients">${allocations(
    g,
    p,
  )
    .map(
      ({ member, events }, i) =>
        `<article class="plan-recipient" data-tray-member="${esc(member.id)}" style="--person-delay:${i * 0.13}s"><header><span class="recipient-avatar">${esc(Array.from(member.name)[0] || "·")}</span><div><h3>${esc(member.name)}</h3><small>${esc(t("planPoints"))}: ${events.filter((e) => ["assigned", "done"].includes(e.status)).reduce((sum, e) => sum + e.points, 0)}</small></div><strong class="person-task-count" aria-label="${events.length}">${events.length}</strong></header><ul>${events.map((e) => `<li class="person-task ${e.status === "done" ? "is-done" : ""}"><button type="button" class="task-check" data-action="status" data-event="${esc(e.id)}" data-status="${e.status === "done" ? "assigned" : "done"}" aria-pressed="${e.status === "done"}" aria-label="${esc(e.status === "done" ? t("assigned") : t("done"))}: ${esc(e.title)}">${e.status === "done" ? "✓" : "○"}</button><span>${esc(e.title)}<small>${esc(t(e.status))} · ${e.points}</small></span></li>`).join("") || `<li class="empty-tray">${esc(t("planNoTasks"))}</li>`}</ul></article>`,
    )
    .join("")}</div></section>`;
}
export function stagePeople(g, p) {
  return allocations(g, p).map(({ member, events }) => ({
    ...member,
    count: p
      ? events.length
      : g.events.filter(
          (e) =>
            !e.planId && e.memberId === member.id && e.status !== "canceled",
        ).length,
  }));
}
