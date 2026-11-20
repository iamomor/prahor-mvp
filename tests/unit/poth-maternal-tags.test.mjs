// OSM maps obstetric services as healthcare:speciality=gynaecology (wiki: "Obstetrics and Gynaecology") or maternity.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const source = readFileSync(new URL("../../src/features/poth/nearbyCore.ts", import.meta.url), "utf8");
const { categoryFromTags } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`);

test("maternal speciality tags put a hospital or clinic in the maternity category", () => {
  for (const speciality of ["obstetrics", "gynaecology", "Gynaecology", "gynecology", "maternity", "general;gynaecology"]) {
    assert.equal(categoryFromTags({ amenity: "hospital", "healthcare:speciality": speciality }), "maternity", speciality);
  }
});
test("other specialities and names never imply maternity", () => {
  assert.equal(categoryFromTags({ amenity: "hospital", "healthcare:speciality": "ophthalmology" }), "hospital");
  assert.equal(categoryFromTags({ amenity: "clinic", name: "Mother and Child Clinic" }), "clinic");
  assert.equal(categoryFromTags({ amenity: "clinic", "healthcare:speciality": "gynaecologist-ish" }), "clinic");
});
test("the committed map extract now has 25 maternity-category places (was 1)", () => {
  const data = JSON.parse(readFileSync(new URL("../../src/features/poth/community-facilities.json", import.meta.url), "utf8"));
  assert.equal(data.filter(e => categoryFromTags(e.tags ?? {}) === "maternity").length, 25);
});
