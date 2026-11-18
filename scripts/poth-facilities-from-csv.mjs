#!/usr/bin/env node
// PROHOR Poth registry import v2. Node 20+. Safe default: dry run, no writes.
// node scripts/poth-facilities-from-csv.mjs F:\\DOWNLOADS\\facilities-review.csv
// node scripts/poth-facilities-from-csv.mjs F:\\DOWNLOADS\\facilities-review.csv --write
import { readFileSync, writeFileSync, renameSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const src = args.find(x => !x.startsWith('--'));
const write = args.includes('--write');
const target = resolve('src/features/poth/facilities.json');
if (!src || args.some(x => x.startsWith('--') && x !== '--write')) {
  console.error('Usage: node scripts/poth-facilities-from-csv.mjs <reviewed.csv> [--write]');
  process.exit(2);
}
function csv(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
    else if(c==='"'){if(cell.trim())throw Error('Malformed CSV: misplaced quote');quoted=true;}
    else if(c===','){row.push(cell);cell='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted)throw Error('Malformed CSV: unterminated quote');
  if(cell.length||row.length){row.push(cell);rows.push(row);}
  return rows.filter(row=>row.some(v=>v.trim()));
}
function uuidFromKey(key){
  const bytes=Buffer.from(createHash('sha256').update('prohor-poth-v2:'+key).digest().subarray(0,16));
  bytes[6]=(bytes[6]&0x0f)|0x50;bytes[8]=(bytes[8]&0x3f)|0x80;
  const x=bytes.toString('hex');return `${x.slice(0,8)}-${x.slice(8,12)}-${x.slice(12,16)}-${x.slice(16,20)}-${x.slice(20)}`;
}
function districtOptions(){
  const source=readFileSync('src/features/poth/bdDistricts.ts','utf8');
  // The project's file has explicit quoted district names in arrays.
  const names=[...source.matchAll(/^\s{4}"([^"\n]+)"\s*,?\s*$/gm)].map(x=>x[1]);
  if(names.length!==64)throw Error('Expected 64 districts in bdDistricts.ts; found '+names.length);
  return new Set(names);
}
function registryUrl(v){
  try{
    const u=new URL(v);
    if(u.protocol!=='https:'||!['hrm.dghs.gov.bd','hris.mohfw.gov.bd'].includes(u.hostname))return false;
    // A registry home or list is not evidence of a particular facility.
    if(['','/','/public','/public/facility-registry','/public/facility-registry/','/public/facility-registry/reports/organization-list'].includes(u.pathname))return false;
    return true;
  }catch{return false;}
}
function text(value,max){return typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;}
try{
  const rows=csv(readFileSync(resolve(src),'utf8').replace(/^\uFEFF/,''));
  if(rows.length<2)throw Error('CSV has no review rows');
  const headers=rows.shift().map(x=>x.trim().toLowerCase());
  const required=['name','district','address','source_url','reviewed'];
  if(new Set(headers).size!==headers.length)throw Error('Duplicate CSV header');
  for(const h of required)if(!headers.includes(h))throw Error('Missing CSV header: '+h);
  const districts=districtOptions();
  const problems=[],out=[],seen=new Set(),seenLinks=new Set();
  const now=new Date().toISOString();
  for(let i=0;i<rows.length;i++){
    const row=rows[i],line=i+2;
    if(row.length!==headers.length){problems.push(`row ${line}: malformed CSV columns`);continue;}
    const fields=Object.fromEntries(headers.map((key,j)=>[key,row[j].trim()]));
    if(fields.reviewed.toUpperCase()!=='YES')continue;
    const {name,district,address}=fields;
    if(!text(name,300)||!text(address,500))problems.push(`row ${line}: invalid name or address`);
    if(!districts.has(district))problems.push(`row ${line}: unknown district ${JSON.stringify(district)}`);
    if(!registryUrl(fields.source_url))problems.push(`row ${line}: source_url is not a specific DGHS/HRIS HTTPS facility link`);
    const dedupe=`${name.toLowerCase()}|${district.toLowerCase()}`;
    if(seen.has(dedupe)){problems.push(`row ${line}: duplicate facility name/district`);continue;}
    seen.add(dedupe);
    if(seenLinks.has(fields.source_url)){problems.push(`row ${line}: identical facility source URL reused`);continue;}
    seenLinks.add(fields.source_url);
    const svc=(fields.services??'').split(';').map(x=>x.trim()).filter(Boolean);
    if(svc.some(x=>x.length>200))problems.push(`row ${line}: service text too long`);
    const phone=fields.phone??'';
    if(phone && !/^[+0-9()\-\s]{6,30}$/.test(phone))problems.push(`row ${line}: malformed phone`);
    const k=fields.registry_id ? `dghs:${fields.registry_id}` : `url:${fields.source_url}`;
    out.push({
      id:uuidFromKey(k),name,district,address,sourceUrl:fields.source_url,lastReviewedAt:now,
      services:svc,
      accessibility:['Step-free entrance','Accessible toilet','Communication support (sign language / text)'].map(feature=>({feature,availability:'unknown',verification:{status:'not_verified',lastReviewedAt:null}})),
      contacts:phone?[{method:'phone',value:phone,verification:{status:'not_verified',lastReviewedAt:null}}]:[],
      bookingIntegration:'not_integrated'
    });
  }
  if(problems.length)throw Error(`Review errors (no files changed):\n${problems.join('\n')}`);
  console.log(`Review: ${out.length} accepted, ${rows.length-out.length} unreviewed, ${new Set(out.map(x=>x.district)).size}/64 districts covered`);
  if(out.length===0)throw Error('ZERO reviewed facilities: refusing to create an empty directory');
  if(!write){console.log('DRY RUN ONLY. To import, add --write after checking source links.');process.exit(0);}
  if(!existsSync(target))throw Error('Expected existing facility data file, not found: '+target);
  const current=JSON.parse(readFileSync(target,'utf8'));
  if(!Array.isArray(current))throw Error('Existing facilities.json is not an array');
  if(current.length>out.length)throw Error('New import would shrink existing directory; refusing overwrite');
  const snapshot=target+'.pre-national-import.bak';
  if(!existsSync(snapshot))copyFileSync(target,snapshot);
  const temp=target+'.tmp-'+process.pid;
  try{writeFileSync(temp,JSON.stringify(out,null,2)+'\n','utf8');renameSync(temp,target);}
  finally{if(existsSync(temp))unlinkSync(temp);}
  console.log(`WROTE ${out.length} facilities -> ${target}. Existing backup: ${snapshot}`);
  console.log('Run npm run typecheck; npm run lint; npm run build; check /api/poth/facilities');
}catch(error){console.error('IMPORT BLOCKED:',error.message);process.exitCode=1;}
