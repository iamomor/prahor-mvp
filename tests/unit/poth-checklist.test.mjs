import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source=stripTypeScriptTypes(readFileSync(new URL('../../src/features/poth/visitChecklist.ts',import.meta.url),'utf8'));
const {parseVisitChecklist,serializeVisitChecklist}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('saved checklist round-trips exactly eight choices without mutating them',()=>{
 const values=[true,false,true,false,false,true,false,true],copy=[...values];
 assert.deepEqual(parseVisitChecklist(serializeVisitChecklist(values)),copy);assert.deepEqual(values,copy);
});
test('corrupt, unsupported, oversized or partial saved state cannot become an approved checklist',()=>{
 for(const raw of [null,'','broken','[]','null','{"version":2,"checked":[]}',JSON.stringify({version:1,checked:[true]}),JSON.stringify({version:1,checked:Array(8).fill('yes')}),'x'.repeat(257)]) assert.equal(parseVisitChecklist(raw),null);
});
test('storage rejects injected facility, health, location or question payloads',()=>{
 for(const field of ['facility','location','questions','health'])assert.equal(parseVisitChecklist(JSON.stringify({version:1,checked:Array(8).fill(false),[field]:'not allowed'})),null);
 assert.deepEqual(Object.keys(JSON.parse(serializeVisitChecklist(Array(8).fill(false)))).sort(),['checked','version']);
});
test('serializer refuses missing/extra check marks and preserves an all-clear checklist',()=>{
 assert.throws(()=>serializeVisitChecklist([true]));assert.throws(()=>serializeVisitChecklist(Array(9).fill(false)));
 assert.deepEqual(parseVisitChecklist(serializeVisitChecklist(Array(8).fill(false))),Array(8).fill(false));
});
