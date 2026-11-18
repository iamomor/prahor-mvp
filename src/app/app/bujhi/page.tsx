import { requireWorkspace } from "@/lib/auth/require-workspace";
import { MedicalEntry } from "@/features/bujhi/MedicalEntry";
export default async function ReportPage() { await requireWorkspace("mother"); return <MedicalEntry recordsHref="/app/jibonrekha" />; }
