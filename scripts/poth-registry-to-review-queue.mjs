#!/usr/bin/env node
// Convert exported Ministry HRIS organization-list CSV into an unreviewed clinical candidate queue.
// Usage: node scripts/poth-registry-to-review-queue.mjs <official-export.csv> <output-review.csv>
// This script never writes facilities.json, and NEVER marks a row reviewed.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const args=process.argv.slice(2);
if(args.length!==2) {console.error('Usage: node scripts/poth-registry-to-review-queue.mjs <official-export.csv> <output-review.csv>');process.exit(2);}
function parseCsv(src){let rows=[],row=[],cell='',q=false;for(let i=0;i<src.length;i++){const c=src[i];if(q){if(c==='"'&&src[i+1]==='"'){cell+='"';i++;}else if(c==='"')q=false;else cell+=c;}else if(c==='"')q=true;else if(c===','){row.push(cell);cell='';}else if(c==='\r'||c==='\n'){if(c==='\r'&&src[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}if(q)throw Error('Broken CSV quote');if(cell||row.length){row.push(cell);rows.push(row);}return rows.filter(r=>r.some(x=>x.trim()));}
const escapeCsv=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const raw=parseCsv(readFileSync(resolve(args[0]),'utf8').replace(/^\uFEFF/,''));
if(!raw.length)throw Error('Empty export');
const header=raw.shift().map(v=>v.trim().toLowerCase().replaceAll(/[^a-z0-9]/g,''));
const get=(row,...names)=>{for(const n of names){const idx=header.indexOf(n);if(idx>=0)return (row[idx]??'').trim();}return '';};
const districtText=readFileSync('src/features/poth/bdDistricts.ts','utf8');
const districts=new Set([...districtText.matchAll(/^\s{4}"([^"\n]+)"\s*,?\s*$/gm)].map(x=>x[1]));
const synonyms={'Chittagong':'Chattogram','Comilla':'Cumilla','Jessore':'Jashore','Bogra':'Bogura','Barisal':'Barishal','Netrakona':'Netrokona','Nawabganj':'Chapainawabganj'};
const eligibleType=/hospital|maternal|maternity|upazila health complex|community clinic|union health|health centre|health center|medical college hospital|family welfare centre|family welfare center|urban dispensary/i;
const forbiddenType=/administrative|office|directorate|medical college$|nursing college|institute of health technology|training|laboratory|school health clinic|district level office|divisional level office/i;
const records=[],ids=new Set(),districtCoverage=new Map();
let excluded=0,unknown=0;
for(const row of raw){
 const name=get(row,'name','facilityname','organizationname');
 const rawDistrict=get(row,'district','districtname');
 const district=synonyms[rawDistrict]??rawDistrict;
 const type=get(row,'type','facilitytype','facilitytypename');
 const id=get(row,'code','facilityid','id');
 const area=get(row,'upazila','upazilaname','citycorporation','citycorporationname');
 if(!name||!type||!eligibleType.test(type)||forbiddenType.test(type)){excluded++;continue;}
 if(!districts.has(district)){unknown++;continue;}
 const key=id||`${district}|${name}`;
 if(ids.has(key))continue;
 ids.add(key);
 districtCoverage.set(district,(districtCoverage.get(district)||0)+1);
 // NOTE: an administrative area is NOT a street address. Only a reviewer may fill address.
 records.push({name,district,address:'',source_url:'',reviewed:'NO',phone:'',services:'',registry_id:id,facility_type:type,area_hint:area,
   review_note:'Candidate from official export only; open a facility-specific registry profile; verify name, address, service evidence and source URL before changing NO to YES.'});
}
records.sort((a,b)=>a.district.localeCompare(b.district)||a.name.localeCompare(b.name));
const cols=['name','district','address','source_url','reviewed','phone','services','registry_id','facility_type','area_hint','review_note'];
const data=[cols,...records.map(r=>cols.map(c=>r[c]??''))];
writeFileSync(resolve(args[1]),'\uFEFF'+data.map(r=>r.map(escapeCsv).join(',')).join('\r\n')+'\r\n');
console.log(`Candidates: ${records.length}; ${districtCoverage.size}/64 districts; excluded non-care rows: ${excluded}; unknown districts: ${unknown}`);
console.log('All reviewed=NO. This is a review queue, NOT a validated directory.');
