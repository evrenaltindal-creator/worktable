import test from "node:test";
import assert from "node:assert/strict";
import {
  empty,
  group,
  assign,
  candidates,
  setStatus,
  loadPoints,
  validate,
  migrate,
  copy,
} from "../web/groups-core.js";
import { translations } from "../web/groups-i18n.js";
test("rounds survive serialization, do not delete members, and avoid repeats", () => {
  let s = empty("tr");
  s.groups = [group("Home", ["A", "B", "C"])];
  s.activeId = s.groups[0].id;
  const chosen = [];
  for (let i = 0; i < 3; i++) {
    chosen.push(assign(s.groups[0], "Task", 2, () => 0).memberId);
    s = validate(JSON.parse(JSON.stringify(s)));
  }
  assert.equal(new Set(chosen).size, 3);
  assert.equal(s.groups[0].members.length, 3);
  const e = assign(s.groups[0], "Task", 1, () => 0);
  assert.equal(e.round, 2);
});
test("temporary exclusion and rejoining preserve the round", () => {
  const g = group("Home", ["A", "B", "C"]);
  assign(g, "Task", 1, () => 0);
  g.members[1].available = false;
  assert.equal(assign(g, "Task", 1, () => 0).memberName, "C");
  g.members[1].available = true;
  assert.equal(assign(g, "Task", 1, () => 0).memberName, "B");
  assert.equal(g.round.number, 1);
});
test("cancel restores current turn, skip consumes it and counts no workload", () => {
  const g = group("Home", ["A", "B"]);
  const e = assign(g, "Task", 3, () => 0);
  setStatus(g, e.id, "skipped");
  assert.equal(loadPoints(g, e.memberId), 0);
  assert.equal(candidates(g).members[0].name, "B");
  setStatus(g, e.id, "canceled");
  assert.equal(candidates(g).members.length, 2);
  setStatus(g, e.id, "done");
  assert.equal(loadPoints(g, e.memberId), 3);
  assert.equal(candidates(g).members[0].name, "B");
});
test("workload uses pending plus completed, period and availability", () => {
  const g = group("Home", ["A", "B"]);
  g.mode = "balance";
  const a = assign(g, "Heavy", 5, () => 0);
  setStatus(g, a.id, "done");
  assert.equal(assign(g, "Light", 1, () => 0).memberName, "B");
  assert.equal(candidates(g).members[0].name, "B");
  g.periodStart = "2099-01-01T00:00:00.000Z";
  assert.equal(candidates(g).members.length, 2);
  g.members.forEach((m) => (m.available = false));
  assert.throws(() => assign(g, "Task", 1), /noCandidates/);
});
test("random weights affect choice without altering round progress", () => {
  const g = group("Home", ["A", "B"]);
  g.mode = "random";
  g.members[0].weight = 9;
  assert.equal(
    assign(g, "Task", 1, (n) => {
      assert.equal(n, 10);
      return 8;
    }).memberName,
    "A",
  );
  assert.equal(assign(g, "Task", 1, () => 9).memberName, "B");
  assert.deepEqual(g.round.drawn, []);
});
test("groups and undo snapshots remain independent", () => {
  const s = empty();
  s.groups = [group("One", ["A"]), group("Two", ["B"])];
  const before = copy(s);
  assign(s.groups[0], "Task", 1);
  assert.equal(s.groups[1].events.length, 0);
  assert.equal(before.groups[0].events.length, 0);
});
test("backup validation rejects corruption and strips unknown fields", () => {
  const s = empty();
  const g = group("Home", ["<script>"]);
  s.groups = [g];
  s.activeId = g.id;
  assign(g, "Task", 2);
  assert.deepEqual(validate(copy(s)), s);
  for (const mutate of [
    (x) => (x.version = 1),
    (x) => (x.groups[0].members[0].weight = 0),
    (x) => (x.groups[0].events[0].memberId = "missing"),
    (x) => x.groups[0].round.drawn.push("missing"),
    (x) => x.groups.push(null),
  ]) {
    const x = copy(s);
    mutate(x);
    assert.throws(() => validate(x));
  }
  const x = copy(s);
  x.injected = "no";
  assert.equal(validate(x).injected, undefined);
});
test("legacy data migrates weights and leaves original untouched", () => {
  const legacy = {
    options: [{ text: "A", weight: 4 }],
    history: [{ text: "A", t: 1 }],
    example: false,
  };
  const before = copy(legacy);
  assert.equal(migrate(legacy).groups[0].members[0].weight, 4);
  assert.deepEqual(legacy, before);
  assert.equal(migrate({ ...legacy, example: true }).groups.length, 0);
});
test("all seven languages have the same complete keys", () => {
  for (const lang of Object.values(translations))
    assert.deepEqual(Object.keys(lang), Object.keys(translations.tr));
});
