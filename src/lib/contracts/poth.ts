import { z } from "zod";
import { dateSchema, idSchema, nonEmptyText, timestampSchema } from "./common";

export const verificationSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("not_verified"), lastReviewedAt: timestampSchema.nullable() }),
  z.strictObject({
    status: z.literal("verified"), sourceUrl: z.url({ protocol: /^https$/ }),
    verifiedAt: timestampSchema, verifiedByUserId: idSchema,
  }),
]);
export const facilitySchema = z.strictObject({
  id: idSchema, name: nonEmptyText(300), district: nonEmptyText(100), address: nonEmptyText(500),
  sourceUrl: z.url({ protocol: /^https$/ }), lastReviewedAt: timestampSchema,
  services: z.array(nonEmptyText(200)),
  accessibility: z.array(z.strictObject({
    feature: nonEmptyText(200), availability: z.enum(["available", "unavailable", "unknown"]),
    verification: verificationSchema,
  }).refine(value => value.availability !== "unknown" || value.verification.status === "not_verified", {
    message: "Unknown availability cannot be verified.",
  })),
  contacts: z.array(z.strictObject({
    method: z.enum(["phone", "sms", "email", "website"]), value: nonEmptyText(500),
    verification: verificationSchema,
  })),
  bookingIntegration: z.literal("not_integrated"),
});
export const saveAppointmentRequestSchema = z.strictObject({
  facilityId: idSchema.nullable(), facilityLabel: nonEmptyText(300),
  visitDate: dateSchema, visitTimeNote: nonEmptyText(100).nullable(),
  source: z.literal("self_recorded"),
});
export type Facility = z.infer<typeof facilitySchema>;
