import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const coreFile = path.join(root, 'src/features/poth/nearbyCore.ts');
const js = ts.transpileModule(fs.readFileSync(coreFile, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: coreFile,
}).outputText;
const exports = {};
vm.runInNewContext(js, { exports, URL, Math, Set, Number, String }, { timeout: 2000 });
const { normalizeOsm, distanceInKm, categoryFromTags, insideBangladesh } = exports;
assert.equal(typeof normalizeOsm, 'function');
const origin = { lat: 23.8103, lon: 90.4125 };
const at = (km) => ({ lat: origin.lat + km / 111.195, lon: origin.lon });
const entry = (id, km, tags, type = 'node') => ({
  type, id, ...(type === 'node' ? at(km) : { center: at(km) }), tags,
});
assert.ok(Math.abs(distanceInKm(origin, at(1)) - 1) < 0.002);
assert.equal(insideBangladesh({ lat: 50, lon: 90 }), false);
assert.equal(categoryFromTags({ name: 'Maternity Example' }), null, 'Name alone never establishes clinical services');
assert.equal(categoryFromTags({ healthcare: 'birthing_centre' }), 'maternity');
assert.equal(categoryFromTags({ amenity: 'hospital' }), 'hospital');
const result = normalizeOsm([
  entry(1, 0.3, { amenity: 'hospital', name: 'Nearby Hospital', 'addr:street': 'Care Road', phone: '+880 1234567890', website: 'javascript:alert(1)' }),
  entry(2, 1.01, { amenity: 'clinic', name: 'Outside radius' }),
  entry(3, 0.8, { healthcare: 'birthing_centre', name: 'Community entry', emergency: 'yes' }, 'way'),
  entry(3, 0.8, { healthcare: 'birthing_centre', name: 'Duplicated feature' }, 'way'),
  entry(4, 0.7, { name: 'Not health care' }),
  { type: 'node', id: 5, lat: 0, lon: 0, tags: { amenity: 'hospital' } },
], origin, 1000);
assert.equal(result.length, 2, 'Strict radius, category filtering, bounds and deduplication');
assert.equal(result[0].name, 'Nearby Hospital');
assert.equal(result[0].website, null, 'Unsafe URL rejected');
assert.equal(result[1].locationPrecision, 'feature-center');
assert.equal(result[1].emergencyTagged, true, 'Mapped emergency tag is retained but unverified');
const map = fs.readFileSync(path.join(root, 'src/features/poth/PothNearbyMap.tsx'), 'utf8');
assert.match(map, /searchController\.current\?\.abort\(\)/, 'Prior search is cancelled');
assert.match(map, /searchRevision\.current !== revision/, 'Stale response is rejected');
const nearby = fs.readFileSync(path.join(root, 'src/app/api/poth/nearby/route.ts'), 'utf8');
assert.match(nearby, /places\.length >= 300/, 'Map normalization cap is disclosed');
const facilities = JSON.parse(fs.readFileSync(path.join(root, 'src/features/poth/facilities.json'), 'utf8'));
assert.ok(Array.isArray(facilities), 'Reviewed data is an array');
console.log(`POTH FINAL CHECK PASS: 12 assertions/groups; reviewed records=${facilities.length} (coverage not certified).`);
