const LOCAL_ORIGINS = new Set(["http://127.0.0.1:54321", "http://localhost:54321"]);

export function jwtRole(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).role;
  } catch {
    return undefined;
  }
}

export function validateLocalUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("A local Supabase URL is required."); }
  if (!LOCAL_ORIGINS.has(url.origin) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("RLS tests allow only http://127.0.0.1:54321 or http://localhost:54321.");
  }
  return url.origin;
}

export function validatePublicKey(key) {
  if (typeof key !== "string" ||
      !(key.startsWith("sb_publishable_") || jwtRole(key) === "anon")) {
    throw new Error("Use a local publishable/anon key; privileged keys are forbidden.");
  }
  return key;
}

export function readSessionConfig(env) {
  const required = ["PROHOR_RLS_URL", "PROHOR_RLS_PUBLIC_KEY",
    "PROHOR_RLS_AYESHA_PASSWORD", "PROHOR_RLS_NUSRAT_PASSWORD"];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing test configuration: ${missing.join(", ")}.`);
  return {
    url: validateLocalUrl(env.PROHOR_RLS_URL),
    key: validatePublicKey(env.PROHOR_RLS_PUBLIC_KEY),
    ayesha: { email: "ayesha-rls@example.invalid", password: env.PROHOR_RLS_AYESHA_PASSWORD },
    nusrat: { email: "nusrat-rls@example.invalid", password: env.PROHOR_RLS_NUSRAT_PASSWORD },
  };
}

export function localSessionFetch(origin, fetchImpl = fetch) {
  validateLocalUrl(origin);
  return async (input, init = {}) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    if (url.origin !== origin ||
        !(url.pathname.startsWith("/auth/v1/") || url.pathname.startsWith("/rest/v1/")) ||
        url.pathname.startsWith("/auth/v1/admin")) {
      throw new Error("Request outside local Auth/REST test boundary refused.");
    }
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    const apiKey = headers.get("apikey");
    if (apiKey) validatePublicKey(apiKey);
    const bearer = headers.get("authorization")?.replace(/^Bearer /i, "");
    if (bearer && !bearer.startsWith("sb_publishable_") &&
        !["anon", "authenticated"].includes(jwtRole(bearer))) {
      throw new Error("Privileged or unrecognized bearer refused.");
    }
    return fetchImpl(input, { ...init, redirect: "error", signal: AbortSignal.timeout(10_000) });
  };
}
