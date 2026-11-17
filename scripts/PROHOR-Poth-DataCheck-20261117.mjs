import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const file = new URL("../src/features/poth/facilities.json", import.meta.url);
const records = JSON.parse(readFileSync(file, "utf8"));
assert(Array.isArray(records), "Poth data must be an array");
const seen = new Set();
for (const item of records) {
  assert(typeof item.id === "string" && !seen.has(item.id), "Duplicate/invalid ID");
  seen.add(item.id);
  assert(/^https:\/\//.test(item.sourceUrl), "Source must use HTTPS");
  assert(item.bookingIntegration === "not_integrated", "Booking cannot be claimed");
  assert(Array.isArray(item.services) && item.services.length === 0,
    "Imported services require separate field-level verification");
  assert(Array.isArray(item.accessibility) && item.accessibility.length === 0,
    "Imported accessibility claims require separate field-level verification");
}
console.log(`Poth facility data: ${records.length} imported records; safety invariants pass.`);
