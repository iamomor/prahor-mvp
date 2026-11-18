import "server-only";

type Candidate = { id: string; example: string };
type Selector = (question: string, candidates: Candidate[]) => Promise<string | null>;

const freeModels = ["qwen/qwen3.6-plus:free", "openrouter/free"];
const words = (text: string) => text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{M}]{3,}/gu) ?? [];
const genericWords = new Set("what when how can should the about during please help does need which tell for and সম্পর্কে কখন কীভাবে জন্য আমার".split(" "));

export function getBartaOpenRouterSelector(): Selector | undefined {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return undefined;

  const models = [
    process.env.BARTA_OPENROUTER_MODEL?.trim() || freeModels[0],
    process.env.BARTA_OPENROUTER_FALLBACK_MODEL?.trim() || freeModels[1],
  ].filter((model) => model === "openrouter/free" || /^[\w.-]+\/[\w.-]+:free$/u.test(model));

  return async (question, candidates) => {
    const options = candidates.slice(0, 8);
    if (!options.length) return null;
    const vocabulary = new Set(options.flatMap(({ example }) => words(example)));
    const signals = [...new Set(words(question).filter((word) => vocabulary.has(word) && !genericWords.has(word)))].slice(0, 8);
    if (signals.length < 2) return null;

    for (const model of new Set(models)) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          redirect: "error",
          cache: "no-store",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(2200),
          body: JSON.stringify({
            model, max_tokens: 24, temperature: 0,
            messages: [
              { role: "system", content: "Choose a reviewed question that directly matches the keyword signals. Return its numeric index alone or NONE if uncertain. Never answer the medical question." },
              { role: "user", content: JSON.stringify({ signals, options: options.map(({ example }, index) => ({ index, example })) }) },
            ],
          }),
        });
        if (!response.ok) continue;
        const output = (await response.json()).choices?.[0]?.message?.content;
        if (typeof output !== "string") continue;
        const choice = output.trim();
        if (choice === "NONE") return null;
        if (/^[0-7]$/u.test(choice) && options[Number(choice)]) return options[Number(choice)].id;
      } catch {
        // The caller continues with the local reviewed matcher when the providers fail.
      }
    }
    return null;
  };
}
