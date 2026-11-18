import { test } from "node:test";
import { chromium, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
const url="http://localhost:3000/jibonrekha";
async function open() { const browser=await chromium.launch({channel:"chrome"});const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on("pageerror",error=>errors.push(error.message));await page.goto(url);await expect(page.getByRole("navigation",{name:"Jibonrekha sections"})).toBeVisible();return {browser,context,page,errors}; }
async function section(page,name){const button=page.getByRole("navigation",{name:"Jibonrekha sections"}).getByRole("button",{name});await button.focus();await page.keyboard.press("Enter");await expect(button).toHaveAttribute("aria-pressed","true");}
async function save(form){await form.getByRole("button",{name:/Save on this device/}).click();await expect(form.getByRole("status")).toContainText("Saved on this device");}
async function maternal(page,name,value="60.00",unit="kg") {const form=page.getByRole("form",{name:/Add maternal observation/});await form.getByLabel("Observation name (required)",{exact:true}).fill(name);await form.getByLabel("Value or note (required)",{exact:true}).fill(value);await form.getByLabel("Unit (optional)",{exact:true}).fill(unit);await form.getByLabel("Observation date (required)",{exact:true}).fill("2026-11-18");await form.getByRole("button",{name:"Save maternal observation",exact:true}).click();await expect(form.getByRole("status")).toContainText("Saved to Mother's record");}

test("mother profile, dating, episode isolation, twins and newborn details persist",async()=>{
 const {browser,page,errors}=await open();try{
   await maternal(page,"Original pregnancy weight");
   await section(page,/Pregnancy/);
   const profile=page.getByRole("form",{name:/Mother profile/});await profile.getByLabel(/Mother's name/).fill("Fictional V2 mother");await profile.getByLabel(/Preferred language/).selectOption("en");await profile.getByText(/Optional obstetric history/).click();await profile.getByLabel(/G ·/).fill("2");await save(profile);
   const pregnancy=page.getByRole("form",{name:/Pregnancy episode/});await pregnancy.getByLabel(/Recorded EDD/).fill("2027-08-08");await pregnancy.getByLabel(/LMP/).fill("2026-11-01");await pregnancy.getByLabel(/EDD source/).selectOption("clinician_documented");await save(pregnancy);await expect(page.getByText(/Recorded EDD \(clinician_documented\) minus/)).toBeVisible();
   await page.getByText(/Add pregnancy episode/).click();const add=page.getByRole("form",{name:/New pregnancy$/});await add.getByLabel(/New pregnancy label/).fill("Fictional second pregnancy");await save(add);
   await section(page,/Overview/);await expect(page.getByRole("heading",{name:"Original pregnancy weight",exact:true})).toHaveCount(0);await expect(page.getByText("Dating unavailable",{exact:true})).toBeVisible();
   await section(page,/Baby's Health/);
   for(const label of ["Fictional twin A","Fictional twin B"]){await page.getByRole("button",{name:/Add another baby record/}).click();const form=page.getByRole("form",{name:/New baby record/});await form.getByLabel(/Baby label/).fill(label);await form.getByRole("button",{name:/Save on this device/}).click();await expect(page.getByLabel(/Active baby/)).toContainText(label);}
   await page.getByLabel(/Active baby/).selectOption({label:"Fictional twin A"});
   const details=page.getByRole("form",{name:/Baby details/});await details.getByLabel(/Documented stage/).selectOption("newborn");await details.getByText(/Optional birth details/).click();await details.getByLabel(/Birth date/).fill("2026-11-18");await details.getByLabel("জন্মের ওজন · Birth weight (optional)",{exact:true}).fill("3.200");await details.getByLabel(/Birth weight unit/).fill("kg");await details.getByLabel(/Outcome as documented/).fill("Fictional documented outcome");await save(details);
   const form=page.getByRole("form",{name:/Add baby observation/});await form.getByLabel(/Observation name or description/).fill("Fictional twin A feeding");await form.getByLabel(/Value or note/).fill("Fictional feeding note");await form.getByLabel(/Observation date/).fill("2026-11-18");await form.getByRole("button",{name:"Save baby observation",exact:true}).click();await expect(form.getByRole("status")).toContainText("Saved to Baby's record");
   await page.getByLabel(/Active baby/).selectOption({label:"Fictional twin B"});await expect(page.getByRole("heading",{name:"Fictional twin A feeding",exact:true})).toHaveCount(0);
   const stored=await page.evaluate(()=>({state:JSON.parse(localStorage.getItem("prohor-demo-records-v2")),observations:JSON.parse(localStorage.getItem("prohor-demo-health-v1"))}));
   expect(stored.state.profile.name).toBe("Fictional V2 mother");expect(stored.state.profile.history.gravida).toBe("2");expect(stored.state.episodes).toHaveLength(2);expect(stored.state.babies.filter(b=>b.pregnancyId===stored.state.episodes[1].id)).toHaveLength(2);expect(stored.observations[0].pregnancyId).not.toBe(stored.observations[1].pregnancyId);
   await page.reload();await section(page,/Pregnancy/);await expect(page.getByRole("form",{name:/Mother profile/}).getByLabel(/Mother's name/)).toHaveValue("Fictional V2 mother");expect(errors).toEqual([]);
 }finally{await browser.close();}
});

test("clinical history, appointments, corrections, archive and version provenance",async()=>{
 const {browser,page,errors}=await open();try{
   await maternal(page,"Weight","60.00","kg");await section(page,/Mother's Health/);
   const choices=page.getByLabel(/Record type/,{exact:false});
   for(const [kind,name] of [["condition","Fictional suspected condition"],["allergy","Fictional allergy"],["medicine","Fictional calcium"],["vaccine","Fictional Td"],["encounter","Fictional ANC examination"]]){
     await choices.selectOption(kind);const form=page.getByRole("form",{name:/Add:/});await form.getByLabel(/Record name/).fill(name);await form.getByLabel(/Record date/).fill("2026-11-18");await form.getByLabel(/Status/,{exact:false}).selectOption("suspected");if(kind==="medicine"){await form.getByLabel(/Documented dose and unit/).fill("Copied fictional dose");await form.getByLabel(/Documented frequency/).fill("As documented");}if(kind==="vaccine")await form.getByLabel(/Documented dose number/).fill("1");await save(form);
   }
   await section(page,/Appointments/);const appointment=page.getByRole("form",{name:/Appointment or reminder/});await appointment.getByLabel(/Appointment title/).fill("Fictional follow-up");await appointment.getByLabel(/Appointment date/).fill("2026-12-01");await save(appointment);const update=page.getByRole("form",{name:"Update Fictional follow-up",exact:true});await update.getByRole("button",{name:"Mark completed",exact:true}).click();await expect(update.getByRole("status")).toContainText("Saved");
   await section(page,/Timeline/);await page.getByRole("textbox",{name:/Search history/}).fill("Weight");await page.getByText(/Correct or archive/).click();const correction=page.getByRole("form",{name:"Correct Weight",exact:true});await correction.getByLabel(/Corrected value/).fill("61.250");await correction.getByLabel(/Correction reason/).fill("Corrected from fictional note");await correction.getByRole("button",{name:"Save correction with history",exact:true}).click();await expect(correction.getByRole("status")).toContainText("Saved");await page.getByText(/Observation version history/).click();await expect(page.getByText("Before: 60.00 kg",{exact:false})).toBeVisible();await expect(page.getByText("After: 61.250 kg",{exact:false})).toBeVisible();
   const archive=page.getByRole("form",{name:"Archive status for Weight",exact:true});await archive.getByLabel(/Confirm archive/).check();await archive.getByRole("button",{name:"Archive observation",exact:true}).click();await expect(page.getByRole("heading",{name:"Weight",exact:true})).toHaveCount(0);await page.getByLabel("Show archived records",{exact:false}).check();await expect(page.getByRole("heading",{name:"Weight · Archived",exact:true})).toBeVisible();
   const stored=await page.evaluate(()=>({state:JSON.parse(localStorage.getItem("prohor-demo-records-v2")),observation:JSON.parse(localStorage.getItem("prohor-demo-health-v1"))[0]}));expect(stored.state.entries).toHaveLength(5);expect(stored.state.entries[0].status).toBe("suspected");expect(stored.state.appointments[0].completed).toBe(true);expect(stored.observation.versions).toHaveLength(2);expect(stored.observation.rawValue).toBe("60.00");expect(errors).toEqual([]);
 }finally{await browser.close();}
});

test("granular consent, Barta preview/revocation and reviewed local print",async()=>{
 const {browser,page,errors}=await open();try{
   await maternal(page,"Fictional minimal context");await section(page,/Privacy & Sharing/);
   await page.getByRole("button",{name:"Preview explicitly permitted Barta context",exact:true}).click();await expect(page.getByRole("alert").filter({hasText:/Select a pregnancy/})).toBeVisible();
   let consent=page.getByRole("form",{name:/Granular demo consent/});await consent.getByLabel(/Fictional minimal context:/).check();await consent.getByLabel(/I explicitly allow/).check();await consent.getByRole("button",{name:/Save on this device/}).click();await page.getByRole("button",{name:"Preview explicitly permitted Barta context",exact:true}).click();await expect(page.locator("pre:visible")).toContainText('"schemaVersion": 1');await expect(page.locator("pre:visible")).not.toContainText("Ayesha");
   consent=page.getByRole("form",{name:/Granular demo consent/});await consent.getByLabel(/I explicitly allow/).uncheck();await consent.getByRole("button",{name:/Save on this device/}).click();await expect(page.locator("pre:visible")).toHaveCount(0);
   await section(page,/Health Summary/);const summary=page.getByRole("region",{name:"Printable health summary",exact:true});await expect(summary).toContainText("Fictional minimal context");await expect(summary).not.toContainText("Ayesha");await page.getByRole("button",{name:/Print or save as PDF/}).click();await expect(page.getByRole("alert").filter({hasText:/Review the summary/})).toBeVisible();
   await page.evaluate(()=>{window.printedSummary="";HTMLIFrameElement.prototype.originalPrintAccessor=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,"contentWindow");const original=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,"contentWindow");Object.defineProperty(HTMLIFrameElement.prototype,"contentWindow",{configurable:true,get(){const win=original.get.call(this);win.print=()=>{window.printedSummary=this.contentDocument.body.textContent;};return win;}});});
   await page.getByLabel(/I reviewed this summary/).check();await page.getByRole("button",{name:/Print or save as PDF/}).click();expect(await page.evaluate(()=>window.printedSummary)).toContain("FICTIONAL DEMO");expect(await page.evaluate(()=>window.printedSummary)).not.toContain("Ayesha");expect(errors).toEqual([]);
 }finally{await browser.close();}
});

test("keyboard navigation, 320px reflow, text scaling and axe across record screens",async()=>{
 const {browser,page,errors}=await open();try{
   for(const name of [/Overview/,/Pregnancy/,/Mother's Health/,/Baby's Health/,/Timeline/,/Appointments/,/Reports/,/Health Summary/,/Privacy & Sharing/]){
     await section(page,name);
     for(const width of [320,360,390,430,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
     await page.setViewportSize({width:320,height:900});await page.evaluate(()=>document.documentElement.style.fontSize="200%");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>document.documentElement.style.fontSize="");
     const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();expect(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
   }
   expect(errors).toEqual([]);
 }finally{await browser.close();}
});

test("theme/contrast combinations keep primary labels readable and preserve drafts",async()=>{
 const {browser,page}=await open();try{
   await maternal(page,"Synthetic theme check");await section(page,/Pregnancy/);
   const form=page.getByRole("form",{name:/Mother profile/});const name=form.getByLabel(/Mother's name/);await name.fill("Unsaved fictional name");await name.focus();
   for(const theme of ["quiet-garden","original-rose","morning-mist"]) for(const contrast of ["","more"]){
     await page.evaluate(({theme,contrast})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.contrast=contrast;document.documentElement.dataset.motion="reduce";},{theme,contrast});
     await expect(name).toHaveValue("Unsaved fictional name");await expect(name).toBeFocused();
     const selected=page.getByRole("navigation",{name:"Jibonrekha sections"}).getByRole("button",{pressed:true});
     const primary=form.getByRole("button",{name:/Save on this device/});
     for(const target of [selected,primary]){
       const colors=await target.evaluate(element=>{const style=getComputedStyle(element);return {fg:style.color,bg:style.backgroundColor,display:style.display,opacity:style.opacity};});
       expect(colors.fg).not.toBe(colors.bg);expect(Number(colors.opacity)).toBeGreaterThan(0);expect(colors.display).not.toBe("none");
     }
   }
   await section(page,/Mother's Health/);await page.getByText("Optional fictional provider verification example",{exact:true}).click();const example=page.getByRole("form",{name:"Load a fictional provider example",exact:true});await example.getByRole("button",{name:/Add clearly fictional/}).click();await expect(page.getByRole("heading",{name:"Fictional provider-confirmed training example",exact:true})).toBeVisible();
   const entry=page.locator("article").filter({has:page.getByRole("heading",{name:"Fictional provider-confirmed training example",exact:true})});await expect(entry).toContainText("not a real provider");await expect(entry.getByRole("button",{name:/Correct/})).toHaveCount(0);
 }finally{await browser.close();}
});

test("workspace save failures preserve inputs; stale tabs cannot overwrite newer records",async()=>{
 const {browser,context,page}=await open();try{
   await section(page,/Pregnancy/);let form=page.getByRole("form",{name:/Mother profile/});await form.getByLabel(/Mother's name/).fill("Fictional retained input");
   await page.evaluate(()=>{window.originalWorkspaceSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==="prohor-demo-records-v2")throw new Error("Synthetic workspace quota failure");return window.originalWorkspaceSet.call(this,key,value);};});
   await form.getByRole("button",{name:/Save on this device/}).click();await expect(form.getByRole("alert")).toContainText("quota failure");await expect(form.getByLabel(/Mother's name/)).toHaveValue("Fictional retained input");expect(await page.evaluate(()=>localStorage.getItem("prohor-demo-records-v2"))).toBe(null);
   await page.evaluate(()=>{Storage.prototype.setItem=window.originalWorkspaceSet;});await save(form);
   const other=await context.newPage();await other.goto(url);await section(other,/Pregnancy/);const otherForm=other.getByRole("form",{name:/Mother profile/});
   await form.getByLabel(/Mother's name/).fill("Fictional newer name");await save(form);
   await expect(other.getByRole("alert").filter({hasText:/another tab/})).toBeVisible();await otherForm.getByLabel(/Mother's name/).fill("Stale fictional name");await otherForm.getByRole("button",{name:/Save on this device/}).click();await expect(otherForm.getByRole("alert")).toContainText("Records changed");expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("prohor-demo-records-v2")).profile.name)).toBe("Fictional newer name");
   await context.setOffline(true);await section(page,/Overview/);await maternal(page,"Fictional offline note","A local note","");expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("prohor-demo-health-v1"))[0].label)).toBe("Fictional offline note");
 }finally{await browser.close();}
});
