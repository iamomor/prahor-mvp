import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const base = new URL('../../src/features/poth/', import.meta.url);
const url = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const coreSource = stripTypeScriptTypes(readFileSync(new URL('nearbyCore.ts', base), 'utf8'));
const districtSource = stripTypeScriptTypes(readFileSync(new URL('bdDistricts.ts', base), 'utf8'));
const source = stripTypeScriptTypes(readFileSync(new URL('directoryCore.ts', base), 'utf8'))
  .replace('"./nearbyCore"', JSON.stringify(url(coreSource))).replace('"./bdDistricts"', JSON.stringify(url(districtSource)));
const { buildDirectory, parseDirectoryQuery, searchDirectory, safePhone, safeWebsite, normalizeSearch, PAGE_SIZE } = await import(url(source));
const { normalizeOsm, distanceInKm } = await import(url(coreSource));
const registry = JSON.parse(readFileSync(new URL('registry-records.json', base), 'utf8'));
const snapshot = JSON.parse(readFileSync(new URL('community-facilities.json', base), 'utf8'));
const entries = buildDirectory(registry, snapshot);
const query = value => parseDirectoryQuery(new URLSearchParams(value));
const point = { lat: 23.8103, lon: 90.4125 };
const osm = (id, tags, extra = {}) => ({ type: 'node', id, ...point, tags: { amenity: 'hospital', name: 'Example', ...tags }, ...extra });

test('source profiles cover all eight divisions without inventing access, entrances or phone verification', () => {
 assert.equal(new Set(registry.map(p => p.division)).size, 8);
 const official = entries.filter(p => p.source === 'registry'); assert.equal(official.length, registry.length);
 for (const p of official) { assert.equal(p.lat, null); assert.equal(p.lon, null); assert.ok(Object.values(p.accessibility).every(x => x === 'unknown')); assert.match(p.sourceUrl, /^https:\/\/hrm\.dghs\.gov\.bd\/public\/facility-registry\/facilities\/\d+\/profile$/); }
});
test('community index preserves nationwide records with stable OSM pointers, not a 300-entry directory cap', () => {
 assert.equal(snapshot.length, 7535); assert.ok(entries.filter(p => p.source === 'community').length > 7000);
 assert.equal(new Set(entries.map(p => p.id)).size, entries.length);
});
test('district filters never infer a district from a facility name or an approximate city', () => {
 const data = buildDirectory([], [osm(1, { name: 'Dhaka Hospital', 'addr:city': 'Dhaka' }), osm(2, { 'addr:district': 'Dhaka' })]);
 assert.equal(data.find(p => p.id === 'node/1').district, null);
 assert.equal(searchDirectory(data, query({ district: 'Dhaka' })).total, 1);
});
test('canonical and legacy district names map to existing administrative labels', () => {
 const data = buildDirectory([], [osm(1, { 'addr:district': 'Chittagong' }), osm(2, { 'addr:district': 'Barisal District' })]);
 assert.equal(data.find(p => p.id === 'node/1').district, 'Chattogram'); assert.equal(data.find(p => p.id === 'node/2').division, 'Barishal');
});
test('invalid and duplicate filters, prototypes, impossible district/division pairs and bad pages are rejected', () => {
 for (const q of ['division=constructor', 'division=Dhaka&district=Sylhet', 'page=0', 'page=-1', 'page=1.5', 'page=0001', 'q=a&q=b', 'lat=0', 'source=verified', 'access=all', 'kind=emergency', 'q='+'x'.repeat(121)]) assert.equal(query(q), null, q);
});
test('pagination is bounded, stable, complete and clamps a stale last page after filtering', () => {
 const first = searchDirectory(entries, query('')); assert.equal(first.places.length, PAGE_SIZE);
 const ids = new Set(); for (let page=1;page<=first.pages;page++) for (const p of searchDirectory(entries, query({ page: String(page) })).places) { assert.ok(!ids.has(p.id)); ids.add(p.id); }
 assert.equal(ids.size, first.total); assert.equal(searchDirectory(entries, query({ source: 'registry', page: '99999' })).page, 1);
});
test('Bangla names and word-order-independent queries match published names', () => {
 assert.ok(searchDirectory(entries, query({ q: 'ঢাকা মেডিকেল', source: 'registry' })).total > 0);
 assert.ok(searchDirectory(entries, query({ q: 'hospital chattogram', source: 'registry' })).total > 0);
 assert.equal(normalizeSearch('  DHAKA\u200b   Hospital  '), 'dhaka hospital');
});
test('OSM access tags stay reported and unverified; a missing tag is unknown, not inaccessible', () => {
 const data=buildDirectory([], [osm(1,{wheelchair:'yes'}), osm(2,{wheelchair:'limited'}), osm(3,{wheelchair:'no'}), osm(4,{})]);
 assert.equal(searchDirectory(data, query({ access:'wheelchair' })).total,1);
 assert.equal(data.find(p=>p.id==='node/4').accessibility.wheelchair,'unknown');
 assert.equal(data.find(p=>p.id==='node/2').accessibility.wheelchair,'reported_limited');
});
test('malformed tags, deleted/abandoned/private features and duplicate IDs cannot break or pollute results', () => {
 const data=buildDirectory([], [osm(1,{name:44,healthcare:{}}), osm(2,{disused:'yes'}),osm(3,{access:'private'}),osm(4,{abandoned:'yes'}),osm(5,{}),osm(5,{}),osm(6,{}, {lat:0})]);
 assert.equal(data.length,2);assert.ok(!data.some(p=>['node/2','node/3','node/4','node/6'].includes(p.id)));
});
test('unsafe URLs, credential URLs and malformed telephone values are withheld', () => {
 for(const x of ['javascript:alert(1)','data:text/html,a','https://user:secret@example.com','file:///tmp/x',5])assert.equal(safeWebsite(x),null);
 assert.equal(safeWebsite('https://hospital.example.org'),'https://hospital.example.org/');
 assert.equal(safePhone('+880 1712345678;01799999999'),'+880 1712345678');assert.equal(safePhone('Call 999 now'),null);
});
test('nearby normalization rejects stale/unsafe records, preserves source precision and caps at 300', () => {
 const data=normalizeOsm([osm(1,{name:'A',website:'javascript:x'}),osm(2,{disused:'yes'}),osm(3,{name:55}),{...osm(4,{}),type:'way',center:point}],point,1000);
 assert.equal(data.length,3);assert.equal(data.find(p=>p.id==='node/1').website,null);assert.equal(data.find(p=>p.id==='way/4').locationPrecision,'feature-center');
 assert.equal(normalizeOsm(Array.from({length:400},(_,i)=>osm(i+100,{})),point,1000).length,300);
});
test('nearby distance uses the actual radius before display rounding', () => {
 const outside={...point,lat:point.lat+1.01/111.195};assert.ok(distanceInKm(point,outside)>1);
 assert.equal(normalizeOsm([osm(1,{},outside)],point,1000).length,0);
});
test('every source/category filter returns only its requested records and empty results do not alter coverage totals', () => {
 const data=searchDirectory(entries,query({source:'registry',kind:'hospital'}));assert.ok(data.places.every(p=>p.source==='registry'&&p.kind==='hospital'));
 const empty=searchDirectory(entries,query({q:'no-match-abcdefghijk'}));assert.equal(empty.total,0);assert.equal(empty.registryCount,registry.length);
});
console.log(`Indexed records: ${entries.length}; registry profiles: ${registry.length}; usable community records: ${entries.length-registry.length}; community records with district tags: ${entries.filter(p=>p.source==='community'&&p.district).length}.`);
