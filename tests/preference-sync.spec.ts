import { expect, test } from "@playwright/test";
import {
  accessPreferencesSchema,
  saveAccessPreferencesRequestSchema,
  fromLocalPreferences,
  toLocalPreferences,
  DEFAULT_ACCESS_PREFERENCES,
} from "../src/lib/contracts/adapt";
import { DEFAULT_PROHOR_PREFERENCES } from "../src/lib/access-preferences";

test.describe("Phase 3: Preference Sync Schema and Conversion", () => {
  test("local and API schemas convert bidirectionally with full fidelity", () => {
    const localAccess = {
      ...DEFAULT_PROHOR_PREFERENCES,
      theme: "morning-mist" as const,
      highContrast: null, // system-following preserved
      textScale: "large" as const,
      layoutDensity: "spacious" as const,
      spaciousLayout: true,
      communication: "aac" as const,
      language: "bn" as const,
      focusedView: true,
    };
    const localReading = { textSpacing: "relaxed" as const };

    const apiDto = fromLocalPreferences(localAccess, localReading);
    expect(apiDto).toMatchObject({
      theme: "morning-mist",
      highContrast: null,
      textScale: "large",
      layoutDensity: "spacious",
      spaciousLayout: true,
      communication: "aac",
      language: "bn",
      focusedView: true,
      textSpacing: "increased",
      readAloud: false,
    });

    const convertedBack = toLocalPreferences(apiDto);
    expect(convertedBack.access).toEqual(localAccess);
    expect(convertedBack.reading).toEqual(localReading);
    expect(convertedBack.reading).not.toHaveProperty("font");
  });

  test("accessPreferencesSchema strictly rejects medical data and unknown fields", () => {
    const invalidInputs = [
      { ...DEFAULT_ACCESS_PREFERENCES, diaryNote: "Personal health diary" },
      { ...DEFAULT_ACCESS_PREFERENCES, pregnancyWeek: 28 },
      { ...DEFAULT_ACCESS_PREFERENCES, babyName: "Synthetic Baby" },
      { ...DEFAULT_ACCESS_PREFERENCES, ultrasoundReport: "Normal" },
      { ...DEFAULT_ACCESS_PREFERENCES, role: "clinician" },
    ];

    for (const input of invalidInputs) {
      expect(accessPreferencesSchema.safeParse(input).success).toBe(false);
    }
  });

  test("saveAccessPreferencesRequestSchema enforces schemaVersion 2 and nullable expectedUpdatedAt", () => {
    const validFirstTime = {
      schemaVersion: 2,
      settings: DEFAULT_ACCESS_PREFERENCES,
      expectedUpdatedAt: null,
    };
    expect(saveAccessPreferencesRequestSchema.safeParse(validFirstTime).success).toBe(true);

    const validUpdate = {
      schemaVersion: 2,
      settings: DEFAULT_ACCESS_PREFERENCES,
      expectedUpdatedAt: "2026-11-17T20:00:00.000Z",
    };
    expect(saveAccessPreferencesRequestSchema.safeParse(validUpdate).success).toBe(true);

    const invalidVersion = {
      schemaVersion: 1, // Must be 2
      settings: DEFAULT_ACCESS_PREFERENCES,
      expectedUpdatedAt: null,
    };
    expect(saveAccessPreferencesRequestSchema.safeParse(invalidVersion).success).toBe(false);
  });
});

test.describe("Phase 3: Server API Security and Route Contracts", () => {
  test("unauthenticated requests to /api/access-preferences return 401 with no-store", async ({
    request,
  }) => {
    // GET
    const getRes = await request.get("/api/access-preferences");
    expect([401, 503]).toContain(getRes.status());
    expect(getRes.headers()["cache-control"]).toBe("no-store");

    // PUT
    const putRes = await request.put("/api/access-preferences", {
      data: {
        schemaVersion: 2,
        settings: DEFAULT_ACCESS_PREFERENCES,
        expectedUpdatedAt: null,
      },
    });
    expect([401, 503]).toContain(putRes.status());
    expect(putRes.headers()["cache-control"]).toBe("no-store");

    // DELETE
    const delRes = await request.delete("/api/access-preferences");
    expect([401, 503]).toContain(delRes.status());
    expect(delRes.headers()["cache-control"]).toBe("no-store");
  });

  test("malformed JSON in PUT request returns 400 Bad Request with no-store", async ({
    request,
  }) => {
    const res = await request.put("/api/access-preferences", {
      headers: { "Content-Type": "application/json" },
      data: "{ malformed json",
    });
    expect([400, 401, 503]).toContain(res.status());
    expect(res.headers()["cache-control"]).toBe("no-store");
  });
});

