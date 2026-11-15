// Stage the navigation design with canonical tokens for the MagicPath code session.
// The live homepage remains the source of truth; this does not modify its sections.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const directory = join(tmpdir(), "prohor-magicpath-navigation-20261115", "src/components/generated");
await mkdir(directory, { recursive: true });
const read = path => readFile(path, "utf8");
const nav = await read("src/components/marketing/PublicNav.tsx");
const brand = (await read("src/components/marketing/HomeBrand.tsx")).replace(/^import .*;\r?\n/gm, "").replaceAll("<Link ", "<a ").replaceAll("</Link>", "</a>").replaceAll("export function", "function");
const navCode = nav.slice(nav.indexOf("const links =")).replace("export function PublicNav", "function PublicNav");
const tokens = (await read("src/styles/prohor-tokens.css")).split("@theme inline")[0].replace('@import "tailwindcss";', "");
const base = (await read("src/components/marketing/homepage.css")).split(".pro-home .home-skip")[0];
const polish = await read("src/components/marketing/homepage-polish.css");
const navbarStyles = polish.slice(polish.indexOf(".pro-home .home-header.floating-nav"));
const redesign = await read("src/components/marketing/homepage-navigation.css");
const css = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Manrope:wght@400;500;600&family=Noto+Sans+Bengali:wght@400;600&display=swap');
${tokens}
:root { --font-prohor-manrope: Manrope, sans-serif; --font-prohor-bangla-sans: 'Noto Sans Bengali', sans-serif; --font-latin: var(--font-prohor-manrope); --font-bangla: var(--font-prohor-bangla-sans); --font-display: Fraunces, serif; --font-bangla-serif: var(--font-bangla); }
${base}
${navbarStyles}
${redesign}
.magic-preview { width:100%; min-height:100vh; }
.magic-preview .home-brand { display:inline-flex; align-items:center; font-weight:600; color:var(--pro-primary); }
.magic-preview .home-brand-divider { margin-inline:.125rem; }
.magic-preview button { display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
.magic-preview .home-nav-actions { margin:0; }
.magic-preview .preview-hero { padding:7rem 2rem 9rem; background:linear-gradient(120deg,var(--pro-bg),var(--pro-surface)); }
.magic-preview .preview-hero-inner { max-width:74rem; margin:auto; display:grid; grid-template-columns:1.5fr 1fr; gap:5rem; align-items:center; }
.magic-preview .preview-eyebrow { display:flex; align-items:center; gap:.75rem; font-size:.875rem; font-weight:600; color:var(--pro-primary); }
.magic-preview .preview-eyebrow::before { content:''; width:2rem; height:1px; background:var(--pro-accent); }
.magic-preview h1 { font-family:var(--pro-font-display); font-size:clamp(3rem,5.6vw,5rem); line-height:1.1; font-weight:600; margin:1.5rem 0; }
.magic-preview h1 em { color:var(--pro-primary); }
.magic-preview .preview-tagline { font-family:var(--font-bangla); color:var(--pro-primary); font-size:1.375rem; }
.magic-preview .preview-description { max-width:40ch; color:var(--pro-muted); margin-top:1.25rem; }
.magic-preview .preview-actions { display:flex; gap:1rem; flex-wrap:wrap; margin-top:2rem; }
.magic-preview .preview-actions a { display:flex; align-items:center; gap:.75rem; padding:.875rem 1.25rem; border-radius:var(--pro-radius-control); font-size:1rem; font-weight:600; }
.magic-preview .preview-actions a:first-child { background:var(--pro-primary); color:var(--pro-on-primary); }
.magic-preview .preview-actions a:last-child { background:var(--pro-elevated); color:var(--pro-primary); }
.magic-preview .preview-visual { padding:3rem 2rem; border-radius:var(--pro-radius-hero); background:var(--pro-surface-2); display:flex; align-items:center; justify-content:center; min-height:25rem; }
.magic-preview .preview-visual svg { width:100%; height:auto; color:var(--pro-primary); }
.magic-preview .preview-stub { max-width:74rem; padding:3rem 2rem; margin:auto; }
.magic-preview .preview-stub h2 { font-family:var(--pro-font-display); font-size:2rem; }
.magic-preview .preview-settings { inset:10vh auto auto; margin-inline:auto; width:min(32rem,calc(100% - 2rem)); max-height:80vh; overflow:auto; background:var(--pro-bg); color:var(--pro-text); border:1px solid var(--pro-border); border-radius:var(--pro-radius-card); padding:2rem; }
.magic-preview .preview-settings::backdrop { background:var(--pro-scrim); }
.magic-preview .preview-settings h2 { font-size:1.5rem; }
.magic-preview .preview-settings fieldset { display:grid; gap:.75rem; border:0; padding:1.25rem 0; }
.magic-preview .preview-settings label { display:flex; align-items:center; gap:.75rem; min-height:2.75rem; }
.magic-preview .preview-settings input { accent-color:var(--pro-primary); }
.magic-preview .preview-settings button { padding:.75rem 1.25rem; border:0; border-radius:var(--pro-radius-control); background:var(--pro-primary); color:var(--pro-on-primary); }
@media(max-width:1023px) { .magic-preview .preview-hero { padding:4rem 1.25rem; } .magic-preview .preview-hero-inner { grid-template-columns:1fr; gap:3rem; } .magic-preview .preview-visual { min-height:18rem; } }
`;
const code = `import { createContext, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowUpRight, Menu, SlidersHorizontal, X } from 'lucide-react';
import './PROHORCleanNavigation.css';
type Copy = { en: string; bn: string };
const copy = (en: string, bn: string): Copy => ({en,bn});
type Home = { locale:'en'|'bn'; setLocale:(value:'en'|'bn')=>void; t:(value:Copy)=>string; openPreferences:()=>void; openSignIn:()=>void };
const Context = createContext<Home | null>(null);
function useHome() { const value = useContext(Context); if (!value) throw new Error('Missing navigation context'); return value; }
${brand}
${navCode}
export const PROHORCleanNavigation = () => {
 const [locale,setLocale] = useState<'en'|'bn'>('en');
 const [settings,setSettings] = useState(false);
 const [signIn,setSignIn] = useState(false);
 const [theme,setTheme] = useState('quiet-garden');
 const [contrast,setContrast] = useState(false);
 const settingsRef = useRef<HTMLDialogElement>(null);
 const signInRef = useRef<HTMLDialogElement>(null);
 const previous = useRef<HTMLElement|null>(null);
 useEffect(()=>{document.documentElement.dataset.theme=theme; document.documentElement.dataset.contrast=contrast?'more':'normal';},[theme,contrast]);
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 useEffect(()=>{const dialog=settings?settingsRef.current:signIn?signInRef.current:null; if(!dialog)return; previous.current=document.activeElement as HTMLElement;dialog.showModal();return()=>{dialog.close();previous.current?.focus();};},[settings,signIn]);
 const t = (value:Copy)=>value[locale];
 return <Context.Provider value={{locale,setLocale,t,openPreferences:()=>setSettings(true),openSignIn:()=>setSignIn(true)}}><div className="pro-home magic-preview">
 <PublicNav/>
 <main><section className="story-hero preview-hero"><div className="preview-hero-inner"><div><p className="preview-eyebrow">{t(copy('Connected care. A more human experience.','সংযুক্ত যত্ন। আরও মানবিক অভিজ্ঞতা।'))}</p><h1>{locale==='en'?<>Maternal care,<br/>designed around<br/><em>every mother.</em></>:<>মাতৃত্বের যত্ন,<br/><em>প্রতিটি মায়ের মতো করে।</em></>}</h1><p className="preview-tagline" lang="bn">আপনার যত্ন, আপনার মতো।</p><p className="preview-description">{t(copy('Understand your health, keep your story together, and find your next step—with care that makes room for you.','স্বাস্থ্য সম্পর্কে জানুন, যত্নের গল্প একসঙ্গে রাখুন, পরের ধাপের প্রস্তুতি নিন—আপনার উপযোগী যত্নে।'))}</p><div className="preview-actions"><a href="#features">{t(copy('Explore PROHOR','প্রহর ঘুরে দেখুন'))}<ArrowUpRight size={18}/></a><a href="#how-it-works">{t(copy('See how it works','কীভাবে কাজ করে দেখুন'))}</a></div></div><div className="preview-visual" aria-hidden="true"><ProhorSymbol/></div></div></section>
 {(['why-prohor','how-it-works','features','responsible-ai'] as const).map((id,index)=><section key={id} id={id} className="preview-stub"><h2>{t(links[index][1])}</h2></section>)}</main>
 <dialog ref={settingsRef} className="preview-settings" onClose={()=>setSettings(false)}><h2>{t(copy('Adjust how you use PROHOR','প্রহর ব্যবহারের ধরন বদলান'))}</h2><fieldset><legend>Theme</legend>{['quiet-garden','original-rose','morning-mist'].map(value=><label key={value}><input type="radio" name="theme" checked={theme===value} onChange={()=>setTheme(value)}/>{value.replaceAll('-',' ')}</label>)}</fieldset><label><input type="checkbox" checked={contrast} onChange={event=>setContrast(event.target.checked)}/>Higher contrast</label><button onClick={()=>setSettings(false)}>Done</button></dialog>
 <dialog ref={signInRef} className="preview-settings" onClose={()=>setSignIn(false)}><h2>Sign in is coming.</h2><p>This is a navigation design preview.</p><button onClick={()=>setSignIn(false)}>Close</button></dialog>
 </div></Context.Provider>;
};
`;
await writeFile(join(directory,"PROHORCleanNavigation.tsx"),code.replace(", type ReactNode", "").replace("value.replaceAll('-',' ')", "value.split('-').join(' ')"));
await writeFile(join(directory,"PROHORCleanNavigation.css"),css);
console.log(directory);
