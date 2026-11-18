import "server-only";
import { createServerSupabase } from "../supabase/server";
import { handleCare, type CareOperation } from "./handlers";

/** Cookie-bound routes fail closed when database RPCs are unavailable. */
export function handleCareRequest(request: Request, operation: CareOperation, resourceId?: string) {
  return handleCare(request, operation, {
    createClient: createServerSupabase, siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  }, resourceId);
}
