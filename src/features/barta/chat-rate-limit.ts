import "server-only";
import { createHmac } from "node:crypto";

const windowMs = 60_000;
const maxQuestions = 20;
const localHits = new Map<string, { expires: number; count: number }>();

const countWithExpiry = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 or redis.call('PTTL', KEYS[1]) < 0 then",
  "  redis.call('PEXPIRE', KEYS[1], ARGV[1])",
  "end",
  "return {count, redis.call('PTTL', KEYS[1])}",
].join("\n");

export async function getBartaChatRetryAfter(request: Request, now = Date.now()): Promise<number> {
  const forwarded = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")
    : request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const client = forwarded?.split(",")[0]?.trim() || "unknown";
  const endpoint = process.env.BARTA_RATE_LIMIT_REDIS_URL;
  const token = process.env.BARTA_RATE_LIMIT_REDIS_TOKEN;
  if (endpoint && token) {
    try {
      const url = new URL(endpoint);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid rate limit endpoint");
      const digest = createHmac("sha256", token).update(client).digest("hex");
      const key = ["barta", "chat", process.env.VERCEL_ENV ?? "local", digest].join(":");
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", countWithExpiry, 1, key, windowMs]),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(800),
      });
      if (response.ok) {
        const data: { result?: unknown } = await response.json();
        if (Array.isArray(data.result) && data.result.length === 2) {
          const [count, remaining] = data.result;
          if (Number.isInteger(count) && count >= 1 && Number.isInteger(remaining) && remaining >= 0 && remaining <= windowMs) {
            return count > maxQuestions ? Math.max(1, Math.ceil(remaining / 1000)) : 0;
          }
        }
      }
    } catch {
      // If the shared service is unavailable, keep the existing local cap.
    }
  }

  if (localHits.size >= 5000 && !localHits.has(client)) {
    const oldest = localHits.keys().next().value;
    if (oldest !== undefined) localHits.delete(oldest);
  }
  const hit = localHits.get(client);
  if (!hit || hit.expires <= now) {
    localHits.set(client, { expires: now + windowMs, count: 1 });
    return 0;
  }
  return ++hit.count > maxQuestions ? Math.ceil((hit.expires - now) / 1000) : 0;
}
