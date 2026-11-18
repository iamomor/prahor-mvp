import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function fixture() {
  const storage = new Map(); let fail = false;
  const model = { exports: {}, require, Intl, Date };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("./records-model.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,model);
  const source = ts.transpileModule(fs.readFileSync(new URL("./demo-health.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const reload = () => { const context={exports:{},crypto:globalThis.crypto,require:name=>name==="./records-model"?model.exports:require(name),window:{localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>{if(fail)throw new Error("Synthetic quota failure");storage.set(key,value);}}}};vm.runInNewContext(source,context);return context.exports; };
  return { model:model.exports,service:reload(),reload,storage,fail:value=>{fail=value;} };
}
const plain=value=>JSON.parse(JSON.stringify(value));
const observation={id:"synthetic-weight",recordType:"mother",recordId:"demo-mother-001",label:"Weight",value:"60.00",unit:"kg",observedAt:"2026-11-18",source:"self_reported"};
function newEpisode(state,id="pregnancy-2") {return {...state.episodes[0],id,label:"Fictional previous pregnancy",lmp:"2024-01-01",edd:"2024-10-07",eddSource:"lmp",status:"ended",startDate:"2024-01-01",endDate:"2024-10-01"};}
function newBaby(state,pregnancyId,id){return {...state.babies[0],id,pregnancyId,label:`Fictional ${id}`};}
test("dating is calendar-correct, source-preserving, and clinician EDD remains authoritative",()=>{
 const {model}=fixture(),e=model.initialWorkspace().episodes[0];
 assert.equal(model.calendarDate("2026-02-30"),false);
 assert.equal(model.gestationalDating({...e,lmp:"2026-01-01",edd:"",eddSource:"lmp"},"2026-01-09").weeks,1);
 const result=model.gestationalDating({...e,lmp:"2026-01-01",edd:"2026-11-01",eddSource:"clinician_documented"},"2026-10-25");
 assert.equal(result.weeks,39);assert.equal(result.days,0);assert.match(result.method,/clinician_documented/);assert.ok(result.warning);
 assert.equal(model.gestationalDating({...e,lmp:"",edd:""},"2026-11-18"),null);
 assert.equal(model.trimester({...e,lmp:"",edd:""},"2026-11-18"),null);
});
test("multiple pregnancy episodes and twin histories remain independent after reload",()=>{
 const f=fixture();let state=f.service.getDemoWorkspace();const episode=newEpisode(state);
 state=f.service.saveDemoWorkspace({...state,episodes:[...state.episodes,episode],babies:[...state.babies,newBaby(state,episode.id,"twin-a"),newBaby(state,episode.id,"twin-b")]},episode.id,"create");
 f.service.saveDemoObservations([{...observation,pregnancyId:episode.id}, {...observation,id:"a",recordType:"baby",recordId:"twin-a",pregnancyId:episode.id},{...observation,id:"b",recordType:"baby",recordId:"twin-b",pregnancyId:episode.id}]);
 assert.equal(f.reload().getDemoObservationsStrict().filter(o=>o.recordId==="twin-a").length,1);
 assert.equal(f.reload().getDemoWorkspace().babies.length,3);
 assert.throws(()=>f.service.saveDemoObservation({...observation,id:"bad",recordType:"baby",recordId:"twin-a"}));
 assert.throws(()=>f.service.saveDemoWorkspace({...state,babies:state.babies.map(b=>b.id==="twin-a"?{...b,pregnancyId:"demo-pregnancy-001"}:b)},"twin-a","update"));
});
test("legacy Bujhi source identity stays pinned and retries never duplicate",()=>{
 const f=fixture();const extracted={...observation,source:"document_extracted",inputMethod:"image",sourceReportId:"synthetic-report",sourceFieldId:"field-1",rawValue:"60.00",referenceRange:"Fictional range",reviewStatus:"verified",reviewedAt:"2026-11-18T10:00:00.000Z",reviewedBy:"demo-user-001"};
 f.service.saveDemoObservation(extracted);f.service.saveDemoObservation({...extracted,id:"retry"});
 const records=f.reload().getDemoObservationsStrict();assert.equal(records.length,1);assert.equal(records[0].pregnancyId,"demo-pregnancy-001");assert.equal(records[0].rawValue,"60.00");assert.equal(records[0].referenceRange,"Fictional range");
});
test("corrections preserve exact original/updated values, actor, reason and atomic audit",()=>{
 const f=fixture();f.service.saveDemoObservation(observation);
 f.service.reviseDemoObservation(observation.id,{value:"61.250"},1,"Corrected from fictional notebook");
 const updated=f.service.getDemoObservationsStrict()[0];assert.equal(updated.rawValue,"60.00");assert.equal(updated.value,"61.250");assert.equal(updated.versions[0].before.value,"60.00");assert.equal(updated.versions[0].actor,"demo-user-001");assert.match(updated.versions[0].reason,/notebook/);
 assert.throws(()=>f.service.reviseDemoObservation(observation.id,{value:"99"},1,"Stale revision"));
 f.fail(true);assert.throws(()=>f.service.reviseDemoObservation(observation.id,{value:"62"},2,"Failure"));assert.equal(f.reload().getDemoObservationsStrict()[0].value,"61.250");f.fail(false);
 f.service.reviseDemoObservation(observation.id,{archived:true},2,"Archive instead of delete");assert.equal(f.reload().getDemoObservationsStrict()[0].archived,true);
 f.service.reviseDemoObservation(observation.id,{archived:false},3,"Restore");assert.equal(f.reload().getDemoObservationsStrict()[0].versions.length,3);
});
test("workspace stale writes, malformed data, and quota failure do not overwrite data",()=>{
 const f=fixture();const state=f.service.getDemoWorkspace();const saved=f.service.saveDemoWorkspace({...state,profile:{...state.profile,name:"Fictional updated mother"}},state.profile.id,"update","Name correction");
 assert.equal(saved.audit[0].actor,"demo-user-001");assert.match(saved.audit[0].before,/Ayesha/);assert.match(saved.audit[0].after,/updated mother/);
 assert.throws(()=>f.service.saveDemoWorkspace(state,"stale","update"));
 f.fail(true);assert.throws(()=>f.service.saveDemoWorkspace({...saved,profile:{...saved.profile,name:"Not saved"}},saved.profile.id,"update"));assert.equal(f.reload().getDemoWorkspace().profile.name,"Fictional updated mother");f.fail(false);
 assert.throws(()=>f.model.validateWorkspace({...saved,episodes:[{...saved.episodes[0],lmp:"2026-11-18",edd:"2026-01-01"}]}));
 assert.throws(()=>f.model.validateWorkspace({...saved,babies:[{...saved.babies[0],pregnancyId:"missing"}]}));
 assert.throws(()=>f.model.validateWorkspace({...saved,babies:[{...saved.babies[0],birthWeight:"3.2",weightUnit:""}]}));
});
test("conditions, medicines, immunization and appointments preserve provenance and dates",()=>{
 const f=fixture();let state=f.service.getDemoWorkspace();const provenance={source:"self_reported",enteredAt:"2026-11-18T10:00:00.000Z",enteredBy:"demo-user-001",reviewStatus:"unverified",sourceDocument:"",confirmedBy:"",confirmedAt:"",fictionalProvider:false};
 const entries=["condition","allergy","medicine","vaccine","encounter","event"].map(kind=>({id:kind,pregnancyId:"demo-pregnancy-001",recordType:"mother",recordId:"demo-mother-001",kind,name:`Fictional ${kind}`,date:"2026-11-18",endDate:"",status:"suspected",dose:kind==="medicine"?"As documented":"",frequency:"",doseNumber:"",notes:"Synthetic only",archived:false,provenance}));
 state=f.service.saveDemoWorkspace({...state,entries,appointments:[{id:"appointment",pregnancyId:"demo-pregnancy-001",recordType:"mother",recordId:"demo-mother-001",title:"Fictional ANC",date:"2026-12-01",kind:"anc",notes:"User-chosen date",completed:false,provenance}]},"condition","create");
 assert.throws(()=>f.model.validateWorkspace({...state,entries:[...state.entries,{...state.entries[0],id:"duplicate-condition"}]}));
 assert.equal(f.reload().getDemoWorkspace().entries.length,6);assert.equal(state.entries[0].status,"suspected");assert.equal(state.appointments[0].completed,false);
 assert.throws(()=>f.model.validateWorkspace({...state,entries:[{...entries[0],provenance:{...provenance,source:"document_extracted",sourceDocument:""}}]}));
});
test("Barta context requires per-record and per-observation consent and revocation takes effect",()=>{
 const f=fixture();f.service.saveDemoObservation(observation);let state=f.service.getDemoWorkspace();const records=f.service.getDemoObservationsStrict();
 assert.throws(()=>f.model.buildBartaContext(state,records,"demo-pregnancy-001",[observation.id]));
 state=f.service.saveDemoWorkspace({...state,consents:[{id:"grant",recordType:"mother",recordId:"demo-mother-001",recipient:"barta",allowed:true,observationIds:[observation.id],updatedAt:"2026-11-18T10:00:00.000Z"}]},"grant","consent");
 const context=f.model.buildBartaContext(state,records,"demo-pregnancy-001",[observation.id]);assert.equal(context.observations.length,1);assert.equal("name" in context,false);assert.equal(JSON.stringify(context).includes("Ayesha"),false);
 state=f.service.saveDemoWorkspace({...state,consents:state.consents.map(c=>({...c,allowed:false,observationIds:[]}))},"grant","consent");assert.throws(()=>f.model.buildBartaContext(state,records,"demo-pregnancy-001",[observation.id]));
});
test("quality warnings retain discrepancies and incompatible units instead of diagnosing",()=>{
 const f=fixture(),state=f.service.getDemoWorkspace();const rows=[observation,{...observation,id:"conflict",value:"61",unit:"lb"},{...observation,id:"unknown-unit",unit:"unsupported"}];
 const findings=plain(f.model.observationFindings(rows,state));assert.ok(findings.some(f=>/disagree/.test(f.message)));assert.ok(findings.some(f=>/unit is not supported/.test(f.message)));assert.equal(rows[0].value,"60.00");
});

test("fictional provider confirmation is explicit and immutable to maternal corrections",()=>{
 const f=fixture();const state=f.service.addFictionalProviderExample("demo-pregnancy-001","mother","demo-mother-001");const entry=state.entries[0];
 assert.equal(entry.provenance.fictionalProvider,true);assert.match(entry.provenance.confirmedBy,/Fictional provider/);assert.equal(entry.provenance.reviewStatus,"clinician_confirmed");
 assert.throws(()=>f.service.saveDemoWorkspace({...state,entries:[{...entry,notes:"Overwritten"}]},entry.id,"update"));
 assert.throws(()=>f.service.saveDemoWorkspace({...state,entries:[...state.entries,{...entry,id:"forged"}]},"forged","create"));
 assert.equal(f.reload().getDemoWorkspace().entries[0].notes,entry.notes);
});
