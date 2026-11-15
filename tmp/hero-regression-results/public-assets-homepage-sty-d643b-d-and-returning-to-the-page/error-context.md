# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-assets.spec.ts >> homepage styles survive reload and returning to the page
- Location: tests\public-assets.spec.ts:7:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator: locator('.story-product-label')
Expected: "flex"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveCSS" locator('.story-product-label') with timeout 5000ms
  - waiting for locator('.story-product-label')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "PROHOR home":
    - /url: /
    - text: PROHOR প্রহর
  - navigation "Primary":
    - link "Why PROHOR":
      - /url: "#why-prohor"
    - link "How it works":
      - /url: "#how-it-works"
    - link "Features":
      - /url: "#features"
    - link "Responsible AI":
      - /url: "#responsible-ai"
  - group "Homepage language":
    - button "Read this homepage in Bangla": বাং
    - button "Read this homepage in English" [pressed]: EN
  - button "Adjust how you use PROHOR"
  - button "Sign in"
- main:
  - region "Maternal care, designed around every mother.":
    - paragraph: Connected care. A more human experience.
    - heading "Maternal care, designed around every mother." [level=1]:
      - text: Maternal care, designed around
      - emphasis: every mother.
    - paragraph: আপনার যত্ন, আপনার মতো।
    - paragraph: "PROHOR is one connected place for mothers in Bangladesh: keep mother and baby records, get Bangla answers with sources, understand your reports, notice your well-being, find care and reach real people, in the way that works for you."
    - link "Explore PROHOR":
      - /url: "#features"
    - link "See how it works":
      - /url: "#how-it-works"
    - list "What you can do with PROHOR":
      - listitem: Mother & baby records
      - listitem: Bangla answers with sources
      - listitem: Reports explained
      - listitem: Well-being
      - listitem: Human support
    - paragraph: Explore without an account.
    - img "Illustration of the PROHOR app with sample answers, records and sharing controls"
    - button "Pause animation"
  - region "The PROHOR product at a glance":
    - strong: "8"
    - heading "connected modules" [level=2]
    - paragraph: Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, Bondhon
    - strong: "24"
    - heading "planned capabilities" [level=2]
    - link "One roadmap, honest status on each":
      - /url: "#roadmap"
    - strong: "0"
    - heading "disability categories to choose" [level=2]
    - paragraph: Same care for every mother; preferences, not labels
    - strong: "2"
    - heading "records, 1 journey" [level=2]
    - paragraph: Mother and baby records stay separate on one timeline
  - region "Motherhood is a journey. Care shouldn’t feel like a puzzle.":
    - paragraph: Why PROHOR
    - heading "Motherhood is a journey. Care shouldn’t feel like a puzzle." [level=2]:
      - text: Motherhood is a journey.
      - emphasis: Care shouldn’t feel like a puzzle.
    - list:
      - listitem:
        - heading "Less scattered. More connected." [level=3]
        - paragraph: Keep records, questions and visits in the same story.
      - listitem:
        - heading "Fewer barriers. More ways in." [level=3]
        - paragraph: Language, small text and voice-only tasks shouldn’t stand between you and care.
      - listitem:
        - heading "Beyond birth. Still about you." [level=3]
        - paragraph: A baby’s beginning is another chapter in the mother’s care.
    - paragraph:
      - text: About 4,000 maternal deaths in Bangladesh in 2023; the maternal mortality ratio was 79% lower than in 2000.
      - link "UN estimates · WHO, UNICEF, UNFPA · 2025 (opens in a new tab)":
        - /url: https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef
    - paragraph:
      - text: 1 in 3 women who died of maternal causes had sought care at three or more places.
      - link "BMMS 2016 · Journal of Global Health, 2023 (opens in a new tab)":
        - /url: https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/
    - img "Image placeholder. The supplied mother photograph is missing."
    - text: A report here. A visit there. Let the care hold the pieces.
  - region "One care. Your way.":
    - paragraph: Designed around difference
    - heading "One care. Your way." [level=2]:
      - text: One care.
      - emphasis: Your way.
    - paragraph: The same visit question, in three presentations. Try a question. Your words stay with you as you explore.
    - region "Visit question presentations":
      - group "Touch & text":
        - text: Touch & text Sample data PROHOR
        - region "Touch & text screen":
          - paragraph: Your next visit
          - heading "A question, in your words." [level=3]
          - text: What would you like to ask?
          - textbox "What would you like to ask?": আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
          - paragraph: How can I prepare for my next visit?
          - button "Review my question"
          - paragraph: Your words. Your choice.
      - group "Large text + high contrast":
        - text: Large text + high contrast Sample data PROHOR
        - region "Large text + high contrast screen":
          - heading "A question, in your words." [level=3]
          - text: What would you like to ask?
          - textbox "What would you like to ask?": আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
          - paragraph: How can I prepare for my next visit?
          - button "Review my question"
      - group "Picture-and-text":
        - text: Picture-and-text Sample data PROHOR
        - region "Picture-and-text screen":
          - paragraph: Your next visit
          - heading "A question, in your words." [level=3]
          - text: What would you like to ask?
          - group "Picture-and-text sample phrases":
            - button "About my visit"
            - button "About my records"
          - textbox "What would you like to ask?": আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
          - paragraph: How can I prepare for my next visit?
          - button "Review my question"
          - paragraph: Your words. Your choice.
    - paragraph: Change the presentation. Keep your words, your choices and your place.
    - button "Adjust how you use PROHOR"
    - status
  - region "Not just a tracker. A care companion.":
    - paragraph: Care that makes room for life
    - heading "Not just a tracker. A care companion." [level=2]:
      - text: Not just a tracker.
      - emphasis: A care companion.
    - paragraph: Understanding, access, safety and human connection. Thoughtful tools for the moments between appointments, too.
    - article:
      - text: Barta বার্তা
      - heading "A question deserves clarity." [level=3]
      - paragraph: Bangla explanations, with sources to open and read.
      - img "Sample data. A Bangla question and educational answer, WHO and CDC sources, and an explicit insufficient-evidence fallback. This is a product preview, not a live AI answer.": Sample data
    - article:
      - text: Shonket সংকেত
      - heading "Help beyond the chatbot." [level=3]
      - paragraph: Reviewed warning signs. A direct path to help.
      - img "Sample data. Reviewed-warning-signs layout with three CDC examples, a sample Call 999 button, and request tracking. Only Submitted is complete; Delivered, Acknowledged and Responded are pending. No care request has been sent.": Sample data
    - article:
      - text: Adapt অ্যাডাপ্ট
      - heading "Your preferences belong here." [level=3]
      - paragraph: Your text, theme and contrast. The same care.
      - group "Try Adapt locally":
        - text: Sample data Text size
        - group "Sample text size":
          - button "A sample text size" [pressed]: A
          - button "A+ sample text size": A+
          - button "A++ sample text size": A++
        - paragraph: আপনার যত্ন, আপনার মতো।
        - paragraph: Your care. Your way.
        - text: Theme
        - group "Sample theme":
          - button "Quiet Garden" [pressed]
          - button "Original Rose": R
          - button "Morning Mist": M
        - text: Higher contrast
        - switch "Higher contrast"
        - group "Choose a sample phrase":
          - button "I need help"
          - button "I have a question"
        - button "Read aloud"
        - text: Try it here only
        - status: Page settings stay as you chose them.
    - article:
      - text: Bondhon বন্ধন
      - heading "Connection, with permission." [level=3]
      - paragraph: Choose the people and records before sharing.
      - img "Sample data. Mother to chosen supporter to provider. Visit questions selected, reports unselected. Diary and AI conversations stay private. A synthetic access log and Revoke access button illustrate consent; no records are shared.": Sample data
  - region "One app for the whole journey.":
    - paragraph: Eight modules, one shared foundation
    - heading "One app for the whole journey." [level=2]:
      - text: One app for
      - emphasis: the whole journey.
    - paragraph: From a first question to the chapters after birth. Your preferences and permissions stay part of the same experience.
    - strong: One web app. Works in your browser on any phone.
    - paragraph: Add to your home screen from your browser’s menu.
    - navigation "The eight PROHOR modules":
      - link "Adapt অ্যাডাপ্ট":
        - /url: "#module-adapt"
        - strong: Adapt
        - text: অ্যাডাপ্ট
      - link "Barta বার্তা":
        - /url: "#module-barta"
        - strong: Barta
        - text: বার্তা
      - link "Shonket সংকেত":
        - /url: "#module-shonket"
        - strong: Shonket
        - text: সংকেত
      - link "Jibonrekha জীবনরেখা":
        - /url: "#module-jibonrekha"
        - strong: Jibonrekha
        - text: জীবনরেখা
      - link "Bujhi বুঝি":
        - /url: "#module-bujhi"
        - strong: Bujhi
        - text: বুঝি
      - link "Shusthota সুস্থতা":
        - /url: "#module-shusthota"
        - strong: Shusthota
        - text: সুস্থতা
      - link "Poth পথ":
        - /url: "#module-poth"
        - strong: Poth
        - text: পথ
      - link "Bondhon বন্ধন":
        - /url: "#module-bondhon"
        - strong: Bondhon
        - text: বন্ধন
    - text: Request queue Consented records Preferred contact Audit trail
    - region "One app for the whole journey.":
      - article:
        - group "Jibonrekha":
          - text: Jibonrekha Sample data PROHOR
          - region "Jibonrekha screen":
            - paragraph: Jibonrekha · জীবনরেখা
            - heading "Your story stays together." [level=3]
            - text: Mother
            - strong: Week 24 · Nila’s journey
            - paragraph: Questions for the next visit
            - text: Baby
            - strong: A story of their own
            - paragraph: A separate record, from the start
            - text: Two records. One connected journey.
            - strong: Visit notes
            - text: Recorded by you
        - paragraph:
          - emphasis: Two stories, held together.
        - paragraph: দুটি গল্প, একসঙ্গে।
      - article:
        - group "Bujhi":
          - text: Bujhi Sample data PROHOR
          - region "Bujhi screen":
            - paragraph: Bujhi · বুঝি
            - heading "Read. Review. Understand." [level=3]
            - strong: A report to understand
            - text: visit-report.pdf Document type
            - strong: Visit report
            - text: Record belongs to
            - strong: Mother · review first
            - list:
              - listitem: Upload
              - listitem: Review
              - listitem: Confirm
        - paragraph:
          - emphasis: A little more understanding.
        - paragraph: আরও একটু বোঝাপড়া।
      - article:
        - group "Shusthota":
          - text: Shusthota Sample data PROHOR
          - region "Shusthota screen":
            - paragraph: Shusthota · সুস্থতা
            - heading "How are you, today?" [level=3]
            - group "A moment for yourself":
              - text: A moment for yourself
              - radio "Quiet" [checked]
              - text: Quiet ✓
              - radio "Tired"
              - text: Tired
              - radio "Unsure"
              - text: Unsure
            - heading "A little room to rest." [level=4]
            - paragraph: Your pace. No score to keep.
            - paragraph: Your diary is yours.
        - paragraph:
          - emphasis: Room for the person, too.
        - paragraph: মানুষটির জন্যও জায়গা।
      - article:
        - group "Poth":
          - text: Poth Sample data PROHOR
          - region "Poth screen":
            - paragraph: Poth · পথ
            - heading "A next step, closer." [level=3]
            - text: Find a facility
            - textbox "Find a facility":
              - /placeholder: Search these examples
            - link "Dhaka Medical College Hospital Shahbag, Dhaka Opens DGHS in a new tab":
              - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile
              - strong: Dhaka Medical College Hospital
              - text: Shahbag, Dhaka Opens DGHS in a new tab
            - link "Sir Salimullah Medical College Mitford Hospital Kotwali, Dhaka Opens DGHS in a new tab":
              - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile
              - strong: Sir Salimullah Medical College Mitford Hospital
              - text: Kotwali, Dhaka Opens DGHS in a new tab
            - paragraph: "Source: DGHS facility registry"
        - paragraph:
          - emphasis: A clearer way forward.
        - paragraph: সামনের পথ আরও পরিষ্কার।
  - region "How one question becomes safe, shared support.":
    - paragraph: A thoughtful path through
    - text: Sample data
    - heading "How one question becomes safe, shared support." [level=2]:
      - text: How one question becomes
      - emphasis: safe, shared support.
    - paragraph: The question starts with her. Evidence makes its limits clear. Permission shapes what reaches another person.
    - list:
      - listitem:
        - text: Step 1
        - heading "She asks" [level=3]
        - paragraph: Her words are the starting point.
        - img "Sample illustration for step 1. She asks"
      - listitem:
        - text: Step 2
        - heading "Evidence is found" [level=3]
        - paragraph: Sources, with their limits in view.
        - img "Sample illustration for step 2. Evidence is found"
      - listitem:
        - text: Step 3
        - heading "She chooses what to share" [level=3]
        - paragraph: Her review. Her recipient. Her say.
        - img "Sample illustration for step 3. She chooses what to share"
      - listitem:
        - text: Step 4
        - heading "A person follows up" [level=3]
        - paragraph: A clear handoff, with a human reply.
        - img "Sample illustration for step 4. A synthetic request from Nila is acknowledged. This is not a real provider response."
  - region "For the mother. For the people beside her.":
    - paragraph: Two windows, the same care story
    - heading "For the mother. For the people beside her." [level=2]:
      - text: For the mother.
      - emphasis: For the people beside her.
    - paragraph: One shared foundation, with a different view for the person asking and the people preparing to support her.
    - article:
      - text: For mothers
      - heading "A little more understood." [level=3]
      - paragraph: Your questions, records and preferences, with you at the centre.
      - list:
        - listitem: Explore in Bangla or English
        - listitem: Keep mother and baby records distinct
        - listitem: Choose the people you bring in
      - text: PROHOR / My care Sample data
      - link "PROHOR home":
        - /url: /
        - text: PROHOR প্রহর
      - heading "আজ একটু নিজের খোঁজ নিন।" [level=3]
      - paragraph: Your care, in one place.
      - link "My care story":
        - /url: "#module-jibonrekha"
      - link "My questions":
        - /url: "#module-barta"
      - link "My preferences":
        - /url: "#module-adapt"
      - text: Motherhood is part of your story. You are at the centre.
      - link "Explore your experience":
        - /url: "#your-way"
    - article:
      - text: For care providers
      - heading "A little more context." [level=3]
      - paragraph: The story a mother chooses to share, with its source and her permission.
      - list:
        - listitem: See the question in her own words
        - listitem: Keep source and permission together
        - listitem: Prepare for a human conversation
      - text: PROHOR / Care workspace Sample data Mother-led context
      - heading "Prepare to listen." [level=3]
      - text: Questions Chosen records Permissions
      - strong: Nila’s visit question
      - paragraph: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
      - list:
        - listitem: Context from selected records
        - listitem: Visible source for each note
        - listitem: Access defined by the mother
      - link "Explore the care connection":
        - /url: "#module-bondhon"
  - region "AI helps explain. People provide care.":
    - paragraph: Thoughtful technology
    - heading "AI helps explain. People provide care." [level=2]:
      - text: AI helps explain.
      - emphasis: People provide care.
    - paragraph: Useful technology starts with clear boundaries. Keep evidence, human oversight and your permission in the picture.
    - article:
      - heading "Evidence you can open." [level=3]
      - paragraph: Keep sources beside explanations. Say when the information does not cover the question.
      - text: Evidence Human review No diagnosis
    - article:
      - heading "People keep the judgment." [level=3]
      - paragraph: AI helps explain information. Clinical decisions and real care belong with qualified people.
      - text: Evidence Human review No diagnosis
    - article:
      - heading "Permission stays with you." [level=3]
      - paragraph: Choose the person, purpose and records. Diary and AI conversations stay outside default sharing.
      - text: Evidence Human review No diagnosis
  - region "Built with care. By people who care.":
    - paragraph: The people behind PROHOR
    - heading "Built with care. By people who care." [level=2]:
      - text: Built with care.
      - emphasis: By people who care.
    - paragraph: A shared effort across inclusive design, technology and the everyday details of maternal care.
    - article:
      - heading "Omor" [level=3]
      - paragraph: Project lead and platform
    - article:
      - heading "Iftee" [level=3]
      - paragraph: Inclusive UI and accessibility
    - article:
      - heading "Ifty" [level=3]
      - paragraph: AI and retrieval
    - article:
      - heading "Apubo" [level=3]
      - paragraph: Mother and baby records
    - article:
      - heading "Samin" [level=3]
      - paragraph: Wellness and care navigation
  - region "What’s taking shape.":
    - paragraph: An ambitious vision. An honest view.
    - heading "What’s taking shape." [level=2]:
      - emphasis: What’s taking shape.
    - paragraph: Local appearance controls are connected. Explore the full care vision and where each capability stands.
    - group "Filter capabilities by status":
      - button "All 24" [pressed]
      - button "Working 0" [disabled]
      - button "Limited 1"
      - button "Simulated 0" [disabled]
      - button "Future 23"
    - paragraph: Includes Working or Limited capabilities
    - tablist "Roadmap modules":
      - tab "Adapt 1" [selected]
      - tab "Barta 3"
      - tab "Shonket 2"
      - tab "Jibonrekha 4"
      - tab "Bujhi 1"
      - tab "Shusthota 2"
      - tab "Poth 4"
      - tab "Bondhon 7"
    - tabpanel "Adapt 1":
      - strong: Adapt
      - text: 1 / 1
      - list:
        - listitem:
          - text: "01"
          - heading "Universal Accessibility Profile" [level=3]
          - paragraph: Local appearance and reading preferences.
          - text: Limited
    - status: "Adapt: 1 matching capabilities."
  - region "One care journey. Every mother’s way.":
    - paragraph: Your care. Your way.
    - heading "One care journey. Every mother’s way." [level=2]:
      - text: One care journey.
      - emphasis: Every mother’s way.
    - paragraph: A more connected future starts by making room for every mother.
    - button "Make PROHOR yours"
    - link "Explore the journey":
      - /url: "#features"
    - paragraph: An educational product prototype; clinical services and provider delivery are not connected.