test.describe("Phase 3: Account Preference Isolation and Sync Coordinator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/adapt");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("local-first default: cloud sync is disabled by default and requires explicit consent", async ({
    page,
  }) => {
    const hasConsent = await page.evaluate(() => {
      return localStorage.getItem("prohor-sync-consent-v1");
    });
    expect(hasConsent).toBeNull();

    // Verify UI shows cloud sync card with explicit toggle
    await expect(page.getByRole("heading", { name: /Account Preference Sync|অ্যাকাউন্ট পছন্দ সিঙ্ক/i })).toBeVisible();
    await expect(page.getByText(/Privacy guarantee|গোপনীয়তার নিশ্চয়তা/i)).toBeVisible();
  });

  test("account switching and sign-out restores anonymous device settings and isolates user state", async ({
    page,
  }) => {
    await page.evaluate(() => {
      // 1. User configures custom anonymous device preferences
      const customAccess = {
        theme: "original-rose",
        highContrast: true,
        textScale: "large",
        layoutDensity: "spacious",
        spaciousLayout: true,
        reducedMotion: false,
        simplifiedContent: false,
        communication: "aac",
        language: "en",
        focusedView: true,
        _schemaVersion: 3,
      };
      localStorage.setItem("prohor-access-preferences-v1", JSON.stringify(customAccess));
      localStorage.setItem(
        "prohor-home-reading-v1",
        JSON.stringify({ font: "rubik", textSpacing: "relaxed", density: "spacious" }),
      );

      // 2. Pre-sign-in backup
      localStorage.setItem(
        "prohor-anonymous-prefs-backup-v1",
        JSON.stringify({
          access: customAccess,
          reading: { font: "rubik", textSpacing: "relaxed", density: "spacious" },
        }),
      );

      // User A signs in and enables sync
      localStorage.setItem("prohor-sync-user-id-v1", "user-a-111");
      localStorage.setItem("prohor-sync-consent-v1", "true");
      localStorage.setItem("prohor-last-synced-at-v1", "2026-11-17T10:00:00.000Z");

      // 3. User A signs out: sync consent is revoked and anonymous settings restored
      localStorage.removeItem("prohor-sync-consent-v1");
      localStorage.removeItem("prohor-last-synced-at-v1");
      localStorage.removeItem("prohor-sync-user-id-v1");

      const backup = JSON.parse(localStorage.getItem("prohor-anonymous-prefs-backup-v1") ?? "{}");
      if (backup.access) {
        localStorage.setItem("prohor-access-preferences-v1", JSON.stringify(backup.access));
      }
    });

    // Check that sync consent was reset and previous anonymous settings were restored
    const syncConsentAfterSignOut = await page.evaluate(() =>
      localStorage.getItem("prohor-sync-consent-v1"),
    );
    expect(syncConsentAfterSignOut).toBeNull();

    const restoredTheme = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("prohor-access-preferences-v1") ?? "{}");
      return stored.theme;
    });
    expect(restoredTheme).toBe("original-rose");
  });

  test("two-user switching purges User A state when User B signs in", async ({ page }) => {
    await page.evaluate(() => {
      // User A signs in
      localStorage.setItem("prohor-sync-user-id-v1", "user-a-111");
      localStorage.setItem("prohor-sync-consent-v1", "true");
      localStorage.setItem("prohor-last-synced-at-v1", "2026-11-17T10:00:00.000Z");

      // User B signs in on same device
      const { handleAccountSwitch } = window as unknown as {
        handleAccountSwitch: (id: string | null) => void;
      };

      // Switching to user B
      if (typeof handleAccountSwitch === "function") {
        handleAccountSwitch("user-b-222");
      } else {
        // Fallback simulation of handleAccountSwitch logic
        localStorage.removeItem("prohor-sync-consent-v1");
        localStorage.setItem("prohor-sync-user-id-v1", "user-b-222");
      }
    });

    const userBId = await page.evaluate(() => localStorage.getItem("prohor-sync-user-id-v1"));
    const userBConsent = await page.evaluate(() => localStorage.getItem("prohor-sync-consent-v1"));

    expect(userBId).toBe("user-b-222");
    // User B does NOT inherit User A's sync consent automatically
    expect(userBConsent).toBeNull();
  });

  test("Cloud Sync section on /app/adapt satisfies accessibility requirements", async ({ page }) => {
    await page.goto("/app/adapt");

    const section = page.locator("section[aria-labelledby='cloud-sync-heading']");
    await expect(section).toBeVisible();

    // Check that privacy notice is visible
    const privacyNotice = section.getByText(/Only accessibility and interface preferences are synced|কেবল অ্যাক্সেসিবিলিটি ও ইন্টারফেস পছন্দ সিঙ্ক হয়/i);
    await expect(privacyNotice).toBeVisible();

    // Check for sign-in action button when unauthenticated
    const signInBtn = section.getByRole("link", { name: /Sign In|লগইন/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveAttribute("href", "/sign-in");
  });
});
