import { expect, test } from "@playwright/test";
import { getBartaCoverage } from "../../src/features/barta/conversation-coverage";
import { getBartaGreeting } from "../../src/features/barta/conversation";

const cases = [
  ["i am getting worried", "worry"],
  ["im so scared", "worry"],
  ["amar bhoy lagche", "worry"],
  ["আমার ভয় লাগছে", "worry"],
  ["i cant sleep", "worry"],
  ["help", "need_help"],
  ["help me please", "need_help"],
  ["i need help", "need_help"],
  ["আমাকে সাহায্য করুন", "need_help"],
  ["are you a bot", "id_bot"],
  ["r u real person", "id_bot"],
  ["are you chatgpt", "id_bot"],
  ["are you a doctor", "id_doctor"],
  ["apni ki robot", "id_bot"],
  ["how old are you", "id_personal"],
  ["do you love me", "id_personal"],
  ["i love you", "boundary"],
  ["marry me", "boundary"],
  ["you are stupid", "rude"],
  ["useless", "rude"],
  ["boka", "rude"],
  ["tui faltu", "rude"],
  ["shut up", "rude"],
  ["wrong answer", "rude"],
  ["lol", "laugh"],
  ["haha", "laugh"],
  ["great job", "praise"],
  ["you are so helpful", "praise"],
  ["😊", "praise"],
  ["i am bored", "chat"],
  ["lets chat", "chat"],
  ["adda dibo", "chat"],
  ["be my friend", "chat"],
  ["what can i ask", "how_to"],
  ["menu", "how_to"],
  ["examples", "how_to"],
  ["where do i start", "how_to"],
  ["can you call an ambulance", "cannot_act"],
  ["nearest hospital", "cannot_act"],
  ["should i go to hospital", "cannot_decide"],
  ["is this normal", "cannot_decide"],
  ["ki korbo", "cannot_decide"],
  ["which medicine", "cannot_prescribe"],
  ["can i trust you", "trust_sources"],
  ["where do you get info", "trust_sources"],
  ["is my chat private", "privacy"],
  ["what is prohor", "about"],
  ["speak bangla", "language"],
  ["reply in english", "language"],
  ["read aloud", "voice"],
  ["mic not working", "voice"],
  ["clear chat", "clear"],
  ["call me 01712345678", "pii"],
  ["mail me a@b.com", "pii"],
  ["?", "empty"],
  ["asdf", "empty"],
  ["test", "empty"],
  ["i want to kill myself", "crisis_support"],
  ["amar more jete ichche kore", "crisis_support"],
  ["আত্মহত্যা করতে চাই", "crisis_support"],
  ["my husband beats me", "safeguarding_support"],
  ["স্বামী মারে", "safeguarding_support"],
  ["i feel hopeless", "mental_health_support"],
  ["আমি হতাশ", "mental_health_support"],
  ["why", "simplify"],
  ["ok", "yes_no"],
  ["what", "simplify"],
  ["simple words please", "simplify"],
  ["আবার বলুন", "simplify"],
  ["hello, what does ANC mean?", undefined],
  ["why is my baby crying so much at night", undefined],
  ["how many ANC visits", undefined],
  ["i am worried about bleeding during pregnancy", undefined],
  ["am i getting worried about swelling in pregnancy", undefined],
  ["what is breastfeeding", undefined],
  ["when should i call a doctor for fever", undefined],
] as const;

test("supplied Barta coverage cases preserve their intended routes or replies", () => {
  for (const [question, expected] of cases) {
    const result = getBartaCoverage(question);
    expect(result?.type === "route" ? result.route : result?.id, question).toBe(expected);
    if (result?.type === "reply") {
      expect(result.en.length, question).toBeLessThanOrEqual(500);
      expect(result.bn.length, question).toBeLessThanOrEqual(500);
    }
  }
});

test("short named follow-ups stay with the knowledge path when an answer exists", () => {
  for (const text of ["why", "ok", "what happens there", "more", "say that again", "আবার বলুন"]) {
    expect(getBartaCoverage(text, { hasPreviousAnswer: true }), text).toBeUndefined();
    expect(getBartaGreeting(text, "en", true), text).toBeUndefined();
  }
});

test("educational questions about sensitive topics are not treated as disclosures", () => {
  for (const text of ["What is domestic violence?", "What does hopeless mean?", "What does suicidal mean?", "ডিপ্রেশন কী?"]) {
    expect(getBartaCoverage(text), text).toBeUndefined();
  }
});

test("recognizable contact details are never repeated by the coverage reply", () => {
  for (const detail of ["+880 1712-345678", "০১৭১২-৩৪৫৬৭৮", "person@example.com"]) {
    const result = getBartaCoverage("What does ANC mean? Contact " + detail);
    expect(result).toMatchObject({ type: "reply", id: "pii" });
    expect(JSON.stringify(result)).not.toContain(detail);
  }
});
