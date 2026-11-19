import test from "node:test";
import assert from "node:assert/strict";
import { arcGeometry, arcLabel } from "./lifeline-arc.ts";

test("trimester boundaries stay consistent", () => {
  assert.equal(arcGeometry({ weeks: 13, days: 6 }).trimester, 1);
  assert.equal(arcGeometry({ weeks: 14, days: 0 }).trimester, 2);
  assert.equal(arcGeometry({ weeks: 27, days: 6 }).trimester, 2);
  assert.equal(arcGeometry({ weeks: 28, days: 0 }).trimester, 3);
});

test("arc moves along the line and clamps late dates", () => {
  const early = arcGeometry({ weeks: 5, days: 0 });
  const late = arcGeometry({ weeks: 30, days: 0 });
  assert.ok(early.current.x < late.current.x);
  for (const geometry of [early, late]) assert.ok(Math.abs(Math.hypot(geometry.current.x - geometry.cx, geometry.current.y - geometry.cy) - geometry.r) < 1e-6);
  assert.equal(arcGeometry({ weeks: 42, days: 3 }).current.x, arcGeometry({ weeks: 40, days: 0 }).current.x);
  assert.ok(Number.isFinite(arcGeometry({ weeks: 42, days: 3, beadWeeks: [45] }).beads[0].y));
});
test("arc rejects unusable estimates", () => {
  assert.throws(() => arcGeometry({ weeks: -1, days: 0 }), RangeError);
  assert.throws(() => arcGeometry({ weeks: 10, days: 8 }), RangeError);
  assert.throws(() => arcGeometry({ weeks: NaN, days: 0 }), RangeError);
});
test("accessible labels contain the facts in both languages", () => {
  assert.match(arcLabel(24, 6, 2, "en"), /24 weeks 6 days, trimester 2/);
  assert.match(arcLabel(24, 6, 2, "bn"), /২৪ সপ্তাহ ৬ দিন/);
});
