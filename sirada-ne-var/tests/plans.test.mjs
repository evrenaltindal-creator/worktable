import test from "node:test";
import assert from "node:assert/strict";
import {
  group,
  empty,
  copy,
  assign,
  setStatus,
  validate,
} from "../web/groups-core.js";
import {
  createPlan,
  assignNextTask,
  progress,
  planContext,
  allocations,
  appendTasks,
  editPendingTask,
  removePendingTask,
  planText,
} from "../web/plan-core.js";
import { candidates } from "../web/groups-core.js";
import { planTranslations } from "../web/plan-i18n.js";
import { translations } from "../web/groups-i18n.js";
const household = () => group("Home", ["Me", "Partner"]);
test("six tasks distribute once each and evenly between two people", () => {
  const g = household(),
    p = createPlan(g, "Jobs", ["a", "b", "c", "d", "e", "f"]);
  for (let i = 0; i < 6; i++) {
    const e = assignNextTask(g, p, () => 0);
    assert.equal(e.title, p.tasks[i].title);
    assert.equal(progress(g, p).assigned, i + 1);
  }
  assert.equal(g.events.length, 6);
  assert.equal(new Set(g.events.map((e) => e.taskId)).size, 6);
  assert.deepEqual(
    allocations(g, p).map((x) => x.events.length),
    [3, 3],
  );
  assert.equal(progress(g, p).finished, true);
  assert.throws(() => assignNextTask(g, p), /planFinished/);
  assert.ok(g.events.every((e) => e.status === "assigned"));
});
test("new task lists have independent rounds and workload", () => {
  const g = household();
  assign(g, "Earlier", 5, () => 0);
  const p = createPlan(g, "One", ["a", "b"]);
  assignNextTask(g, p, () => 0);
  const q = createPlan(g, "Two", ["c", "d"]);
  q.mode = "balance";
  assert.equal(candidates(planContext(g, q)).members.length, 2);
  assignNextTask(g, q, () => 0);
  assert.equal(progress(g, p).assigned, 1);
  assert.equal(g.round.drawn.length, 1);
  assert.equal(p.round.drawn.length, 1);
});
test("workload balancing honors task effort within the list", () => {
  const g = household(),
    p = createPlan(g, "Jobs", ["Heavy", "Light", "Next"]);
  p.mode = "balance";
  p.tasks[0].points = 5;
  assert.equal(assignNextTask(g, p, () => 0).memberName, "Me");
  assert.equal(assignNextTask(g, p, () => 0).memberName, "Partner");
  assert.equal(assignNextTask(g, p, () => 0).memberName, "Partner");
});
test("cancel requeues the task and old assignments cannot replace a newer assignment", () => {
  const g = household(),
    p = createPlan(g, "Jobs", ["a", "b"]);
  const old = assignNextTask(g, p, () => 0);
  setStatus(g, old.id, "canceled");
  assert.equal(progress(g, p).next.id, p.tasks[0].id);
  assert.equal(p.round.drawn.length, 0);
  const next = assignNextTask(g, p, () => 0);
  assert.equal(next.taskId, old.taskId);
  assert.throws(() => setStatus(g, old.id, "done"), /invalid/);
  assert.equal(p.tasks[0].eventId, next.id);
  setStatus(g, next.id, "done");
  assert.equal(progress(g, p).assigned, 1);
});
test("plans, event links, rounds and pending tasks survive backup round trip", () => {
  const s = empty("tr"),
    g = household();
  s.groups = [g];
  s.activeId = g.id;
  const p = createPlan(g, "Jobs", ["a", "b", "c"]);
  assignNextTask(g, p, () => 0);
  const saved = validate(copy(s));
  assert.deepEqual(saved, s);
  assert.equal(
    progress(saved.groups[0], saved.groups[0].plans[0]).next.title,
    "b",
  );
  const corrupted = copy(s);
  corrupted.groups[0].plans[0].tasks[1].eventId = g.events[0].id;
  assert.throws(() => validate(corrupted), /badBackup/);
});
test("old v2 backups retain groups, choices and history when upgraded", () => {
  const s = empty("tr"),
    g = household();
  s.groups = [g];
  s.activeId = g.id;
  assign(g, "Old task", 2, () => 0);
  s.version = 2;
  delete g.plans;
  delete g.activePlanId;
  const upgraded = validate(copy(s));
  assert.equal(upgraded.version, 3);
  assert.equal(upgraded.groups[0].events[0].title, "Old task");
  assert.deepEqual(upgraded.groups[0].plans, []);
  assert.equal(upgraded.groups[0].members.length, 2);
});
test("pending tasks can be edited, appended and removed without changing assigned work", () => {
  const g = household(),
    p = createPlan(g, "Jobs", ["a", "b"]);
  const first = assignNextTask(g, p, () => 0);
  assert.throws(
    () => editPendingTask(p, first.taskId, "Changed", 2),
    /planInvalid/,
  );
  editPendingTask(p, p.tasks[1].id, "Edited", 4);
  appendTasks(p, ["extra"]);
  removePendingTask(g, p, p.tasks[2].id);
  assert.equal(p.tasks.length, 2);
  assert.equal(p.tasks[1].title, "Edited");
  assert.equal(g.events[0].title, "a");
  const before = copy(g);
  assignNextTask(g, p, () => 0);
  assert.equal(progress(before, before.plans[0]).assigned, 1);
});
test("share list distinguishes assigned jobs from completed jobs", () => {
  const g = household(),
    p = createPlan(g, "Jobs", ["a", "b"]);
  const a = assignNextTask(g, p, () => 0);
  assignNextTask(g, p, () => 0);
  setStatus(g, a.id, "done");
  const text = planText(g, p, { ...translations.en, ...planTranslations.en });
  assert.ok(text.includes("[x] a"));
  assert.ok(text.includes("[ ] b"));
  assert.ok(text.includes("Me"));
  assert.ok(text.includes("Partner"));
  assert.ok(text.includes("Completed"));
  assert.ok(!text.includes("undefined"));
});
test("all seven task dictionaries have complete strings", () => {
  for (const dict of Object.values(planTranslations)) {
    assert.deepEqual(Object.keys(dict), Object.keys(planTranslations.tr));
    assert.ok(
      Object.values(dict).every((s) => typeof s === "string" && s.length),
    );
  }
});
