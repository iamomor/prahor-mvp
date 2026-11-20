// Uncontracted English practice subset. Full UEB has additional signs and modes.
const letters = "abcdefghijklmnopqrstuvwxyz";
const digits = "1234567890";
const masks = [1, 3, 9, 25, 17, 11, 27, 19, 10, 26, 5, 7, 13, 29, 21, 15, 31, 23, 14, 30, 37, 39, 58, 45, 61, 53] as const;
const blank = "\u2800";
const numberSign = "⠼";
const capitalSign = "⠠";
const gradeOneSign = "⠰";
const punctuation = new Map([
  [",", "⠂"], [";", "⠆"], [":", "⠒"], [".", "⠲"], ["!", "⠖"],
  ["?", "⠦"], ["'", "⠄"], ["-", "⠤"],
]);
const punctuationByCell = new Map(Array.from(punctuation, ([plain, cell]) => [cell, plain]));

export function brailleCell(mask: number): string {
  return String.fromCodePoint(0x2800 + mask);
}

export function encodeBrailleLetters(text: string): string | null {
  let result = "";
  let numeric = false;
  for (const character of text) {
    if (character === " " || character === "\n") {
      result += character === " " ? blank : "\n";
      numeric = false;
      continue;
    }
    const digit = digits.indexOf(character);
    if (digit >= 0) {
      if (!numeric) result += numberSign;
      result += brailleCell(masks[digit]);
      numeric = true;
      continue;
    }
    const mark = punctuation.get(character);
    if (mark) {
      result += mark;
      numeric = numeric && (character === "." || character === ",");
      continue;
    }
    const lower = character.toLowerCase();
    const letter = letters.indexOf(lower);
    if (letter < 0 || !/^[a-z]$/u.test(lower)) return null;
    if (character !== lower) result += capitalSign;
    else if (numeric && letter < digits.length) result += gradeOneSign;
    result += brailleCell(masks[letter]);
    numeric = false;
  }
  return result;
}

export function decodeBrailleLetters(cells: string): string | null {
  let result = "";
  let numeric = false;
  let pending: "capital" | "letter" | "digit" | undefined;

  for (const cell of cells) {
    if (cell === blank || cell === " " || cell === "\n") {
      if (pending) return null;
      result += cell === "\n" ? "\n" : " ";
      numeric = false;
      continue;
    }
    if (cell === numberSign || cell === capitalSign || cell === gradeOneSign) {
      if (pending) return null;
      pending = cell === numberSign ? "digit" : cell === capitalSign ? "capital" : "letter";
      numeric = cell === numberSign;
      continue;
    }
    const mark = punctuationByCell.get(cell);
    if (mark) {
      if (pending) return null;
      result += mark;
      numeric = numeric && (mark === "." || mark === ",");
      continue;
    }
    const mask = (cell.codePointAt(0) ?? 0) - 0x2800;
    const index = masks.findIndex(value => value === mask);
    if (index < 0 || (pending === "digit" && index >= digits.length)) return null;
    const isDigit: boolean = numeric && index < digits.length;
    result += isDigit ? digits[index] : pending === "capital" ? letters[index].toUpperCase() : letters[index];
    numeric = isDigit;
    pending = undefined;
  }

  return pending ? null : result;
}
