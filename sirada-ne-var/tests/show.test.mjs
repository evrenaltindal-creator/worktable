import test from "node:test";
import assert from "node:assert/strict";
import { sectors, landingRotation, reel } from "../web/show-core.js";
const members = [
  { id: "a", name: "A", weight: 1 },
  { id: "b", name: "B", weight: 3 },
  { id: "c", name: "C", weight: 2 },
];
test("wheel lands with recorded choice at the fixed top pointer", () => {
  for (const weighted of [false, true])
    for (const member of members) {
      const sector = sectors(members, weighted).find((s) => s.id === member.id);
      assert.ok(
        Math.abs(
          (sector.middle + landingRotation(members, member.id, weighted)) % 360,
        ) < 1e-8,
      );
    }
});
test("weighted wheel geometry matches the selection weights", () => {
  const slices = sectors(members, true);
  assert.deepEqual(
    slices.map((s) => s.end - s.start),
    [60, 180, 120],
  );
  assert.equal(slices.at(-1).end, 360);
});
test("slot lands on exactly the recorded member and uses eligible members only", () => {
  for (const member of members) {
    const sequence = reel(members, member.id);
    assert.equal(sequence.rows[sequence.winnerIndex].id, member.id);
    assert.ok(
      sequence.rows.every((row) => members.some((m) => m.id === row.id)),
    );
    assert.ok(sequence.winnerIndex > 30);
  }
});
test("single-person stage and missing selection are explicit", () => {
  assert.equal(landingRotation([members[0]], "a"), 180);
  assert.equal(
    reel([members[0]], "a").rows.every((m) => m.id === "a"),
    true,
  );
  assert.throws(() => landingRotation(members, "missing"));
  assert.throws(() => reel(members, "missing"));
});
