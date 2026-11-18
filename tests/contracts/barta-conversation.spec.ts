import { expect, test } from "@playwright/test";
import { getBartaGreeting, stripOpeningGreeting } from "../../src/features/barta/conversation";
import { detectBartaLanguage } from "../../src/features/barta/chat-language";

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

test("general worry gets a supportive localized follow-up", () => {
  for (const text of ["i am getting worried", "Hey Barta, I'm kinda scared", "I feel very nervous"]) {
    expect(getBartaGreeting(text, "en")).toMatchObject({
      status: "conversation", answer: null, citations: [], message: expect.stringContaining("What are you worried about?"),
    });
  }
  for (const text of ["amar chinta hocche", "chinta lagtese", "মন খারাপ", "আমার খুব চিন্তা হচ্ছে"]) {
    expect(detectBartaLanguage(text)).toBe("bn");
    expect(getBartaGreeting(text, "bn")).toMatchObject({
      status: "conversation", message: expect.stringContaining("কী নিয়ে চিন্তা হচ্ছে?"),
    });
  }
});

test("casual greetings, common shorthand and emoji stay conversational", () => {
  for (const text of ["Hiiii there 👋", "hi hello", "hello, how r u?", "wassup", "tysm!", "ttyl", "idk", "bruh", "lol 😂", "👋", "👍", "কি খবর", "ektu kotha boli", "are you a doctor"]) {
    expect(getBartaGreeting(text, "en"), text).toMatchObject({ status: "conversation", answer: null, citations: [] });
  }
});

test("small talk leaves substantive questions and warning signs for the existing handlers", () => {
  expect(stripOpeningGreeting("heyyy Barta what does ANC mean?")).toBe("what does ANC mean?");
  expect(getBartaGreeting("heyyy Barta what does ANC mean?", "en")).toBeUndefined();
  expect(getBartaGreeting("I am getting worried about the meaning of ANC", "en")).toBeUndefined();
  expect(getBartaGreeting("হ্যালো, কীভাবে নবজাতকের যত্ন নেব?", "bn")).toBeUndefined();
  expect(getBartaGreeting("hi i am bleeding", "en")).toBeUndefined();
});
