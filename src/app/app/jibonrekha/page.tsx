import { requireWorkspace } from "@/lib/auth/require-workspace";
import { RecordsWorkspace } from "@/features/jibonrekha/RecordsWorkspace";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function RecordsPage() {
  const profile = await requireWorkspace("mother");
  const db = await createServerSupabase();
  const result = db ? await db.from("health_observations")
    .select("id, value, unit, observed_at")
    .eq("owner_user_id", profile.user_id)
    .eq("kind", "hemoglobin")
    .eq("source", "document_extracted")
    .eq("verification", "user_verified")
    .order("observed_at", { ascending: false }) : null;
  return <>
    <section className="mx-auto grid max-w-4xl gap-3 px-4 py-6 text-pro-text" aria-label="Account report measurements">
      <h2 className="text-2xl font-semibold">Reviewed report measurements in your account</h2>
      {!result || result.error ? <p role="status">Account measurements are unavailable. Reload to try again.</p> :
        result.data.length === 0 ? <p>No account report measurements saved yet.</p> :
        <ul className="grid gap-3">{result.data.map((item) => <li key={item.id} className="rounded-card border border-pro-border p-4">
          <strong>Maternal hemoglobin: {item.value} {item.unit}</strong>
          <p>Extracted from document · Reviewed by you</p>
          <time dateTime={item.observed_at}>{new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(item.observed_at))}</time>
        </li>)}</ul>}
    </section>
    <RecordsWorkspace />
  </>;
}
