import { expect, test } from "@playwright/test";
import { getBartaGreeting } from "../../src/features/barta/conversation";

test("a greeting receives a localized conversation reply without citations", () => {
  expect(getBartaGreeting(" Hello! ", "en")).toMatchObject({
    status: "conversation", answer: null, citations: [], message: expect.stringContaining("Hello"),
  });
  expect(getBartaGreeting("kemon aso?", "bn")).toMatchObject({
    status: "conversation", answer: null, citations: [], message: expect.stringContaining("ধন্যবাদ"),
  });
});

test("greetings never swallow an attached education or safety question", () => {
  expect(getBartaGreeting("Hello, what does ANC mean?", "en")).toBeUndefined();
  expect(getBartaGreeting("Hi, I have heavy bleeding", "en")).toBeUndefined();
});

test("identity and voice help use localized conversation replies", () => {
  expect(getBartaGreeting("Who are you?", "en")).toMatchObject({ status: "conversation" });
  expect(getBartaGreeting("Mic kivabe use korbo?", "bn")).toMatchObject({
    status: "conversation", message: expect.stringContaining("মাইক্রোফোন"),
  });
  expect(getBartaGreeting("How do I use the microphone? I have heavy bleeding.", "en")).toBeUndefined();
});
