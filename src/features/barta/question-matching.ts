const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function oneEdit(first: string, second: string): boolean {
  const from = Array.from(graphemes.segment(first), ({ segment }) => segment);
  const to = Array.from(graphemes.segment(second), ({ segment }) => segment);
  if (Math.max(from.length, to.length) < 4 || Math.abs(from.length - to.length) > 1) return false;

  const index = from.findIndex((character, offset) => character !== to[offset]);
  const mismatch = index === -1 ? from.length : index;
  const tail = (word: string[], start: number) => word.slice(start).join("");
  if (from.length > to.length) return tail(from, mismatch + 1) === tail(to, mismatch);
  if (from.length < to.length) return tail(from, mismatch) === tail(to, mismatch + 1);
  return tail(from, mismatch + 1) === tail(to, mismatch + 1)
    || (from[mismatch] === to[mismatch + 1] && from[mismatch + 1] === to[mismatch]
      && tail(from, mismatch + 2) === tail(to, mismatch + 2));
}

const intentWords = new Set(["what", "who", "when", "where", "how", "why", "which", "not", "without", "never",
  "কি", "কী", "কেন", "কত", "কখন", "কোথায়", "না", "ছাড়া", "kobe", "kothay", "keno"]);
const word = /^[\p{L}\p{M}]+$/u;

// A whole reviewed question may differ by one edit in one word. Short fragments,
// changed question words and added context must use clarification or abstention.
export function isMinorBartaTypo(question: string, alias: string): boolean {
  const parts = question.split(" ");
  const expected = alias.split(" ");
  if (parts.length < 3 || parts.length !== expected.length) return false;
  const mismatches = parts.flatMap((part, index) => part === expected[index] ? [] : [index]);
  if (mismatches.length !== 1) return false;
  const index = mismatches[0];
  const first = parts[index];
  const second = expected[index];
  return !intentWords.has(first) && !intentWords.has(second)
    && word.test(first) && word.test(second) && oneEdit(first, second);
}
