import { z } from "zod";
import { currentApiContracts, starterHealthResponseSchema } from "@/lib/contracts/current-api";
import { createDiaryEntryRequestSchema, createWellnessEntryRequestSchema } from "@/lib/contracts/wellness";

const wellnessHistorySchema = currentApiContracts["GET /api/wellness"].responses[200];
const diaryHistorySchema = currentApiContracts["GET /api/diary"].responses[200];
const wellnessSavedSchema = currentApiContracts["POST /api/wellness"].responses[201];
const diarySavedSchema = currentApiContracts["POST /api/diary"].responses[201];

export type WellnessHistoryEntry = z.infer<typeof wellnessHistorySchema>["entries"][number];
export type DiaryHistoryEntry = z.infer<typeof diaryHistorySchema>["entries"][number];
export type WellnessSaveInput = Partial<Pick<z.input<typeof createWellnessEntryRequestSchema>,
  "mood" | "energy" | "activityNote" | "restNote">> & { occurredAt?: string };

type ApiFailureKind = "network" | "http" | "invalid-request" | "invalid-response";

export class ShusthotaApiError extends Error {
  constructor(readonly kind: ApiFailureKind, readonly status: number | null = null, readonly serverMessage: string | null = null) {
    super("Shusthota request failed");
    this.name = "ShusthotaApiError";
  }
}

export function shusthotaErrorCopy(error: unknown, action: "load" | "save") {
  if (error instanceof ShusthotaApiError) {
    if (error.kind === "invalid-request") {
      return { en: "Check the entry and try again. It was not saved.", bn: "লেখাটি দেখে আবার চেষ্টা করুন। এটি সংরক্ষিত হয়নি।" };
    }
    if (error.status === 400) {
      return action === "save"
        ? { en: "Check the entry and try again. It was not saved.", bn: "লেখাটি দেখে আবার চেষ্টা করুন। এটি সংরক্ষিত হয়নি।" }
        : { en: "The history request was invalid. Reload the page and try again.", bn: "ইতিহাসের অনুরোধটি গ্রহণ করা যায়নি। পাতা নতুন করে খুলে আবার চেষ্টা করুন।" };
    }
    if (error.status === 401) {
      return { en: "Your session may have ended. Sign in again to continue.", bn: "আপনার সেশনের মেয়াদ শেষ হতে পারে। চালিয়ে যেতে আবার সাইন ইন করুন।" };
    }
    if (error.status === 403) {
      return { en: "This record is available to confirmed mother accounts only.", bn: "এই রেকর্ড শুধু যাচাইকৃত মায়ের অ্যাকাউন্টে পাওয়া যায়।" };
    }
    if (error.status === 503) {
      return action === "save"
        ? { en: "Saving is temporarily unavailable. The server did not confirm a save.", bn: "এখন সংরক্ষণ করা যাচ্ছে না। সার্ভার সংরক্ষণ নিশ্চিত করেনি।" }
        : { en: "Your history is temporarily unavailable. Try again.", bn: "আপনার ইতিহাস এখন পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।" };
    }
    if (error.kind === "network") {
      return action === "save"
        ? { en: "We could not confirm whether this entry was saved. Check your history before retrying.", bn: "লেখাটি সংরক্ষিত হয়েছে কি না নিশ্চিত করা যায়নি। আবার চেষ্টা করার আগে ইতিহাস দেখুন।" }
        : { en: "The service could not be reached. Check your connection and try again.", bn: "সেবাটির সঙ্গে সংযোগ করা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।" };
    }
    if (error.kind === "invalid-response") {
      return action === "save"
        ? { en: "The save response could not be verified. Check your history before retrying.", bn: "সংরক্ষণের উত্তর যাচাই করা যায়নি। আবার চেষ্টা করার আগে ইতিহাস দেখুন।" }
        : { en: "The history response could not be verified. Try again.", bn: "ইতিহাসের উত্তর যাচাই করা যায়নি। আবার চেষ্টা করুন।" };
    }
  }

  return action === "save"
    ? { en: "The entry could not be saved. Your text is still here; try again.", bn: "লেখাটি সংরক্ষণ করা যায়নি। আপনার লেখা এখানেই আছে; আবার চেষ্টা করুন।" }
    : { en: "Your history could not be loaded. Try again.", bn: "আপনার ইতিহাস আনা যায়নি। আবার চেষ্টা করুন।" };
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

async function requestJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init: RequestInit = {},
): Promise<z.infer<TSchema>> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ShusthotaApiError("network");
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    // Retain only the documented `{message}` shape; UI copy stays localized and generic.
    const errorBody = starterHealthResponseSchema.safeParse(body);
    throw new ShusthotaApiError("http", response.status, errorBody.success ? errorBody.data.message : null);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ShusthotaApiError("invalid-response", response.status);
  return parsed.data;
}

export async function loadWellnessEntries(signal?: AbortSignal): Promise<WellnessHistoryEntry[]> {
  const result = await requestJson("/api/wellness", wellnessHistorySchema, { method: "GET", signal });
  return result.entries;
}

export async function saveWellnessEntry(input: WellnessSaveInput): Promise<z.infer<typeof wellnessSavedSchema>> {
  const body = createWellnessEntryRequestSchema.safeParse({
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    mood: input.mood ?? null,
    energy: input.energy ?? null,
    activityNote: input.activityNote ?? null,
    restNote: input.restNote ?? null,
  });
  if (!body.success) throw new ShusthotaApiError("invalid-request", 400);

  return requestJson("/api/wellness", wellnessSavedSchema, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body.data),
  });
}

export async function loadDiaryEntries(signal?: AbortSignal): Promise<DiaryHistoryEntry[]> {
  const result = await requestJson("/api/diary", diaryHistorySchema, { method: "GET", signal });
  return result.entries;
}

export async function saveDiaryEntry(text: string, occurredAt = new Date().toISOString()): Promise<z.infer<typeof diarySavedSchema>> {
  const body = createDiaryEntryRequestSchema.safeParse({ text, occurredAt });
  if (!body.success) throw new ShusthotaApiError("invalid-request", 400);

  return requestJson("/api/diary", diarySavedSchema, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body.data),
  });
}
