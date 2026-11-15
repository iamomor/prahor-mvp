import { readFile, writeFile } from 'node:fs/promises';
const path = 'src/components/marketing/homepage-hero.css';
let css = await readFile(path, 'utf8');
const start = css.indexOf('.pro-home .hero-scene-art {');
const end = css.indexOf('.pro-home .hero-motion-button {');
let art = css.slice(start, end).replace(/(?<![a-zA-Z0-9_-])(\d*\.\d+|\d+)rem/g, (_, value) => `calc(${value} * var(--hero-unit))`);
art = art.replace('.pro-home .hero-scene-art {', '.pro-home .hero-scene-art { --hero-unit: min(16px, 5.08cqw);');
css = css.slice(0, start) + art + css.slice(end);
await writeFile(path, css);
