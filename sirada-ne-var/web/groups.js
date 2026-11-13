import {
  KEY,
  LANGS,
  copy,
  empty,
  group,
  id,
  assign,
  candidates,
  loadPoints,
  setStatus,
  migrate,
  validate,
} from "./groups-core.js?v=tasks-3";
import { translations, nativeNames } from "./groups-i18n.js";
import { showTranslations } from "./show-i18n.js";
import { showMarkup, prepareAudio } from "./draw-show.js?v=tasks-3";
import { planTranslations } from "./plan-i18n.js";
import {
  activePlan,
  planContext,
  progress,
  createPlan,
  appendTasks,
  editPendingTask,
  removePendingTask,
  assignNextTask,
  planText,
} from "./plan-core.js?v=tasks-3";
import { renderBoard } from "./plan-board.js?v=tasks-3";
import { stagePeople } from "./plan-view.js?v=tasks-3";
import { playTaskShow, deliverTask } from "./task-motion.js";
for (const lang of LANGS)
  Object.assign(
    translations[lang],
    showTranslations[lang],
    planTranslations[lang],
  );
const $ = (s) => document.querySelector(s);
const app = $("#app"),
  dialog = $("#dialog");
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let s,
  undoState = null,
  resultId = "",
  draft = { title: "", points: 1 },
  error = false,
  message = "";
let importData = null;
let drawing = false,
  activeShow = null,
  showMemory = null;
let celebratePlanId = null;
let presentation = { kind: "wheel", sound: false, flow: "plan" };
try {
  const saved = JSON.parse(
    localStorage.getItem("sirada-presentation-v1") || "null",
  );
  if (saved)
    presentation = {
      kind: saved.kind === "slot" ? "slot" : "wheel",
      sound: !!saved.sound,
      flow: saved.flow === "single" ? "single" : "plan",
    };
} catch {}
function savePresentation() {
  try {
    localStorage.setItem(
      "sirada-presentation-v1",
      JSON.stringify(presentation),
    );
  } catch {}
}
// iOS 15.0–15.3 predates native <dialog>. Keep modal access usable there too.
if (typeof dialog.showModal !== "function") {
  dialog.showModal = () => {
    dialog.setAttribute("open", "");
    app.setAttribute("aria-hidden", "true");
    document.body.classList.add("fallback-modal");
  };
  dialog.close = () => {
    dialog.removeAttribute("open");
    app.removeAttribute("aria-hidden");
    document.body.classList.remove("fallback-modal");
  };
  document.addEventListener("keydown", (event) => {
    if (!dialog.hasAttribute("open")) return;
    if (event.key === "Escape") dialog.close();
    if (event.key === "Tab") {
      const nodes = [
        ...dialog.querySelectorAll(
          "button,a[href],input,select,textarea,summary",
        ),
      ].filter((x) => !x.disabled && x.offsetParent !== null);
      const i = nodes.indexOf(document.activeElement),
        next = event.shiftKey
          ? i <= 0
            ? nodes.length - 1
            : i - 1
          : (i + 1) % nodes.length;
      event.preventDefault();
      nodes[next]?.focus();
    }
  });
}
const detect = () =>
  LANGS.find((l) => location.hash === "#" + l) ||
  LANGS.find((l) => (navigator.language || "").startsWith(l)) ||
  "en";
try {
  const existing = localStorage.getItem(KEY);
  const legacy = JSON.parse(
    localStorage.getItem("sirada-ne-var-v1") ||
      localStorage.getItem("hediye-carki-v1") ||
      "null",
  );
  s = existing
    ? validate(JSON.parse(existing))
    : migrate(legacy, LANGS.includes(legacy?.lang) ? legacy.lang : detect());
  if (LANGS.includes(location.hash.slice(1))) s.lang = location.hash.slice(1);
  if (!existing && s.groups.length)
    s.groups[0].name = translations[s.lang].imported;
} catch {
  s = empty(detect());
  error = true;
  message = "badBackup";
}
const t = (key, args = {}) =>
  Object.entries(args).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    translations[s.lang][key] || key,
  );
