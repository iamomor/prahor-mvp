#!/usr/bin/env node
/**
 * Build a labelled, UNVERIFIED OpenStreetMap healthcare discovery snapshot.
 * Uses a checkpoint per tile and an OpenStreetMap country-area filter.
 * No claim of clinical capability, opening hours, government registration, or accessibility.
 * Usage: node scripts/build-poth-osm-cache.mjs [--max-tiles 8|999] [--sleep-ms 2500]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const option = (key, fallback) => {
  const index = args.indexOf(key);
  if (index === -1) return fallback;
  const value = Number(args[index + 1]);
  if (!Number.isInteger(value) || value < 0) throw new Error(`Invalid ${key} value`);
  return value;
};
const maxTiles = option('--max-tiles', 999);
const sleepMs = Math.max(1800, option('--sleep-ms', 3000));
const allowedArgs = new Set(['--max-tiles', '--sleep-ms']);
for (let i=0; i<args.length; i++) {
  if (!allowedArgs.has(args[i]) || i+1 >= args.length) throw new Error(`Unsupported argument: ${args[i]}`);
  i++;
}
const endpoint = 'https://overpass-api.de/api/interpreter';
const tileDir = resolve('data/poth-community-tiles');
const output = resolve('src/features/poth/community-facilities.json');
const report = resolve('data/poth-community-coverage.json');
const step = 0.9;
const bounds = { s: 20.5, w: 88.0, n: 26.8, e: 92.8 };
const hubs = [
  [23.81,90.41], [22.36,91.78], [24.37,88.60], [22.85,89.54],
  [22.70,90.35], [24.89,91.87], [25.74,89.28], [24.75,90.42],
];
const cells = [];
for (let s=bounds.s; s<bounds.n-0.01; s+=step) for (let w=bounds.w; w<bounds.e-0.01; w+=step) {
  const n=Math.min(bounds.n,s+step), e=Math.min(bounds.e,w+step);
  const cy=(s+n)/2,cx=(w+e)/2;
  const priority=Math.min(...hubs.map(([lat,lon])=>(lat-cy)**2+(lon-cx)**2));
  cells.push({s,w,n,e,priority,key:`${s.toFixed(2)}_${w.toFixed(2)}`});
}
// Put one tile near each of the eight divisional hubs first for a useful quick run.
const first=[];
for(const [lat,lon] of hubs){
  const score=t=>(((t.s+t.n)/2)-lat)**2+(((t.w+t.e)/2)-lon)**2;
  const best=cells.reduce((a,b)=>score(a)<score(b)?a:b);
  if(!first.some(t=>t.key===best.key))first.push(best);
}
const firstSet=new Set(first.map(t=>t.key));
const rest=cells.filter(t=>!firstSet.has(t.key)).sort((a,b)=>a.priority-b.priority||a.key.localeCompare(b.key));
cells.splice(0,cells.length,...first,...rest);
const nap = ms=>new Promise(resolve=>setTimeout(resolve,ms));
const headers = {'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','User-Agent':'PROHOR-Poth-Hackathon-Research/1.0 (noncommercial OSM attribution)'};
function query(t){
  const bbox=[t.s,t.w,t.n,t.e].map(x=>x.toFixed(5)).join(',');
  // This area filter excludes neighbouring countries in boundary tiles.
  return `[out:json][timeout:48];area["ISO3166-1"="BD"]["admin_level"="2"]->.bd;(nwr(area.bd)(${bbox})["amenity"~"^(hospital|clinic|doctors|pharmacy|maternity)$"];nwr(area.bd)(${bbox})["healthcare"~"^(hospital|clinic|doctors|doctor|pharmacy|birthing_centre|midwife|maternity)$"];);out center;`;
}
const permitted = new Set(['name','name:bn','amenity','healthcare','healthcare:speciality','emergency','addr:full','addr:housenumber','addr:street','addr:suburb','addr:city','addr:district','phone','contact:phone','website','contact:website','opening_hours']);
function safeElements(elements){
  if(!Array.isArray(elements)) throw Error('Invalid Overpass response: missing elements');
  const result=[];
  for(const e of elements){
    if(!e||!['node','way','relation'].includes(e.type)||!Number.isSafeInteger(e.id)||e.id<=0||!e.tags||typeof e.tags!=='object')continue;
    const lat=e.type==='node'?e.lat:e.center?.lat;
    const lon=e.type==='node'?e.lon:e.center?.lon;
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<bounds.s||lat>bounds.n||lon<bounds.w||lon>bounds.e)continue;
    const tags=Object.fromEntries(Object.entries(e.tags).filter(([key,value])=>permitted.has(key)&&typeof value==='string').map(([key,value])=>[key,value.slice(0,300)]));
    if(!tags.amenity&&!tags.healthcare)continue;
    result.push(e.type==='node'?{type:e.type,id:e.id,lat,lon,tags}:{type:e.type,id:e.id,center:{lat,lon},tags});
  }
  return result;
}
async function downloadTile(tile){
  const body=new URLSearchParams({data:query(tile)});
  for(let attempt=1;attempt<=3;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),61000);
    try {
      const res=await fetch(endpoint,{method:'POST',headers,body,signal:controller.signal});
      if(!res.ok)throw Error(`HTTP ${res.status}`);
      const data=await res.json();
      return safeElements(data.elements);
    } catch(e){
      if(attempt===3)throw e;
      console.warn(`${tile.key}: ${e.message}; retry ${attempt}/2`);
      await nap(7000*attempt);
    } finally {clearTimeout(timer);}
  }
}
await mkdir(tileDir,{recursive:true});
await mkdir(resolve('data'),{recursive:true});
let fetched=0,failed=0,skipped=0;
for(const tile of cells.slice(0, maxTiles)){
  const path=resolve(tileDir,tile.key+'.json');
  try {
    const cached=await readFile(path,'utf8').catch(()=>null);
    if(cached!==null){
      const data=JSON.parse(cached);
      if(Array.isArray(data)){skipped++;continue;}
    }
    const found=await downloadTile(tile);
    // Write checkpoint atomically; don't save an error response as empty results.
    await writeFile(path+'.tmp',JSON.stringify(found),'utf8');
    const {rename}=await import('node:fs/promises');
    await rename(path+'.tmp',path);
    fetched++;
    console.log(`Fetched ${tile.key}: ${found.length} mapped entries`);
    await nap(sleepMs);
  }catch(error){failed++;console.error(`Tile ${tile.key} FAILED: ${error.message}`);}
}
const all=[];const seen=new Set();let completed=0;
for(const tile of cells){
  const path=resolve(tileDir,tile.key+'.json');
  try{
    const rows=JSON.parse(await readFile(path,'utf8'));
    if(!Array.isArray(rows))continue;
    completed++;
    for(const entry of rows){
      if(!entry?.id||!['node','way','relation'].includes(entry.type))continue;
      const key=entry.type+'/'+entry.id;
      if(seen.has(key))continue;
      seen.add(key); all.push(entry);
    }
  }catch{/* Missing/invalid tiles never counted as covered */}
}
all.sort((a,b)=>a.type.localeCompare(b.type)||a.id-b.id);
if(!all.length) {
  console.error('No mapped healthcare locations collected. Refusing to overwrite community-facilities.json.');
  process.exitCode=1;
}else {
  // One countrywide snapshot, separate from the DGHS-reviewed directory.
  await writeFile(output,JSON.stringify(all)+'\n','utf8');
  await writeFile(report,JSON.stringify({source:'OpenStreetMap contributors (ODbL)',sourceUrl:'https://www.openstreetmap.org/copyright',compiledAt:new Date().toISOString(),totalTiles:cells.length,completedTiles:completed,failedThisRun:failed,fetchedThisRun:fetched,reusedThisRun:skipped,mappedElements:all.length,verifiedClinicalFacilities:0,warning:'Community geographic coverage only. No professional, maternal, accessibility or emergency capability verified.'},null,2)+'\n');
  console.log(`SUCCESS: ${all.length} unverified OSM healthcare features, ${completed}/${cells.length} tile files`);
  console.log(`Snapshot ${output}; report ${report}`);
  if(completed<cells.length)console.warn('PARTIAL COVERAGE: run again to resume missing tiles; do not claim all districts represented.');
}
