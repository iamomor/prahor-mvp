import { strict as assert } from "node:assert";
import { test } from "node:test";
import { brailleCell, decodeBrailleLetters, encodeBrailleLetters } from "../../src/components/accessibility/braille-demo.ts";

test("the demo maps all 26 English letters to standard Braille cells", () => {
  const plain = "abcdefghijklmnopqrstuvwxyz";
  const cells = "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵";
  assert.equal(encodeBrailleLetters(plain), cells);
  assert.equal(decodeBrailleLetters(cells), plain);
});

test("dot entry and both supported space separators decode exactly", () => {
  assert.equal(brailleCell((1 << 0) | (1 << 1)), "⠃");
  assert.equal(encodeBrailleLetters("find care"), "⠋⠊⠝⠙⠀⠉⠁⠗⠑");
  assert.equal(decodeBrailleLetters("⠋⠊⠝⠙ ⠉⠁⠗⠑"), "find care");
  assert.equal(decodeBrailleLetters("⠋⠊⠝⠙⠀⠉⠁⠗⠑"), "find care");
});

test("unsupported input is rejected instead of partially decoded", () => {
  for (const invalid of ["⠁⠼", "⠠", "⠁⠿", "⡁", "⠁b", "⠼⠅"]) {
    assert.equal(decodeBrailleLetters(invalid), null);
  }
  for (const invalid of ["বাংলা", "care@", "café", "🚲"]) {
    assert.equal(encodeBrailleLetters(invalid), null);
  }
});


test("capital letters, numbers, punctuation, and numeric boundaries round-trip", () => {
  const examples = new Map([
    ["Find care!", "⠠⠋⠊⠝⠙⠀⠉⠁⠗⠑⠖"],
    ["3b", "⠼⠉⠰⠃"],
    ["3B", "⠼⠉⠠⠃"],
    ["4.2", "⠼⠙⠲⠃"],
    ["4.b", "⠼⠙⠲⠰⠃"],
  ]);
  for (const [text, cells] of examples) {
    assert.equal(encodeBrailleLetters(text), cells);
    assert.equal(decodeBrailleLetters(cells), text);
  }
  const sentence = "Visit 12: Ask, review; don't rush.\nReady?";
  assert.equal(decodeBrailleLetters(encodeBrailleLetters(sentence)), sentence);
});
