import { z } from "zod";
import { apiSuccessSchema } from "@/lib/contracts/transport";
export class CareError extends Error {
  constructor(public readonly status: number) { super("Care action could not be confirmed."); }
}
/** Cookie-bound identity is authoritative. This header also detects a changed account. */
export async function careFetch<S extends z.ZodType>(path: string, schema: S, account: string,
  options?: { body?: unknown; key?: string; signal?: AbortSignal; post?: boolean }): Promise<z.infer<S>> {
  const response = await fetch(path, {
    method: options?.post ? "POST" : "GET", credentials: "same-origin", cache: "no-store",
    headers: { "X-Prohor-Account": account, Accept: "application/json",
      ...(options?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options?.key ? { "Idempotency-Key": options.key } : {}) },
    ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    signal: options?.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new CareError(response.status);
  const envelope = apiSuccessSchema(z.unknown()).safeParse(await response.json());
  if (!envelope.success) throw new CareError(503);
  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) throw new CareError(503);
  return parsed.data;
}
