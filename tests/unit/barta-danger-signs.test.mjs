// Barta danger-sign routing. Basis: WHO PCPNC "go to hospital immediately" signs and the WHO/JHU FP Handbook urgent list.
// Runs without installing anything: the gate's only import (the Zod contract) is replaced by a pass-through.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const source = readFileSync(new URL("../../src/features/barta/safety-gate.ts", import.meta.url), "utf8")
  .replace(/import \{[^}]*\} from "@\/lib\/contracts\/barta";/u, "const bartaAnswerSchema = { parse: (value) => value };");
const { getBartaSafetyResponse } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`);
const route = (q, lang = "en") => getBartaSafetyResponse(q, lang)?.reason ?? "answer";

const urgent = [
  ["en", "My baby is not moving today"], ["en", "I can't feel the baby move"], ["en", "I haven't felt my baby kick all day"],
  ["bn", "বাচ্চা নড়ছে না"], ["bn", "পেটের বাচ্চা সকাল থেকে নড়ছে না"], ["bn", "বাচ্চা আগের মতো নড়াচড়া করছে না"],
  ["en", "I have heavy bleeding"], ["en", "I am 7 months pregnant and bleeding"], ["bn", "প্রচুর রক্তপাত হচ্ছে"],
  ["en", "I have a high fever and I am pregnant"], ["en", "fever after delivery"], ["bn", "গর্ভাবস্থায় অনেক জ্বর"], ["bn", "আমি গর্ভবতী, খুব জ্বর"], ["en", "gorbhoboti ar onek jor"],
  ["en", "I am having convulsions"], ["en", "I had a fit"], ["bn", "খিঁচুনি হচ্ছে"],
  ["en", "severe headache and blurred vision"], ["bn", "গর্ভাবস্থায় তীব্র মাথাব্যথা আর চোখে ঝাপসা দেখি"],
  ["en", "my water broke"], ["en", "my waters have broken at 32 weeks"], ["bn", "আমার পানি ভেঙেছে"],
  ["en", "severe abdominal pain"], ["bn", "পেটে তীব্র ব্যথা"], ["en", "difficulty breathing"], ["bn", "শ্বাস নিতে কষ্ট হচ্ছে"],
  ["en", "swollen face and hands and headache in pregnancy"], ["bn", "মুখ ও হাত ফুলে গেছে, মাথাব্যথা"],
];
const crisis = [["en", "I want to kill myself"], ["bn", "আমি মরে যেতে চাই"], ["bn", "আমার বাঁচতে ইচ্ছে করে না"], ["en", "ami more jete chai"]];
const everyday = [
  ["en", "when will I feel my baby move for the first time"], ["en", "how often should the baby move"], ["en", "what causes fever"],
  ["en", "what is a fit and healthy pregnancy diet"], ["en", "my hands are swollen in the morning"], ["bn", "বাচ্চা কখন নড়াচড়া শুরু করে"],
  ["bn", "জ্বর কেন হয়"], ["en", "is it normal to have mild headaches"], ["en", "how much water should I drink"], ["bn", "গর্ভাবস্থায় কী খাবার ভালো"],
];

test("danger signs route to urgent care in English, Bangla and Banglish", () => {
  for (const [lang, q] of urgent) assert.equal(route(q, lang), "urgent_care", q);
});
test("self-harm statements route to crisis support", () => {
  for (const [lang, q] of crisis) assert.equal(route(q, lang), "crisis_support", q);
});
test("everyday questions are not escalated", () => {
  for (const [lang, q] of everyday) assert.equal(route(q, lang), "answer", q);
});
test("decomposed and precomposed Bangla nukta letters route the same", () => {
  const precomposed = "বাচ্চা নড়ছে না", decomposed = "বাচ্চা নড়ছে না";
  assert.equal(route(precomposed, "bn"), "urgent_care");
  assert.equal(route(decomposed, "bn"), "urgent_care");
});
test("urgent reply tells her not to wait for chat", () => {
  const reply = getBartaSafetyResponse("I can't feel the baby move", "en");
  assert.equal(reply.status, "abstained");
  assert.match(reply.message, /immediately/u);
});

test("reported temperatures respect the threshold; ordinary questions about fit stay educational", () => {
  assert.equal(route("I am pregnant and my fever is mild"), "answer");
  assert.equal(route("I am pregnant and have a fever of 100.3 F"), "answer");
  assert.equal(route("I am pregnant and have a fever of 100.4 F"), "urgent_care");
  assert.equal(route("I am pregnant and have a fever of 38 C"), "urgent_care");
  assert.equal(route("I am fitting a car seat"), "answer");
});
