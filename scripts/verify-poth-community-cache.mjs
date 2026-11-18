#!/usr/bin/env node
// Checks only source-data shape and provenance. NOT a clinical verification audit.
import { readFileSync } from 'node:fs';
const file='src/features/poth/community-facilities.json';
let items;
try{items=JSON.parse(readFileSync(file,'utf8'));}catch(e){console.error('Cannot read OSM snapshot:',e.message);process.exit(1);}
if(!Array.isArray(items))throw Error('Snapshot must be an array');
const ids=new Set();const kinds=new Map();let errors=0;
const allowable=new Set(['node','way','relation']);
for(const item of items){
  const lat=item.type==='node'?item.lat:item.center?.lat;
  const lon=item.type==='node'?item.lon:item.center?.lon;
  const id=`${item.type}/${item.id}`;
  if(!allowable.has(item.type)||!Number.isSafeInteger(item.id)||item.id<=0||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<20.5||lat>26.8||lon<88||lon>92.8||!item.tags||typeof item.tags!=='object'||ids.has(id)){
    if(errors<5)console.error('Invalid feature:',id);errors++;continue;
  }
  ids.add(id);
  const kind=item.tags.healthcare||item.tags.amenity||'unknown';
  kinds.set(kind,(kinds.get(kind)||0)+1);
}
if(errors)throw Error(`${errors} invalid/duplicate records`);
let report;
try{report=JSON.parse(readFileSync('data/poth-community-coverage.json','utf8'));}catch{report=null;}
console.log(`OSM CACHE CHECK PASS: ${items.length} UNIQUE OSM features (NOT verified clinics)`);
console.log('Tags:',[...kinds.entries()].sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>`${k}=${v}`).join(', '));
if(report)console.log(`Tiles: ${report.completedTiles}/${report.totalTiles}; collected: ${report.compiledAt}; clinical verification count: 0`);
if(!items.length)console.log('Snapshot is empty: live Overpass API remains the primary discovery source.');
