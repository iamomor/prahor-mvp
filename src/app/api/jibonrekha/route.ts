import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createBabyRequestSchema, createMaternalConditionRequestSchema, createObservationRequestSchema, createPregnancyRequestSchema, createSymptomNoteRequestSchema, measurementFitsDestination } from "@/lib/contracts/health";

const saveSchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("pregnancy"), record: createPregnancyRequestSchema }),
  z.strictObject({ type: z.literal("baby"), record: createBabyRequestSchema }),
  z.strictObject({ type: z.literal("observation"), record: createObservationRequestSchema }),
  z.strictObject({ type: z.literal("condition"), record: createMaternalConditionRequestSchema }),
  z.strictObject({ type: z.literal("symptom_note"), record: createSymptomNoteRequestSchema }),
  z.strictObject({ type: z.literal("visit"), record: z.strictObject({ subject: z.enum(["mother", "baby"]), parentId: z.uuid().nullable(), occurredAt: z.iso.datetime({ offset: true }), placeNote: z.string().trim().min(1).max(300).nullable(), note: z.string().trim().min(1).max(2000).nullable() }) }),
  z.strictObject({ type: z.literal("correction"), record: z.strictObject({ subject: z.enum(["mother", "baby"]), observationId: z.uuid(), value: z.string().trim().min(1).max(2000), unit: z.string().trim().max(20).nullable(), reason: z.string().trim().min(1).max(500) }) }),
]);

async function motherDb() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return { status: identity.status, db: null };
  if (identity.profile.role !== "mother" || !db) return { status: 403, db: null };
  return { status: 200, db };
}

export async function GET() {
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view account records." }, auth.status);
  const [pregnancies, babies, maternal, baby, conditions, symptomNotes, visits, corrections] = await Promise.all([
    auth.db.from("pregnancy_records").select("id,label,estimated_due_date,last_menstrual_period_date,created_at").order("created_at", { ascending: false }).limit(50),
    auth.db.from("baby_records").select("id,pregnancy_id,label,birth_date,created_at").order("created_at", { ascending: false }).limit(100),
    auth.db.from("health_observations").select("id,pregnancy_id,kind,value,unit,observed_at,source,verification,source_note").order("observed_at", { ascending: false }).limit(100),
    auth.db.from("baby_observations").select("id,baby_id,kind,value,unit,observed_at,source,verification,source_note").order("observed_at", { ascending: false }).limit(100),
    auth.db.from("maternal_conditions").select("id,pregnancy_id,label,documented_at,source_note").order("documented_at", { ascending: false }).limit(100),
    auth.db.from("maternal_symptom_notes").select("id,pregnancy_id,note,occurred_at").order("occurred_at", { ascending: false }).limit(100),
    auth.db.from("jr_visits").select("id,subject,pregnancy_id,baby_id,occurred_at,place_note,note").order("occurred_at", { ascending: false }).limit(100),
    auth.db.from("jr_observation_corrections").select("id,subject,old_observation_id,new_observation_id,reason,corrected_at").order("corrected_at", { ascending: false }).limit(100),
  ]);
  if (pregnancies.error || babies.error || maternal.error || baby.error || conditions.error || symptomNotes.error || visits.error || corrections.error) return jsonNoStore({ message: "Account records are unavailable. Try again." }, 503);
  return jsonNoStore({ pregnancies: pregnancies.data, babies: babies.data, observations: [
    ...maternal.data.map(row => ({ ...row, subject: "mother" as const })),
    ...baby.data.map(row => ({ ...row, subject: "baby" as const })),
  ].sort((a, b) => b.observed_at.localeCompare(a.observed_at)), conditions: conditions.data, symptomNotes: symptomNotes.data,
  visits: visits.data, corrections: corrections.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) return jsonNoStore({ message: "Check the required fields, date and unit." }, 400);
  const key = request.headers.get("idempotency-key");
  if (!key || !z.uuid().safeParse(key).success) return jsonNoStore({ message: "A retry key is required. Reload and try again." }, 400);
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to save account records." }, auth.status);
  const { type, record } = parsed.data;
  if (type === "observation" && !measurementFitsDestination(record.destination, record.measurement)) return jsonNoStore({ message: "That measurement is not supported for this record." }, 400);
  const data = type === "pregnancy" ? { label: record.label, due: record.estimatedDueDate, period: record.lastMenstrualPeriodDate }
    : type === "baby" ? record
    : type === "observation" ? { subject: record.destination.subject,
        parentId: record.destination.subject === "mother" ? record.destination.pregnancyId : record.destination.babyId,
        kind: record.measurement.kind, value: record.measurement.value, unit: record.measurement.unit,
        observedAt: record.observedAt, sourceNote: record.sourceNote }
    : record;
  const result = await auth.db.rpc("jr_save", { p_action: type, p_data: data, p_key: key });
  if (result.error) {
    const status = result.error.code === "40001" || result.error.code === "23505" ? 409 :
      result.error.code === "42501" ? 403 : ["22023", "22007", "22008", "22P02", "23514"].includes(result.error.code) ? 400 : 503;
    return jsonNoStore({ message: status === 409 ? "This record changed. Reload to review before trying again." : status === 403 ? "That record is not available in your account." : status === 400 ? "Check the date, value, unit and destination." : "Account save is unavailable. Try again." }, status);
  }
  return jsonNoStore({ saved: true, id: result.data }, 201);
}