- contentinfo:
  - link "PROHOR home":
    - /url: /
    - text: PROHOR প্রহর
  - paragraph: Your Care. Your Way.
  - paragraph: আপনার যত্ন, আপনার মতো।
  - button "Adjust how you use PROHOR"
  - navigation "Modules":
    - heading "Modules" [level=2]
    - list:
      - listitem:
        - link "Adapt":
          - /url: "#module-adapt"
      - listitem:
        - link "Barta":
          - /url: "#module-barta"
      - listitem:
        - link "Shonket":
          - /url: "#module-shonket"
      - listitem:
        - link "Jibonrekha":
          - /url: "#module-jibonrekha"
      - listitem:
        - link "Bujhi":
          - /url: "#module-bujhi"
      - listitem:
        - link "Shusthota":
          - /url: "#module-shusthota"
      - listitem:
        - link "Poth":
          - /url: "#module-poth"
      - listitem:
        - link "Bondhon":
          - /url: "#module-bondhon"
  - navigation "Explore":
    - heading "Explore" [level=2]
    - list:
      - listitem:
        - link "Why PROHOR":
          - /url: "#why-prohor"
      - listitem:
        - link "How it works":
          - /url: "#how-it-works"
      - listitem:
        - link "Responsible AI":
          - /url: "#responsible-ai"
      - listitem:
        - link "Roadmap":
          - /url: "#roadmap"
  - navigation "Get started":
    - heading "Get started" [level=2]
    - list:
      - listitem:
        - link "Explore PROHOR":
          - /url: "#features"
      - listitem:
        - button "Sign in"
  - text: © 2026 PROHOR
  - paragraph: Prototype with sample data. Not a medical or emergency service. In an emergency, call 999.
  - button "Switch homepage language to Bangla": বাংলা EN
