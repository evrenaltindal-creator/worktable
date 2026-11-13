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
} from "./groups-core.js";
import { translations, nativeNames } from "./groups-i18n.js";
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
  app.innerHTML = `<main class="shell"><header class="top"><a href="index.html" class="brand"><span class="mark" aria-hidden="true">↻</span>${esc(t("title"))}</a><div class="top-actions">${language()}${button("settings", "settings")}</div></header><section class="intro"><div><p class="eyebrow">${esc(t("local"))}</p><h1>${esc(t("tagline"))}</h1><p class="muted">${esc(t("emptyHelp"))}</p></div></section><div class="workspace"><aside class="sidebar"><p class="eyebrow">${esc(t("groups"))}</p><nav class="group-list" aria-label="${esc(t("groups"))}">${s.groups.map((x) => `<button class="group-button" data-action="open" data-id="${esc(x.id)}" aria-current="${x.id === s.activeId}"><span>${esc(x.name)}</span><small>${x.members.length}</small></button>`).join("")}</nav>${button("new", "newGroup")}<footer><a href="quick.html#${s.lang}">${esc(t("quick"))} ↗</a><a href="privacy.html#${s.lang}">${esc(t("privacy"))}</a><a href="support.html#${s.lang}">${esc(t("support"))}</a></footer></aside><section id="board">${g ? board(g) : `<div class="empty"><span class="orbit" aria-hidden="true">◎</span><h2>${esc(t("emptyTitle"))}</h2><p class="muted">${esc(t("emptyHelp"))}</p><div class="empty-actions">${button("new", "newGroup", "primary")}${button("sample", "sample")}</div></div>`}</section></div><footer class="bottom"><p id="status" role="status" aria-live="polite" class="status ${error ? "error" : ""}">${message ? esc(t(message)) : esc(t("local"))}</p>${button("undo", "undo", "small", undoState ? "" : "disabled")}${button("about", "about", "small")}</footer></main>`;
}
function board(g) {
  const c = candidates(g),
    pending = g.events.filter((e) => e.status === "assigned");
  const selected = g.events.find((e) => e.id === resultId);
  return `<div class="board-heading"><div><p class="eyebrow">${esc(t("groups"))}</p><h2 class="board-title">${esc(g.name)}</h2></div>${button("editGroup", "edit", "small")}</div><div class="board-grid"><section class="card chooser"><h2>${esc(t("rule"))}</h2><div class="rule-grid" role="group" aria-label="${esc(t("rule"))}">${["round", "random", "balance"].map((mode) => button("mode", mode, "", `data-mode="${mode}" aria-pressed="${g.mode === mode}"`)).join("")}</div><p class="hint">${esc(t(g.mode + "Help"))}</p><div class="stats"><div class="stat"><span class="hint">${esc(t(g.mode === "round" ? "remaining" : "available"))}</span><strong>${g.mode === "round" ? c.members.length : g.members.filter((m) => m.available).length}</strong></div><div class="stat"><span class="hint">${esc(t(g.mode === "round" ? "roundNumber" : "pending"))}</span><strong>${g.mode === "round" ? g.round.number + (c.nextRound ? 1 : 0) : pending.length}</strong></div></div><label for="task">${esc(t("task"))}<input id="task" maxlength="120" value="${esc(draft.title)}" placeholder="${esc(t("taskHint"))}" autocomplete="off"></label><div class="effort-row"><p class="hint">${esc(t("effort"))} · 1–5</p><label class="hide" for="points">${esc(t("effort"))}</label><select id="points" aria-label="${esc(t("effort"))}">${[1, 2, 3, 4, 5].map((n) => `<option ${n === draft.points ? "selected" : ""}>${n}</option>`).join("")}</select></div>${button("assign", "assign", "primary", !c.members.length ? "disabled" : "")}${selected ? `<section class="result" role="status" aria-live="polite"><span class="eyebrow">${esc(t("assigned"))}</span><strong>${esc(selected.memberName)}</strong><p>${esc(selected.title)}</p><p>${esc(reason(selected))}</p></section>` : ""}</section><section class="card"><div class="section-heading"><h2>${esc(t("members"))}</h2><span class="hint">${g.members.length}/30</span></div><p class="hint">${esc(t("availableHelp"))}</p><div class="member-list">${g.members.map((m) => `<div class="person ${m.available ? "" : "off"}"><span class="avatar" aria-hidden="true">${esc(Array.from(m.name)[0] || "·")}</span><span class="person-name">${esc(m.name)}${g.mode === "random" ? `<small>${esc(t("weight"))}: ${m.weight}</small>` : ""}</span><label><span class="hide">${esc(m.name)}: ${esc(t("available"))}</span><input type="checkbox" data-member="${esc(m.id)}" ${m.available ? "checked" : ""} aria-label="${esc(m.name)}: ${esc(t("available"))}"></label>${button("editPerson", "edit", "", `data-id="${esc(m.id)}" aria-label="${esc(t("editPerson"))}: ${esc(m.name)}"`)}</div>`).join("")}</div>${button("addPerson", "addPerson", "small", g.members.length >= 30 ? "disabled" : "")}</section></div><section class="card history-card"><div class="section-heading"><div><h2>${esc(t("load"))}</h2><p class="hint">${esc(t("period"))}: ${esc(date(g.periodStart))}</p></div>${button("period", "newPeriod", "small")}</div><div class="load-list">${g.members
    .map((m) => {
      const p = g.events.filter(
        (e) => e.memberId === m.id && e.at >= g.periodStart,
      );
      const done = p
          .filter((e) => e.status === "done")
          .reduce((a, e) => a + e.points, 0),
        wait = p
          .filter((e) => e.status === "assigned")
          .reduce((a, e) => a + e.points, 0);
      const max = Math.max(1, ...g.members.map((x) => loadPoints(g, x.id)));
      return `<div><div class="load-line"><span>${esc(m.name)}</span><span>${esc(t("pending"))} ${wait} · ${esc(t("completed"))} ${done}</span></div><div class="bar" aria-hidden="true"><span style="width:${((wait + done) / max) * 100}%"></span></div></div>`;
    })
    .join(
      "",
    )}</div></section><section class="card history-card"><div class="section-heading"><h2>${esc(t("history"))}</h2><span class="hint">${g.events.length}</span></div><p class="hint">${esc(t("skipHelp"))} ${esc(t("cancelHelp"))}</p><div class="history-list" style="margin-top:16px">${g.events.slice(0, 30).map(eventHtml).join("") || `<p class="hint">${esc(t("noHistory"))}</p>`}</div>${g.events.length > 30 ? button("history", "allHistory", "small") : ""}</section>`;
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
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action,
    g = current();
  if (a === "close") return dialog.close();
  if (a === "new") return newGroup();
  if (a === "sample") {
    if (s.groups.length >= 30) return info("limit", true);
    commit(() => {
      const x = group(t("sampleGroup"), t("samplePeople").split("\n"));
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
      g.mode = b.dataset.mode;
    });
  if (a === "assign") {
    if (g.events.length >= 5000) return info("historyFull", true);
    if (!draft.title.trim()) {
      $("#task").reportValidity();
      $("#task").focus();
      return info("invalid", true);
    }
    let picked;
    if (
      commit(() => {
        picked = assign(g, draft.title, draft.points);
      })
    ) {
      resultId = picked.id;
      try {
        window.Capacitor?.nativePromise?.("Haptics", "impact", {
          style: "LIGHT",
        })?.catch(() => {});
      } catch {}
    }
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
  if (e.target.id === "task") draft.title = e.target.value;
  if (e.target.id === "points") draft.points = Number(e.target.value);
});
document.addEventListener("change", async (e) => {
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
  const f = e.target,
    data = new FormData(f),
    g = current();
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
