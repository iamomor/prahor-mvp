"use client";
import { useState } from "react";
import type { AuditEvent, BabyRecord, PregnancyEpisode, RecordsWorkspace } from "./records-model";
import { dhakaToday, gestationalDating } from "./records-model";
import { Field, Choice, RecordForm, card, read } from "./records-ui";
export type WorkspaceChange = (next: RecordsWorkspace, targetId: string, action: AuditEvent["action"], reason?: string) => void;
export function PregnancyProfile({ state, episode, onChange, onSelect }: { state: RecordsWorkspace; episode: PregnancyEpisode; onChange: WorkspaceChange; onSelect: (id: string) => void }) {
  const profile = state.profile;
  const dating = gestationalDating(episode, episode.endDate || dhakaToday());
  return <div className="grid min-w-0 gap-6">
    <section className={card}><h2 className="text-2xl font-semibold">গর্ভকালের হিসাব · Dating estimate</h2><p>{dating ? `${dating.weeks} weeks ${dating.days} days — ${dating.method}` : "Not enough consistent dating information for an estimate."}</p>{dating?.warning && <p>{dating.warning}</p>}<p className="text-pro-muted">As of {episode.endDate || dhakaToday()}. A calculation reference, not a diagnosis or delivery prediction. Recorded dates are never replaced.</p></section>
    <RecordForm title="মায়ের পরিচয় ও আগের ইতিহাস · Mother profile" key={profile.id} onSave={data => {
      const history = { ...profile.history }; for (const key of ["gravida", "para", "losses", "living", "previousBirths", "complications", "notes"] as const) history[key] = read(data, key);
      history.cSection = read(data,"cSection") as typeof history.cSection;
      onChange({ ...state, profile: { ...profile, name: read(data,"name"), birthDate: read(data,"birthDate"), age: read(data,"age"), contact: read(data,"contact"), language: read(data,"language") as "bn" | "en", history } }, profile.id, "update", read(data,"reason"));
    }}>
      <p>Fictional profile only. Contact and sensitive history are optional. Sharing consent is managed separately.</p>
      <Field name="name" label="মায়ের নাম · Mother's name" value={profile.name} required />
      <Field name="birthDate" label="জন্মতারিখ · Date of birth" type="date" value={profile.birthDate} />
      <Field name="age" label="বয়স, যদি জানা থাকে · Age as documented" value={profile.age} />
      <Field name="contact" label="যোগাযোগ · Contact information" value={profile.contact} />
      <Choice name="language" label="পছন্দের ভাষা · Preferred language" value={profile.language} options={{bn:"বাংলা",en:"English"}} />
      <details><summary className="min-h-12 cursor-pointer font-semibold">আগের গর্ভধারণের ইতিহাস · Optional obstetric history</summary><div className="mt-3 grid gap-4">
        <Field name="gravida" label="G · মোট গর্ভধারণ · Pregnancies as documented" value={profile.history.gravida} />
        <Field name="para" label="P · পূর্বের প্রসব · Births as documented" value={profile.history.para} />
        <Field name="losses" label="A · গর্ভপাত/ক্ষতি, জানাতে চাইলে · Losses as documented" value={profile.history.losses} />
        <Field name="living" label="L · জীবিত সন্তান · Living children as documented" value={profile.history.living} />
        <Choice name="cSection" label="আগের সিজারিয়ান · Previous C-section" value={profile.history.cSection} options={{unknown:"জানা নেই · Unknown",yes:"হ্যাঁ · Yes",no:"না · No"}} />
        <Field name="previousBirths" label="পূর্বের প্রসবের বিবরণ · Previous births" value={profile.history.previousBirths} />
        <Field name="complications" label="আগের জটিলতার নথি · Past documented complications" value={profile.history.complications} />
        <Field name="notes" label="ইতিহাসের নোট · Other documented history" value={profile.history.notes} />
      </div></details><Field name="reason" label="পরিবর্তনের কারণ · Reason for change" />
    </RecordForm>
    <RecordForm title="এই গর্ভকালের তথ্য · Pregnancy episode" key={episode.id} onSave={data => {
      const edited = { ...episode, label:read(data,"label"), lmp:read(data,"lmp"), edd:read(data,"edd"), eddSource:read(data,"eddSource") as PregnancyEpisode["eddSource"], status:read(data,"status") as PregnancyEpisode["status"], startDate:read(data,"startDate"), endDate:read(data,"endDate"), notes:read(data,"notes") };
      onChange({...state, episodes:state.episodes.map(e=>e.id===episode.id?edited:e)},episode.id,"update",read(data,"reason"));
    }}><p className="[overflow-wrap:anywhere]">Episode ID: {episode.id}</p><Field name="label" label="গর্ভকালের নাম · Pregnancy label" value={episode.label} required /><Field name="lmp" label="শেষ মাসিকের প্রথম দিন · LMP" value={episode.lmp} type="date" /><Field name="edd" label="নথিভুক্ত সম্ভাব্য প্রসবের তারিখ · Recorded EDD" value={episode.edd} type="date" />
      <Choice name="eddSource" label="EDD-এর উৎস · EDD source" value={episode.eddSource} options={{unknown:"জানা নেই · Unknown",lmp:"LMP-based",ultrasound:"Ultrasound-based",clinician_documented:"Clinician-documented (document claim, not authentication)"}} />
      <Choice name="status" label="গর্ভকালের অবস্থা · Episode status" value={episode.status} options={{unknown:"নথিভুক্ত নেই · Unknown",ongoing:"চলমান বলে নথিভুক্ত · Ongoing",ended:"শেষ হয়েছে বলে নথিভুক্ত · Ended"}} />
      <Field name="startDate" label="নথিভুক্ত শুরুর তারিখ · Documented start" value={episode.startDate} type="date" /><Field name="endDate" label="নথিভুক্ত শেষের তারিখ · Documented end" value={episode.endDate} type="date" /><Field name="notes" label="গর্ভকালের নোট · Pregnancy notes" value={episode.notes} /><Field name="reason" label="পরিবর্তনের কারণ · Reason for change" />
    </RecordForm>
    <details className={card}><summary className="min-h-12 cursor-pointer font-semibold">আরেকটি গর্ভকাল যোগ করুন · Add pregnancy episode</summary><RecordForm title="নতুন গর্ভকাল · New pregnancy" reset onSave={data=>{const id=crypto.randomUUID(); onChange({...state,episodes:[...state.episodes,{id,motherId:profile.id,label:read(data,"label"),lmp:"",edd:"",eddSource:"unknown",status:"unknown",startDate:"",endDate:"",notes:""}]},id,"create");onSelect(id);}}><Field name="label" label="নতুন গর্ভকালের নাম · New pregnancy label" required /><p>No dates, outcome, or babies are assumed for a new episode.</p></RecordForm></details>
  </div>;
}
const emptyBaby = (pregnancyId:string,motherId:string,label:string):BabyRecord=>({id:crypto.randomUUID(),pregnancyId,motherId,label,stage:"unknown",birthDate:"",birthWeight:"",weightUnit:"",birthLength:"",lengthUnit:"",sex:"",deliveryMode:"",apgar:"",outcome:""});
export function BabyProfile({state,episode,baby,onChange,onSelect}:{state:RecordsWorkspace;episode:PregnancyEpisode;baby?:BabyRecord;onChange:WorkspaceChange;onSelect:(id:string)=>void}) {
  const [showNew,setShowNew]=useState(false);
  return <div className="grid min-w-0 gap-6"><section className={card}><h2 className="text-2xl font-semibold">সংযুক্ত শিশুর রেকর্ড · Linked baby records</h2><p>Each baby has an independent ID and history. Twins share a pregnancy episode, never a health record. Outcomes are optional; no birth outcome is assumed.</p><button type="button" className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary" onClick={()=>setShowNew(!showNew)} aria-expanded={showNew}>শিশুর রেকর্ড যোগ করুন · Add another baby record</button>
    {showNew&&<RecordForm title="নতুন শিশুর রেকর্ড · New baby record" reset onSave={data=>{const created=emptyBaby(episode.id,state.profile.id,read(data,"label"));onChange({...state,babies:[...state.babies,created]},created.id,"create");onSelect(created.id);setShowNew(false);}}><Field name="label" label="শিশুর রেকর্ডের নাম · Baby label" required /></RecordForm>}</section>
    {baby&&<RecordForm key={baby.id} title="শিশুর জন্ম ও পরিচয়ের নথি · Baby details" onSave={data=>{const edited={...baby};for(const key of ["label","birthDate","birthWeight","weightUnit","birthLength","lengthUnit","sex","deliveryMode","apgar","outcome"] as const)edited[key]=read(data,key);edited.stage=read(data,"stage") as BabyRecord["stage"];onChange({...state,babies:state.babies.map(b=>b.id===baby.id?edited:b)},baby.id,"update",read(data,"reason"));}}>
    <p className="[overflow-wrap:anywhere]">Baby ID: {baby.id} · Pregnancy: {baby.pregnancyId}</p><Field name="label" label="রেকর্ডের নাম · Baby record label" value={baby.label} required /><Choice name="stage" label="নথিভুক্ত পর্যায় · Documented stage" value={baby.stage} options={{unknown:"জানা নেই · Unknown",fetal:"গর্ভের শিশুর রেকর্ড · Fetal",newborn:"নবজাতক · Newborn",child:"শিশু · Child"}} />
    <details><summary className="min-h-12 cursor-pointer font-semibold">জন্মের তথ্য, জানা থাকলে · Optional birth details</summary><div className="mt-3 grid gap-4"><Field name="birthDate" label="জন্মতারিখ · Birth date" value={baby.birthDate} type="date" /><Field name="birthWeight" label="জন্মের ওজন · Birth weight" value={baby.birthWeight} /><Field name="weightUnit" label="জন্মের ওজনের একক · Birth weight unit" value={baby.weightUnit} /><Field name="birthLength" label="জন্মের দৈর্ঘ্য · Birth length" value={baby.birthLength} /><Field name="lengthUnit" label="দৈর্ঘ্যের একক · Birth length unit" value={baby.lengthUnit} /><Field name="sex" label="নথিভুক্ত লিঙ্গ, জানাতে চাইলে · Sex/gender as provided" value={baby.sex} /><Field name="deliveryMode" label="প্রসবের ধরন · Mode of delivery as documented" value={baby.deliveryMode} /><Field name="apgar" label="নথিভুক্ত Apgar ও সময় · Apgar scores and timing" value={baby.apgar} /><Field name="outcome" label="জন্মের ফলাফল, জানাতে চাইলে · Outcome as documented" value={baby.outcome} /></div></details><Field name="reason" label="পরিবর্তনের কারণ · Reason for change" />
    </RecordForm>}
  </div>;
}