- alert
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import { createServer } from "node:http";
  3   | import { readFile } from "node:fs/promises";
  4   | import type { AddressInfo } from "node:net";
  5   | import { homepageAssetRecovery } from "../src/components/marketing/asset-recovery";
  6   | 
  7   | test("homepage styles survive reload and returning to the page", async ({ page }) => {
  8   |   const failures: string[] = [];
  9   |   page.on("pageerror", error => failures.push(error.message));
  10  |   page.on("console", message => {
  11  |     if (message.type() === "error" && /hydration|hydrating/i.test(message.text())) failures.push(message.text());
  12  |   });
  13  |   page.on("response", response => {
  14  |     if (response.url().includes("/_next/") && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  15  |   });
  16  |   await page.setViewportSize({ width: 1440, height: 1000 });
  17  | 
  18  |   async function checkStyles() {
  19  |     await expect(page.locator(".story-hero-grid")).toHaveCSS("display", "grid");
> 20  |     await expect(page.locator(".story-product-label")).toHaveCSS("display", "flex");
      |                                                        ^ Error: expect(locator).toHaveCSS(expected) failed
  21  |     await expect(page.locator(".story-floating-answer")).toHaveCSS("border-radius", "24px");
  22  |     await expect(page.locator(".story-hero h1")).toHaveCount(1);
  23  |     const marks = await page.locator('svg[viewBox="0 0 48 48"]').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  24  |     expect(marks.length).toBeGreaterThan(1);
  25  |     expect(marks.every(width => width > 0 && width <= 64)).toBe(true);
  26  |   }
  27  | 
  28  |   await page.goto("/");
  29  |   await checkStyles();
  30  |   await page.reload();
  31  |   await checkStyles();
  32  |   await page.goto("/about");
  33  |   await page.goBack();
  34  |   await checkStyles();
  35  |   expect(failures).toEqual([]);
  36  | });
  37  | 
  38  | test("an old worker cannot keep serving stale development CSS after upgrade", async ({ browser }) => {
  39  |   const currentWorker = await readFile("public/sw.js", "utf8");
  40  |   // Reproduce the previous cache-first policy with an intentionally stale bundle.
  41  |   const legacyWorker = `
  42  |     const CACHE = 'prohor-public-shell-v1';
  43  |     self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
  44  |     self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
  45  |     self.addEventListener('fetch', event => {
  46  |       if (new URL(event.request.url).pathname.startsWith('/_next/static/')) {
  47  |         event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
  48  |       }
  49  |     });
  50  |   `;
  51  |   let upgraded = false;
  52  |   let padding = 32;
  53  |   const server = createServer((request, response) => {
  54  |     response.setHeader("Cache-Control", "no-store");
  55  |     if (request.url === "/sw.js") {
  56  |       response.setHeader("Content-Type", "application/javascript");
  57  |       response.end(upgraded ? currentWorker : legacyWorker);
  58  |     } else if (request.url === "/_next/static/development.css") {
  59  |       response.setHeader("Content-Type", "text/css");
  60  |       response.end(`main { padding: ${padding}px; }`);
  61  |     } else if (request.url === "/") {
  62  |       response.setHeader("Content-Type", "text/html");
  63  |       response.end(`<!doctype html><html lang="en"><head><title>Public asset regression</title><link rel="stylesheet" href="/_next/static/development.css"></head><body><main>Public asset fixture</main>${upgraded ? `<script>${homepageAssetRecovery}</script>` : ""}</body></html>`);
  64  |     } else {
  65  |       response.end("Public offline fixture");
  66  |     }
  67  |   });
  68  |   await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  69  |   const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  70  |   const context = await browser.newContext();
  71  |   try {
  72  |     const page = await context.newPage();
  73  |     await page.goto(origin);
  74  |     await page.evaluate(async () => {
  75  |       await navigator.serviceWorker.register("/sw.js");
  76  |       await navigator.serviceWorker.ready;
  77  |     });
  78  |     await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  79  |     await page.evaluate(async () => {
  80  |       const stale = await caches.open("prohor-public-shell-v1");
  81  |       await stale.put("/_next/static/development.css", new Response("main { padding: 0px; }", { headers: { "Content-Type": "text/css" } }));
  82  |       const unrelated = await caches.open("unrelated-public-fixture");
  83  |       await unrelated.put("/unrelated-marker", new Response("keep"));
  84  |     });
  85  |     await page.reload();
  86  |     await expect(page.locator("main")).toHaveCSS("padding-top", "0px");
  87  | 
  88  |     upgraded = true;
  89  |     await page.reload();
  90  |     await expect(page.locator("main")).toHaveCSS("padding-top", "32px", { timeout: 15000 });
  91  |     await expect.poll(() => page.evaluate(() => caches.keys())).not.toContain("prohor-public-shell-v1");
  92  |     expect(await page.evaluate(() => caches.keys())).toContain("unrelated-public-fixture");
  93  | 
  94  |     // Reusing the same bundle URL must now load its new response every time.
  95  |     padding = 64;
  96  |     await page.reload();
  97  |     await expect(page.locator("main")).toHaveCSS("padding-top", "64px");
  98  |     expect(await page.evaluate(async () => (await caches.match("/_next/static/development.css")) !== undefined)).toBe(false);
  99  |   } finally {
  100 |     await context.close();
  101 |     server.closeAllConnections();
  102 |     await new Promise<void>(resolve => server.close(() => resolve()));
  103 |   }
  104 | });
  105 | 
```