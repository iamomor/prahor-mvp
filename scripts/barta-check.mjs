import { readFile } from "node:fs/promises";

export function bartaBase() {
  const url = new URL(process.env.BARTA_LOCAL_URL || "http://127.0.0.1:3000");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Use the local Next.js server for this tool.");
  return url.origin;
}

export async function bartaAsk(question, language, previousChunkId) {
  const reply = await fetch(bartaBase() + "/api/ai/chat", {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, language, ...(previousChunkId && { previousChunkId }) }),
  });
  if (!reply.ok) throw new Error(`Barta returned HTTP ${reply.status} for ${question}`);
  return reply.json();
}

export async function canonicalQuestions() {
  const source = await readFile("src/features/barta/education-topics.ts", "utf8");
  const pairs = [...source.matchAll(/^\s+(\w+):\s*\{\s*en:\s*("(?:[^"\\]|\\.)*"),\s*bn:\s*("(?:[^"\\]|\\.)*")\s*\},/gmu)];
  if (pairs.length < 30) throw new Error("Could not read the reviewed bilingual question catalog.");
  return pairs.flatMap(([, id, en, bn]) => [
    { id, question: JSON.parse(en), language: "en" }, { id, question: JSON.parse(bn), language: "bn" },
  ]);
}

export const conversations = [
  ["Hello", "en"], ["How are you?", "en"], ["Thank you", "en"], ["See you later", "en"],
  ["Sorry", "en"], ["Okay", "en"], ["What can you do?", "en"], ["Can you remind me?", "en"],
  ["আসসালামু আলাইকুম", "bn"], ["tumi kmn aso", "bn"], ["অনেক ধন্যবাদ", "bn"], ["Allah hafiz", "bn"],
  ["মাফ করবেন", "bn"], ["বুঝলাম", "bn"], ["আপনি কে?", "bn"], ["আপনি কি রিমাইন্ডার দিতে পারেন?", "bn"],
];
