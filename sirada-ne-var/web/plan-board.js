import { candidates, loadPoints } from "./groups-core.js?v=tasks-3";
import { activePlan, planContext, progress } from "./plan-core.js?v=tasks-3";
import { planToolbar, planSummary } from "./plan-view.js?v=tasks-3";
export function renderBoard(g, ui) {
  const {
    t,
    esc,
    button,
    eventHtml,
    groupShow,
    date,
    flow,
    resultId,
    celebrate,
  } = ui;
  const planFlow = flow === "plan",
    p = planFlow ? activePlan(g) : null,
    ctx = p ? planContext(g, p) : g,
    c = candidates(ctx),
    status = progress(g, p);
  const selected = g.events.find(
    (e) => e.id === resultId && (planFlow ? e.planId === p?.id : !e.planId),
  );
  const history = g.events.filter((e) =>
    planFlow ? e.planId === p?.id : !e.planId,
  );
  const people = `<section class="card"><div class="section-heading"><h2>${esc(t("members"))}</h2><span class="hint">${g.members.length}/30</span></div><p class="hint">${esc(t("availableHelp"))}</p><div class="member-list">${g.members.map((m) => `<div class="person ${m.available ? "" : "off"}"><span class="avatar" aria-hidden="true">${esc(Array.from(m.name)[0] || "·")}</span><span class="person-name">${esc(m.name)}${ctx.mode === "random" ? `<small>${esc(t("weight"))}: ${m.weight}</small>` : ""}</span><label><span class="hide">${esc(m.name)}: ${esc(t("available"))}</span><input type="checkbox" data-member="${esc(m.id)}" ${m.available ? "checked" : ""} aria-label="${esc(m.name)}: ${esc(t("available"))}"></label>${button("editPerson", "edit", "", `data-id="${esc(m.id)}" aria-label="${esc(t("editPerson"))}: ${esc(m.name)}"`)}</div>`).join("")}</div>${button("addPerson", "addPerson", "small", g.members.length >= 30 ? "disabled" : "")}</section>`;
  const rules = `<details class="draw-rules"><summary>${esc(t("showRule"))}: ${esc(t(ctx.mode))}</summary><div class="rule-grid" role="group" aria-label="${esc(t("rule"))}">${["round", "random", "balance"].map((mode) => button("mode", mode, "", `data-mode="${mode}" aria-pressed="${ctx.mode === mode}"`)).join("")}</div><p class="hint">${esc(t(ctx.mode + "Help"))}${planFlow ? " " + esc(t("planFair")) : ""}</p><div class="stats"><div class="stat"><span class="hint">${esc(t(ctx.mode === "round" ? "remaining" : "available"))}</span><strong>${ctx.mode === "round" ? c.members.length : g.members.filter((m) => m.available).length}</strong></div><div class="stat"><span class="hint">${esc(t("roundNumber"))}</span><strong>${ctx.round.number + (c.nextRound ? 1 : 0)}</strong></div></div></details>`;
  const input = planFlow
    ? ""
    : `<label class="draw-task" for="task">${esc(t("task"))}<input id="task" maxlength="120" value="${esc(ui.draft.title)}" placeholder="${esc(t("taskHint"))}" autocomplete="off"></label><div class="effort-row"><p class="hint">${esc(t("effort"))} · 1–5</p><select id="points" aria-label="${esc(t("effort"))}">${[1, 2, 3, 4, 5].map((n) => `<option ${n === ui.draft.points ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;
  const action =
    planFlow && !p
      ? button("planNew", "planCreate", "primary draw-start")
      : button(
          "assign",
          planFlow
            ? status.finished
              ? "planFinished"
              : "planStart"
            : "showStart",
          "primary draw-start",
          !c.members.length || (planFlow && !status.next) ? "disabled" : "",
        );
  const result = selected
    ? `<section class="result" id="selection-result" tabindex="-1" role="status" aria-live="polite"><span class="eyebrow">${esc(t("assigned"))}</span><strong>${esc(selected.memberName)}</strong><p>${esc(selected.title)}</p><p>${esc(ui.reason(selected))}</p></section>`
    : "";
  const load = planFlow
    ? ""
    : `<section class="card history-card"><div class="section-heading"><div><h2>${esc(t("load"))}</h2><p class="hint">${esc(t("period"))}: ${esc(date(g.periodStart))}</p></div>${button("period", "newPeriod", "small")}</div><div class="load-list">${g.members
        .map((m) => {
          const list = g.events.filter(
              (e) => e.memberId === m.id && e.at >= g.periodStart,
            ),
            done = list
              .filter((e) => e.status === "done")
              .reduce((a, e) => a + e.points, 0),
            wait = list
              .filter((e) => e.status === "assigned")
              .reduce((a, e) => a + e.points, 0),
            max = Math.max(1, ...g.members.map((x) => loadPoints(g, x.id)));
          return `<div><div class="load-line"><span>${esc(m.name)}</span><span>${esc(t("pending"))} ${wait} · ${esc(t("completed"))} ${done}</span></div><div class="bar"><span style="width:${((wait + done) / max) * 100}%"></span></div></div>`;
        })
        .join("")}</div></section>`;
  return `<div class="board-heading"><div><p class="eyebrow">${esc(t("groups"))}</p><h2 class="board-title">${esc(g.name)}</h2></div>${button("editGroup", "edit", "small")}</div><div class="flow-tabs" role="group" aria-label="${esc(t("planFlow"))}">${button("flow", "planFlow", "", `data-flow="plan" aria-pressed="${planFlow}"`)}${button("flow", "planSingle", "", `data-flow="single" aria-pressed="${!planFlow}"`)}</div>${planFlow ? planToolbar(g, p, ui) : ""}<div class="board-grid"><section class="card chooser">${groupShow(g)}${rules}${input}${action}${result}</section><aside class="plan-side">${planFlow ? `${planSummary(g, p, { ...ui, celebrate: celebrate === p?.id })}<details class="plan-participants"><summary>${esc(t("members"))} · ${g.members.length}</summary>${people}</details>` : people}</aside></div>${load}<section class="card history-card"><div class="section-heading"><h2>${esc(t("history"))}</h2><span class="hint">${history.length}</span></div><p class="hint">${esc(t("skipHelp"))} ${esc(t("cancelHelp"))}</p><div class="history-list" style="margin-top:16px">${history.slice(0, 30).map(eventHtml).join("") || `<p class="hint">${esc(t("noHistory"))}</p>`}</div>${history.length > 30 ? button("history", "allHistory", "small") : ""}</section>`;
}
