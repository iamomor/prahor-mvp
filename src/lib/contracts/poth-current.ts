import { z } from "zod";
import { facilitySchema } from "./poth";

export const directoryQuerySchema = z.object({
  q: z.string().trim().max(120).default(""),
  district: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(20.5).max(26.8),
  lon: z.coerce.number().min(88).max(92.8),
  radius: z.coerce.number().refine(n => [1000, 2000, 3000, 5000, 10000, 15000, 20000].includes(n)).default(5000),
});
export const pothErrorSchema = z.strictObject({ error: z.string().min(1) });
export const directoryResponseSchema = z.strictObject({
  facilities: z.array(facilitySchema), sourceType: z.literal("reviewed-import"), bookingAvailable: z.literal(false),
});
export const nearbyResponseSchema = z.strictObject({
  places: z.array(z.strictObject({
    id: z.string(), name: z.string(), kind: z.enum(["hospital", "clinic", "maternity", "midwife", "doctor", "pharmacy"]),
    lat: z.number().finite(), lon: z.number().finite(), distanceKm: z.number().nonnegative(), osmUrl: z.url(),
    address: z.string().nullable(), phone: z.string().nullable(), website: z.url().nullable(), hours: z.string().nullable(),
    emergencyTagged: z.boolean(), locationPrecision: z.enum(["mapped-point", "feature-center"]),
  })), truncated: z.boolean(), source: z.literal("openstreetmap-unverified"), cached: z.boolean(),
  dataMode: z.enum(["saved-snapshot", "live-plus-snapshot"]).optional(), retrievedAt: z.string().nullable().optional(),
});
