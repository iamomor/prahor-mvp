import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
export function ModulePreview({eyebrow,title,description,owner,items}:{eyebrow:string,title:string,description:string,owner:string,items:string[]}){
return <div className="pro-shell pro-section"><PageHeading eyebrow={eyebrow} title={title} description={description}/><div className="grid max-w-4xl gap-5 md:grid-cols-[1.4fr_1fr]"><section className="pro-card"><h2 className="mb-4 text-xl font-semibold">Development handoff</h2><ul className="space-y-4">{items.map(i=><li key={i} className="flex gap-3"><ShieldCheck className="shrink-0 text-pro-primary" aria-hidden="true" size={22}/>{i}</li>)}</ul></section><aside className="pro-card h-fit"><h2 className="font-semibold">Feature owner</h2><p className="my-2 text-2xl font-semibold">{owner}</p><p className="pro-muted mb-5 text-sm">Day 1 UI placeholder only. No clinical data is saved, shared, extracted or evaluated on this screen.</p><Link href="/app" className="pro-btn pro-btn-secondary">Back to dashboard <ArrowRight size={17}/></Link></aside></div></div>;
}
