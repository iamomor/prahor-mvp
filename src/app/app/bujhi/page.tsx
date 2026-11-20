import { requireWorkspace } from "@/lib/auth/require-workspace";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountReportReview } from "@/features/bujhi/AccountReportReview";
import { MedicalEntry } from "@/features/bujhi/MedicalEntry";
import { createServerSupabase } from "@/lib/supabase/server";

function BujhiTasks() {
  return <section className="mx-auto grid max-w-3xl gap-5 px-4 py-6 text-pro-text sm:px-6" aria-labelledby="bujhi-task-title">
    <div><p className="font-semibold text-pro-primary">প্রহর · বুঝি</p><h1 id="bujhi-task-title" className="mt-1 text-3xl font-semibold">রিপোর্ট ও কিট বুঝি</h1><p className="mt-2 max-w-[65ch]">রিপোর্ট মিলিয়ে দেখুন, অথবা ঘরে করা কিটের ফল বুঝুন।</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="grid content-between gap-4 rounded-card border border-pro-border bg-pro-surface p-5"><div><h2 className="text-xl font-semibold">ঘরে করা কিট</h2><p className="mt-2">ছবি ছাড়াই কিটে দেখা চিহ্ন মিলিয়ে নিন।</p></div><Link href="/app/bujhi/kit" className="inline-flex min-h-12 items-center justify-center rounded-field bg-pro-primary px-4 py-3 text-center font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-pro-focus">কিটের ফল বুঝি →</Link></section>
      <section className="grid content-between gap-4 rounded-card border border-pro-border bg-pro-elevated p-5"><div><h2 className="text-xl font-semibold">মেডিকেল রিপোর্ট</h2><p className="mt-2">ছবি থেকে পড়া মান মূল রিপোর্টের সঙ্গে মিলিয়ে নিন।</p></div><a href="#report-review" className="inline-flex min-h-12 items-center justify-center rounded-field border border-pro-control-border px-4 py-3 text-center font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus">রিপোর্ট যাচাই করি ↓</a></section>
    </div>
  </section>;
}

async function createPregnancy(form: FormData) {
  "use server";
  const profile = await requireWorkspace("mother");
  const label = form.get("label");
  if (typeof label !== "string" || !label.trim() || label.length > 100) redirect("/app/bujhi?recordError=1");
  const db = await createServerSupabase();
  if (!db) redirect("/app/bujhi?recordError=1");
  const result = await db.from("pregnancy_records").insert({ label: label.trim() }).select("id, owner_user_id").single();
  if (result.error || result.data?.owner_user_id !== profile.user_id) redirect("/app/bujhi?recordError=1");
  redirect("/app/bujhi");
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ recordError?: string }> }) {
  const profile = await requireWorkspace("mother");
  const db = await createServerSupabase();
  const availability = db ? await db.from("bujhi_document_reviews").select("id").limit(1) : null;
  if (!availability || availability.error) return <>
    <BujhiTasks />
    <div id="report-review" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <p className="mb-4 text-pro-text" role="status">Account report saving is unavailable. You can continue with a local review.</p>
      <MedicalEntry recordsHref="/app/jibonrekha" />
    </div>
  </>;
  const result = db ? await db.from("pregnancy_records").select("id, label, owner_user_id")
    .eq("owner_user_id", profile.user_id).order("created_at") : null;
  if (result?.error || !result) return <><BujhiTasks /><div id="report-review" tabIndex={-1} className="mx-auto max-w-3xl p-6"><h2 className="text-2xl">রিপোর্ট যাচাই</h2><p role="alert">Pregnancy records could not be loaded. Reload to try again.</p></div></>;
  if (result.data.length) return <><BujhiTasks /><div id="report-review" tabIndex={-1}><AccountReportReview pregnancies={result.data.map((item) => ({ id: item.id, label: item.label }))} /></div></>;
  const { recordError } = await searchParams;
  return <><BujhiTasks /><div id="report-review" tabIndex={-1} className="mx-auto grid max-w-3xl gap-4 p-6 text-pro-text">
    <h2 className="text-2xl font-semibold">রিপোর্ট যাচাই</h2>
    <p>Create a pregnancy record before saving a reviewed maternal measurement. Use fictional information in this prototype.</p>
    <form action={createPregnancy} className="grid gap-3">
      <label htmlFor="pregnancy-label">Pregnancy record name</label>
      <input id="pregnancy-label" name="label" required maxLength={100} className="min-h-12 rounded-field border border-pro-control-border bg-pro-bg px-3" />
      <button className="min-h-12 rounded-control bg-pro-primary px-4 text-pro-on-primary">Create record</button>
      {recordError && <p role="alert">The record could not be created. Check the name and try again.</p>}
    </form>
    <Link href="/accessibility" className="min-h-12 text-pro-primary underline">Adjust how you use PROHOR</Link>
  </div></>;
}
