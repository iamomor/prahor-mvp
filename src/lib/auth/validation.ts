import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254).email();
const next = z.string().max(2048).optional();
export const signInSchema = z.strictObject({ email, password: z.string().min(1).max(128), next });
export const signUpSchema = z.strictObject({ email, password: z.string().min(12).max(128), next });
export const emailLinkSchema = z.strictObject({ email, next });

export function siteOrigin(value: string | undefined): string | null {
  try {
    const url = new URL(value ?? "");
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) return null;
    return url.origin;
  } catch { return null; }
}

export function sameOriginPost(request: Request, expected: string | null): boolean {
  return request.method === "POST" && sameOriginRequest(request, expected);
}

export function sameOriginRequest(request: Request, expected: string | null): boolean {
  return Boolean(expected && request.headers.get("origin") === expected);
}

export async function boundedJson(request: Request, maxBytes = 8192): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > maxBytes || !request.body) throw new Error("Invalid body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("Invalid body"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
