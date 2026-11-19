import { expect, test } from "@playwright/test";
import {
  activityPreferencesRequestSchema, createHabitRequestSchema, habitEventRequestSchema,
  hydrationGetQuerySchema, hydrationRequestSchema,
} from "../../src/lib/contracts/shusthota-p1";

const id = "a6000000-0000-4000-8000-000000000011";
const timestamp = "2026-11-20T08:30:00.000Z";

test("hydration schema bounds amounts, rejects owner injection and limits query keys", () => {
  expect(hydrationRequestSchema.safeParse({ amountMl: 250, occurredAt: timestamp, retryKey: id }).success).toBe(true);
  expect(hydrationRequestSchema.safeParse({ amountMl: 0, occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(hydrationRequestSchema.safeParse({ amountMl: 5001, occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(hydrationRequestSchema.safeParse({ amountMl: 250, occurredAt: timestamp, retryKey: id, ownerUserId: id }).success).toBe(false);
  expect(hydrationGetQuerySchema.safeParse({ scope: "history" }).success).toBe(true);
  expect(hydrationGetQuerySchema.safeParse({ scope: "all" }).success).toBe(false);
  expect(hydrationGetQuerySchema.safeParse({ page: "2" }).success).toBe(false);
});

test("habits require a user-authored label and allowlisted symbol", () => {
  expect(createHabitRequestSchema.safeParse({ label: "My routine", icon: "care", retryKey: id }).success).toBe(true);
  expect(createHabitRequestSchema.safeParse({ label: " ", icon: "care", retryKey: id }).success).toBe(false);
  expect(createHabitRequestSchema.safeParse({ label: "My routine", icon: "clinical-plan", retryKey: id }).success).toBe(false);
});

test("activity preferences are optional, unique and non-inferential; habit undo references an event", () => {
  expect(activityPreferencesRequestSchema.safeParse({ preferences: [], occurredAt: timestamp, retryKey: id }).success).toBe(true);
  expect(activityPreferencesRequestSchema.safeParse({ preferences: ["walking", "walking"], occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(activityPreferencesRequestSchema.safeParse({ preferences: ["none", "resting"], occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(habitEventRequestSchema.safeParse({ eventType: "completion_undone", occurredAt: timestamp, retryKey: id, relatedEventId: id }).success).toBe(true);
  expect(habitEventRequestSchema.safeParse({ eventType: "completion_undone", occurredAt: timestamp, retryKey: id }).success).toBe(false);
});
