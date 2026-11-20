import { z } from "zod";
const reported = z.enum(["reported_available", "reported_limited", "reported_unavailable", "unknown"]);
const web = z.url({ protocol: /^https?$/ });
export const discoveryResponseSchema = z.strictObject({
  places: z.array(z.strictObject({
    id: z.string().min(1), name: z.string().min(1).max(300), nameBn: z.string().nullable(),
    kind: z.enum(["hospital", "clinic", "maternity", "midwife", "doctor", "pharmacy"]),
    source: z.enum(["registry", "community"]), sourceUrl: web, reviewedOn: z.string().nullable(),
    division: z.string().nullable(), district: z.string().nullable(), area: z.string().nullable(),
    phone: z.string().nullable(), email: z.string().nullable(), website: web.nullable(), hours: z.string().nullable(),
    lat: z.number().finite().nullable(), lon: z.number().finite().nullable(),
    accessibility: z.strictObject({ wheelchair: reported, accessibleToilet: reported, hearingLoop: reported }),
  })),
  total: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.literal(20), pages: z.number().int().positive(),
  registryCount: z.number().int().nonnegative(), communityCount: z.number().int().nonnegative(), unmappedDistrictCount: z.number().int().nonnegative(),
});
