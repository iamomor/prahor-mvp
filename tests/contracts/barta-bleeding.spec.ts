import { expect, test } from "@playwright/test";
import { getBartaBleedingClarification, getUsualPeriodQuestion } from "../../src/features/barta/bleeding-clarification";
import { educationTopics } from "../../src/features/barta/education-topics";

test("a colloquial period question asks the user to clarify pregnancy and birth context", () => {
  for (const question of ["আমার পিরিয়ড চলতেছে আমি কি করবো", "Amar piriyod choltese, ki korbo?", "I'm on my period, what should I do?"]) {
    expect(getBartaBleedingClarification(question, "bn")).toMatchObject({
      status: "clarification", citations: [], suggestions: [
        educationTopics.periodCare.bn, "গর্ভধারণের সম্ভাবনা আছে এবং রক্তপাত হচ্ছে", "প্রসবের পর রক্তপাত হচ্ছে",
      ],
    });
  }
});

test("the bleeding paths distinguish usual symptoms, possible pregnancy and recent birth", () => {
  expect(getBartaBleedingClarification(educationTopics.periodCare.bn, "bn")).toBeUndefined();
  expect(getUsualPeriodQuestion("আমার নিয়মিত মাসিক চলছে কী করব", "bn")).toBe(educationTopics.periodCare.bn);
  expect(getBartaBleedingClarification("My period is late and my pregnancy test is positive", "en")).toBeUndefined();
  expect(getBartaBleedingClarification("গর্ভধারণের সম্ভাবনা আছে এবং রক্তপাত হচ্ছে", "bn")).toMatchObject({
    reason: "urgent_care", citations: [],
  });
  expect(getBartaBleedingClarification("প্রসবের পর রক্তপাত হচ্ছে", "bn")).toMatchObject({
    reason: "outside_education_scope", citations: [],
  });
});
