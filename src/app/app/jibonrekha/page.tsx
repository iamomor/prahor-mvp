import { requireWorkspace } from "@/lib/auth/require-workspace";
import { RecordsWorkspace } from "@/features/jibonrekha/RecordsWorkspace";
export default async function RecordsPage() { await requireWorkspace("mother"); return <RecordsWorkspace />; }