const current = () => s.groups.find((g) => g.id === s.activeId);
const date = (value) =>
  new Date(value).toLocaleString(s.lang, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const reason = (e) =>
  t({ round: "whyRound", random: "whyRandom", balance: "whyBalance" }[e.mode], {
    n: e.reason.pool,
    w: e.reason.weight,
    total: e.reason.total,
    p: e.reason.minimum,
  });
function commit(change, notice = "saved") {
  const before = copy(s);
  try {
    change();
    localStorage.setItem(KEY, JSON.stringify(s));
    undoState = before;
    error = false;
    message = notice;
    return true;
  } catch (e) {
    s = before;
    error = true;
    message = translations[s.lang][e.message] ? e.message : "storageError";
    return false;
  }
}
function info(key, isError = false) {
  message = key;
  error = isError;
  render();
}
function button(action, label, cls = "", attrs = "") {
  return `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${esc(t(label))}</button>`;
}
function language() {
  return `<label class="hide" for="language">${esc(t("language"))}</label><select id="language" aria-label="${esc(t("language"))}">${LANGS.map((l) => `<option value="${l}" ${l === s.lang ? "selected" : ""}>${nativeNames[l]}</option>`).join("")}</select>`;
}
function render() {
  document.documentElement.lang = s.lang;
  document.title = t("title");
  const g = current();
  app.innerHTML = `<main class="shell ${g ? "has-groups" : ""}"><header class="top"><a href="index.html" class="brand"><span class="mark" aria-hidden="true">↻</span>${esc(t("title"))}</a><div class="top-actions">${language()}${button("settings", "settings")}</div></header><section class="intro"><div><p class="eyebrow">${esc(t("local"))}</p><h1>${esc(t("tagline"))}</h1><p class="muted">${esc(t("emptyHelp"))}</p></div></section><div class="workspace"><aside class="sidebar"><p class="eyebrow">${esc(t("groups"))}</p><nav class="group-list" aria-label="${esc(t("groups"))}">${s.groups.map((x) => `<button class="group-button" data-action="open" data-id="${esc(x.id)}" aria-current="${x.id === s.activeId}"><span>${esc(x.name)}</span><small>${x.members.length}</small></button>`).join("")}</nav>${button("new", "newGroup")}<footer><a href="quick.html#${s.lang}">${esc(t("quick"))} ↗</a><a href="privacy.html#${s.lang}">${esc(t("privacy"))}</a><a href="support.html#${s.lang}">${esc(t("support"))}</a></footer></aside><section id="board">${g ? board(g) : `<div class="empty"><span class="orbit" aria-hidden="true">◎</span><h2>${esc(t("emptyTitle"))}</h2><p class="muted">${esc(t("emptyHelp"))}</p><div class="empty-actions">${button("new", "newGroup", "primary")}${button("sample", "sample")}</div></div>`}</section></div><footer class="bottom"><p id="status" role="status" aria-live="polite" class="status ${error ? "error" : ""}">${message ? esc(t(message)) : esc(t("local"))}</p>${button("undo", "undo", "small", undoState ? "" : "disabled")}${button("about", "about", "small")}</footer></main>`;
}
function board(g) {
  return renderBoard(g, {
    t,
    esc,
    button,
    eventHtml,
    groupShow,
    date,
    draft,
    reason,
    flow: presentation.flow,
    resultId,
    celebrate: celebratePlanId,
  });
}
function groupShow(g) {
  const last =
    showMemory?.eventId === resultId && showMemory.groupId === g.id
      ? showMemory
      : null;
  const p = presentation.flow === "plan" ? activePlan(g) : null,
    ctx = p ? planContext(g, p) : g,
    status = progress(g, p);
  return showMarkup({
    members: last?.members || candidates(ctx).members,
    weighted: last?.weighted ?? ctx.mode === "random",
    kind: presentation.kind,
    sound: presentation.sound,
    t,
    winnerId: last?.chosenId || "",
    angle: last?.angle || 0,
    taskTitle:
      last?.title ||
      (p
        ? status.next?.title || t("planFinished")
        : draft.title || t("taskHint")),
    taskPosition:
      last?.position ||
      (p
        ? t("planTaskNumber", {
            n:
              status.assigned + 1 > status.total
                ? status.total
                : status.assigned + 1,
            total: status.total,
          })
        : ""),
    people:
      p || presentation.flow === "single"
        ? stagePeople(g, p)
        : g.members.map((m) => ({ ...m, count: 0 })),
  });
}
async function animatedAssignment(g) {
  if (g.events.length >= 5000) return info("historyFull", true);
  const p = presentation.flow === "plan" ? activePlan(g) : null,
    status = progress(g, p);
  if (presentation.flow === "plan" && !p) return planEditor(g);
  if (p && status.finished) return info("planFinished");
  const title = p ? status.next.title : draft.title,
    points = p ? status.next.points : draft.points;
  if (!title.trim()) {
    info("invalid", true);
    const field = $("#task");
    field.setCustomValidity(t("invalid"));
    field.reportValidity();
    field.focus();
    return;
  }
  const ctx = p ? planContext(g, p) : g;
  const members = copy(candidates(ctx).members),
    people = stagePeople(g, p),
    weighted = ctx.mode === "random";
  let picked;
  if (
    !commit(() => {
      picked = p ? assignNextTask(g, p) : assign(g, title, points);
    })
  ) {
    render();
    return;
  }
  // Save exactly once before animating, but leave the rest of the old UI unchanged
  // until reveal, so the task history and point bars cannot spoil the result.
  drawing = true;
  prepareAudio(presentation.sound);
  app.classList.add("draw-running");
  app.setAttribute("aria-busy", "true");
  $("#draw-stage").outerHTML = showMarkup({
    members,
    weighted,
    kind: presentation.kind,
    sound: presentation.sound,
    t,
    drawing: true,
    taskTitle: picked.title,
    taskPosition: p
      ? t("planTaskNumber", {
          n: p.tasks.findIndex((task) => task.id === picked.taskId) + 1,
          total: p.tasks.length,
        })
      : "",
    people,
  });
  lockDrawingControls();
  const root = $("#draw-stage");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.scrollIntoView({
    block: "center",
    behavior: reduced ? "auto" : "smooth",
  });
  root.querySelector('[data-action="reveal"]').focus({ preventScroll: true });
  showMemory = {
    eventId: picked.id,
    groupId: g.id,
    members,
    weighted,
    chosenId: picked.memberId,
    angle: 0,
    title: picked.title,
    position: p
      ? t("planTaskNumber", {
          n: p.tasks.findIndex((task) => task.id === picked.taskId) + 1,
          total: p.tasks.length,
        })
      : "",
  };
  try {
    activeShow = playTaskShow(root, {
      members,
      chosenId: picked.memberId,
      weighted,
      kind: presentation.kind,
      sound: presentation.sound,
      reduced,
      t,
    });
    const outcome = await activeShow.finished;
    showMemory.angle = outcome.angle;
    const from = root.querySelector(".task-cue-card")?.getBoundingClientRect();
    resultId = picked.id;
    render();
    lockDrawingControls();
    const tray = [...app.querySelectorAll("[data-tray-member]")].find(
      (el) => el.dataset.trayMember === picked.memberId,
    );
    const light = [...app.querySelectorAll("[data-light-member]")].find(
      (el) => el.dataset.lightMember === picked.memberId,
    );
    light?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    });
    const bounds = tray?.getBoundingClientRect();
    const target =
      bounds && bounds.top >= 0 && bounds.bottom < innerHeight ? tray : light;
    activeShow = deliverTask(from, target, {
      title: picked.title,
      reduced: reduced || outcome.skipped,
    });
    await activeShow.finished;
    if (p && progress(g, p).finished) celebratePlanId = p.id;
  } finally {
    activeShow = null;
    drawing = false;
    resultId = picked.id;
    app.classList.remove("draw-running");
    app.removeAttribute("aria-busy");
    render();
    const readout = $(".show-readout");
    readout?.setAttribute("tabindex", "-1");
    readout?.focus({ preventScroll: true });
    if (celebratePlanId) {
      $(".plan-summary")?.scrollIntoView({
        block: "start",
        behavior: reduced ? "auto" : "smooth",
      });
      celebratePlanId = null;
    }
    try {
      window.Capacitor?.nativePromise?.("Haptics", "notification", {
        type: "SUCCESS",
      })?.catch(() => {});
    } catch {}
  }
}
function lockDrawingControls() {
  app.querySelectorAll("button,input,select,textarea").forEach((control) => {
    control.disabled = control.dataset.action !== "reveal";
  });
  const reveal = app.querySelector('[data-action="reveal"]');
  if (reveal) reveal.hidden = false;
}
function taskLines(value) {
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
function planEditor(g, append = false) {
  if (!append && g.plans.length >= 30) return info("planLimit", true);
  modal(
    append ? "planAppend" : "planNew",
    `<form id="plan-form" data-append="${append}">${append ? "" : `<label>${esc(t("planName"))}<input name="title" maxlength="60" value="${esc(t("planDefault"))}" required></label>`}<label>${esc(t("planTasks"))}<textarea name="tasks" rows="7" maxlength="12100" required></textarea></label><p class="hint">${esc(t("planHint"))}</p><div class="dialog-actions">${button("close", "cancel")}<button class="primary">${esc(t(append ? "planAppend" : "planCreate"))}</button></div></form>`,
  );
}
function planTaskEditor(g, taskId) {
  const p = activePlan(g),
    task = p?.tasks.find((task) => task.id === taskId);
  if (!task || task.eventId) return;
  modal(
    "planEdit",
    `<form id="plan-task-form" data-task="${esc(taskId)}"><label>${esc(t("task"))}<input name="title" maxlength="120" value="${esc(task.title)}" required></label><label>${esc(t("effort"))}<select name="points">${[1, 2, 3, 4, 5].map((n) => `<option ${n === task.points ? "selected" : ""}>${n}</option>`).join("")}</select></label><div class="dialog-actions">${button("close", "cancel")}<button class="primary">${esc(t("save"))}</button></div></form>`,
  );
}
async function sharePlan(g, copyOnly = false) {
  const p = activePlan(g);
  if (!p) return;
  const text = planText(g, p, translations[s.lang]);
  try {
    if (!copyOnly && window.Capacitor?.isNativePlatform?.()) {
      await window.Capacitor.nativePromise("Share", "share", {
        title: p.title,
        text,
      });
      return;
    }
    if (!copyOnly && navigator.share) {
      await navigator.share({ title: p.title, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    info("planCopied");
  } catch (e) {
    if (e.name === "AbortError") return;
    modal(
      "planShare",
      `<p class="hint">${esc(t("planShareHelp"))}</p><textarea class="plan-copy" readonly aria-label="${esc(t("planShare"))}">${esc(text)}</textarea>`,
    );
  }
}
function eventHtml(e) {
  return `<article class="event"><div class="event-head"><div><h3>${esc(e.memberName)}</h3><p class="event-title">${esc(e.title)}</p><span class="badge">${e.points} · ${esc(t("effort"))}</span></div><time datetime="${esc(e.at)}">${esc(date(e.at))}</time></div><p class="hint">${esc(reason(e))}</p><div class="event-actions" role="group" aria-label="${esc(e.title)}">${["assigned", "done", "skipped", "canceled"].map((status) => button("status", status, "", `data-event="${esc(e.id)}" data-status="${status}" aria-pressed="${e.status === status}"`)).join("")}</div></article>`;
}
function modal(title, body) {
  dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${esc(t(title))}</h2>${button("close", "close")}</div>${body}`;
  if (!dialog.open) dialog.showModal();
  (
    dialog.querySelector('input:not([type="file"]),textarea,select') ||
    dialog.querySelector("button")
  )?.focus();
}
function confirmModal(title, text, action, label = "save") {
  modal(
    title,
    `<p>${esc(t(text))}</p><div class="dialog-actions">${button("close", "cancel")}${button(action, label, "primary")}</div>`,
  );
}
function newGroup() {
  if (s.groups.length >= 30) return info("limit", true);
  modal(
    "newGroup",
    `<form id="new-form"><label>${esc(t("groupName"))}<input name="group" maxlength="60" required></label><label>${esc(t("people"))}<textarea name="people" rows="5" maxlength="1830" required></textarea></label><p class="hint">${esc(t("namesHelp"))}</p><div class="dialog-actions">${button("close", "cancel")}<button class="primary">${esc(t("create"))}</button></div></form>`,
  );
}
function personEditor(member) {
  modal(
    member ? "editPerson" : "addPerson",
    `<form id="person-form" data-id="${esc(member?.id || "")}"><label>${esc(t("name"))}<input name="name" maxlength="60" value="${esc(member?.name || "")}" required></label><label>${esc(t("weight"))}<select name="weight">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<option ${n === (member?.weight || 1) ? "selected" : ""}>${n}</option>`).join("")}</select></label><p class="hint">${esc(t("randomHelp"))}</p><div class="dialog-actions">${button("close", "cancel")}<button class="primary">${esc(t("save"))}</button></div></form>`,
  );
}
function settings() {
  modal(
    "settings",
    `<div class="settings-buttons">${button("export", "export")}${button("import", "import")}<p class="hint">${esc(t("backupHelp"))} ${esc(t("backupText"))}</p><input class="hide" id="backup-file" type="file" accept="application/json,.json"><a href="quick.html#${s.lang}">${esc(t("quick"))} ↗</a><a href="privacy.html#${s.lang}">${esc(t("privacy"))}</a><a href="support.html#${s.lang}">${esc(t("support"))}</a>${button("about", "about")}${button("deleteAll", "deleteAll", "danger")}</div>`,
  );
}
async function exportBackup() {
  const data = JSON.stringify(s, null, 2);
  const filename = `sirada-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([data], filename, { type: "application/json" });
  // Native Files/Share sheet; browsers use a user-initiated JSON download.
  if (window.Capacitor?.isNativePlatform?.()) {
    const cap = window.Capacitor,
      path = "sirada-backup.json";
    try {
      const saved = await cap.nativePromise("Filesystem", "writeFile", {
        path,
        data,
        directory: "CACHE",
        encoding: "utf8",
      });
      await cap.nativePromise("Share", "share", {
        title: t("export"),
        files: [saved.uri],
        dialogTitle: t("export"),
      });
      message = "exported";
      error = false;
    } catch (e) {
      if (!/cancel|dismiss/i.test(e.message || "")) {
        message = "storageError";
        error = true;
      }
    } finally {
      try {
        await cap.nativePromise("Filesystem", "deleteFile", {
          path,
          directory: "CACHE",
        });
      } catch {}
    }
  } else {
    const url = URL.createObjectURL(file),
      a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    message = "exported";
    error = false;
  }
  render();
}
async function action(e) {
  if (drawing && e.target.closest("a")) {
    e.preventDefault();
    return;
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action,
    g = current();
  if (a === "reveal") {
    activeShow?.finish();
    return;
  }
  if (drawing) return;
  if (a === "flow") {
    presentation.flow = b.dataset.flow === "single" ? "single" : "plan";
    savePresentation();
    resultId = "";
    showMemory = null;
    render();
    return;
  }
  if (a === "planNew") return planEditor(g);
  if (a === "planAppend") return planEditor(g, true);
  if (a === "planEdit") return planTaskEditor(g, b.dataset.task);
  if (a === "planShare") return sharePlan(g);
  if (a === "planCopy") return sharePlan(g, true);
  if (a === "planRemove") {
    commit(() => removePendingTask(g, activePlan(g), b.dataset.task));
    resultId = "";
    showMemory = null;
    render();
    return;
  }
  if (a === "planSample") {
    commit(() =>
      createPlan(g, t("planDefault"), t("planSampleTasks").split("\n")),
    );
    resultId = "";
    showMemory = null;
    render();
    return;
  }
  if (a === "presentation") {
    presentation.kind = b.dataset.kind === "slot" ? "slot" : "wheel";
    savePresentation();
    render();
    return;
  }
  if (a === "sound") {
    presentation.sound = !presentation.sound;
    prepareAudio(presentation.sound);
    savePresentation();
    render();
    return;
  }
  if (a === "close") return dialog.close();
  if (a === "new") return newGroup();
  if (a === "sample") {
    if (s.groups.length >= 30) return info("limit", true);
    commit(() => {
      const x = group(
        t("sampleGroup"),
        t(presentation.flow === "plan" ? "planPeople" : "samplePeople").split(
          "\n",
        ),
      );
      if (presentation.flow === "plan")
        createPlan(x, t("planDefault"), t("planSampleTasks").split("\n"));
      s.groups.push(x);
      s.activeId = x.id;
    });
    draft = { title: t("sampleTask"), points: 1 };
    resultId = "";
  }
  if (a === "open") {
    commit(() => {
      s.activeId = b.dataset.id;
    });
    draft = { title: "", points: 1 };
    resultId = "";
  }
  if (a === "mode")
    commit(() => {
      const p = presentation.flow === "plan" ? activePlan(g) : null;
      (p || g).mode = b.dataset.mode;
      resultId = "";
      showMemory = null;
    });
  if (a === "assign") {
    return animatedAssignment(g);
  }
  if (a === "status") {
    commit(() => setStatus(g, b.dataset.event, b.dataset.status));
    resultId = "";
  }
  if (a === "undo" && undoState) {
    const target = copy(undoState);
    try {
      localStorage.setItem(KEY, JSON.stringify(target));
      s = target;
      undoState = null;
      message = "saved";
      error = false;
      resultId = "";
    } catch {
      message = "storageError";
      error = true;
    }
  }
  if (a === "addPerson") return personEditor();
  if (a === "editPerson")
    return personEditor(g.members.find((m) => m.id === b.dataset.id));
  if (a === "editGroup")
    return modal(
      "editGroup",
      `<form id="group-form"><label>${esc(t("groupName"))}<input name="name" maxlength="60" value="${esc(g.name)}" required></label><div class="dialog-actions">${button("removeGroup", "removeGroup", "danger")}<button class="primary">${esc(t("save"))}</button></div></form>`,
    );
  if (a === "removeGroup")
    return confirmModal(
      "removeGroup",
      "removeConfirm",
      "confirmDelete",
      "delete",
    );
  if (a === "confirmDelete") {
    if (
      commit(() => {
        s.groups = s.groups.filter((x) => x.id !== g.id);
        s.activeId = s.groups[0]?.id || "";
      })
    ) {
      dialog.close();
      resultId = "";
    }
  }
  if (a === "period")
    return confirmModal(
      "newPeriod",
      "periodConfirm",
      "confirmPeriod",
      "resetPeriod",
    );
  if (a === "confirmPeriod") {
    if (
      commit(() => {
        g.periodStart = new Date().toISOString();
      })
    )
      dialog.close();
  }
  if (a === "settings") return settings();
  if (a === "export") return exportBackup();
  if (a === "import") return $("#backup-file").click();
  if (a === "confirmImport" && importData) {
    if (
      commit(() => {
        s = copy(importData);
      }, "restored")
    ) {
      dialog.close();
      importData = null;
      resultId = "";
      draft = { title: "", points: 1 };
    }
  }
  if (a === "deleteAll")
    return confirmModal(
      "deleteAll",
      "deleteAllConfirm",
      "confirmDeleteAll",
      "delete",
    );
  if (a === "confirmDeleteAll") {
    if (
      commit(() => {
        s = empty(s.lang);
      })
    ) {
      dialog.close();
      resultId = "";
    }
  }
  if (a === "about")
    return modal(
      "about",
      `<article><p>${esc(t("aboutText"))}</p><p>${esc(t("dataText"))}</p><p class="hint">${esc(t("version"))} 1.1.0 · © 2026 Evren Altındal</p><details><summary>${esc(t("terms"))}</summary><p>${esc(t("licenseText"))}</p><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener">Apple Standard EULA ↗</a></details></article>`,
    );
  if (a === "history")
    return modal(
      "history",
      `<div class="history-list">${g.events.map(eventHtml).join("")}</div>`,
    );
  render();
  if (a === "status" && dialog.open)
    modal(
      "history",
      `<div class="history-list">${current().events.map(eventHtml).join("")}</div>`,
    );
}
document.addEventListener("click", action);
document.addEventListener("input", (e) => {
  if (e.target.id === "task") {
    draft.title = e.target.value;
    e.target.setCustomValidity("");
  }
  if (e.target.id === "points") draft.points = Number(e.target.value);
});
document.addEventListener("change", async (e) => {
  if (drawing) return;
  if (e.target.id === "plan-select") {
    commit(() => {
      current().activePlanId = e.target.value;
    });
    resultId = "";
    showMemory = null;
    render();
  }
  if (e.target.id === "language") {
    commit(() => {
      s.lang = e.target.value;
    });
    history.replaceState(null, "", "#" + s.lang);
    render();
  }
  if (e.target.dataset.member) {
    commit(() => {
      current().members.find(
        (m) => m.id === e.target.dataset.member,
      ).available = e.target.checked;
    });
    render();
  }
  if (e.target.id === "backup-file") {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw Error("badBackup");
      importData = validate(JSON.parse(await file.text()));
      confirmModal("import", "importConfirm", "confirmImport", "restore");
    } catch {
      dialog.close();
      info("badBackup", true);
    }
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (drawing) return;
  const f = e.target,
    data = new FormData(f),
    g = current();
  if (f.id === "plan-form") {
    const names = taskLines(data.get("tasks"));
    if (
      commit(() => {
        if (f.dataset.append === "true") appendTasks(activePlan(g), names);
        else createPlan(g, String(data.get("title")), names);
      })
    ) {
      dialog.close();
      resultId = "";
      showMemory = null;
    }
  }
  if (f.id === "plan-task-form") {
    if (
      commit(() =>
        editPendingTask(
          activePlan(g),
          f.dataset.task,
          String(data.get("title")),
          Number(data.get("points")),
        ),
      )
    ) {
      dialog.close();
      resultId = "";
      showMemory = null;
    }
  }
  if (f.id === "new-form") {
    const names = String(data.get("people"))
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      name = String(data.get("group")).trim();
    if (
      !name ||
      !names.length ||
      names.length > 30 ||
      names.some((x) => x.length > 60)
    )
      return info("invalid", true);
    if (
      commit(() => {
        const x = group(name, names);
        s.groups.push(x);
        s.activeId = x.id;
      })
    ) {
      dialog.close();
      resultId = "";
      draft = { title: "", points: 1 };
    }
  }
  if (f.id === "person-form") {
    const name = String(data.get("name")).trim();
    if (!name) return;
    if (
      commit(() => {
        if (f.dataset.id) {
          const m = g.members.find((m) => m.id === f.dataset.id);
          m.name = name;
          m.weight = Number(data.get("weight"));
        } else {
          if (g.members.length >= 30) throw Error("limit");
          g.members.push({
            id: id(),
            name,
            weight: Number(data.get("weight")),
            available: true,
          });
        }
      })
    )
      dialog.close();
  }
  if (f.id === "group-form") {
    const name = String(data.get("name")).trim();
    if (!name) return;
    if (
      commit(() => {
        g.name = name;
      })
    )
      dialog.close();
  }
  render();
});
render();
