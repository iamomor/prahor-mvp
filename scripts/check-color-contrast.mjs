// Node 20+; no dependencies. Run: node scripts/check-color-contrast.mjs
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('docs/design-system/design-tokens.json', 'utf8'));
function luminance(hex) {
  const parts = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const adjusted = parts.map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * adjusted[0] + 0.7152 * adjusted[1] + 0.0722 * adjusted[2];
}
function contrast(a,b) { const [x,y] = [luminance(a), luminance(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); }
let failures = 0;
for (const [name, v] of Object.entries(data.themes)) {
  const tests = [
    ['body', v.text, v.bg, 4.5], ['muted',v.muted,v.bg,4.5],
    ['on surface',v.text,v.surface,4.5], ['on primary',v.onPrimary,v.primary,4.5],
    ['on accent',v.onAccent,v.accent,4.5], ['control border',v.controlBorder,v.bg,3.0],
  ];
  for (const [label,fg,bg,target] of tests) {
    const value=contrast(fg,bg); const good=value>=target;
    console.log(`${good?'PASS':'FAIL'} ${name} ${label}: ${value.toFixed(2)}:1 (target ${target})`);
    if (!good) failures++;
  }
}
if(failures) process.exitCode=1;
