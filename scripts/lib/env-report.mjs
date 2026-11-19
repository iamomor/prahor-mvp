/** Classify env names against .env.example. Values are never read into the report. */
export const requiredEnv = ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

export function exampleNames(exampleText) {
  return [...exampleText.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(match => match[1]);
}

/** localNames: names defined in the developer's own env files (not the whole process env). */
export function envReport(localNames, exampleText, env) {
  const known = new Set(exampleNames(exampleText));
  const has = name => Boolean(env[name]?.trim());
  return {
    missingRequired: requiredEnv.filter(name => !has(name)),
    missingOptional: [...known].filter(name => !requiredEnv.includes(name) && !has(name)),
    unknown: localNames.filter(name => !known.has(name)),
  };
}
