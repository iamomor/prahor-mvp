import "server-only";
import { facilitySchema, type Facility } from "@/lib/contracts/poth";
import { bdDistricts } from "./bdDistricts";
import raw from "./facilities.json";

const validDistricts: Set<string> = new Set(
  Object.values(bdDistricts).flatMap((districts) => [...districts]),
);

/** Fail closed: malformed files cannot appear in patient-facing search. */
export function getPothFacilities(): Facility[] {
  const validated = facilitySchema.array().safeParse(raw);
  if (!validated.success) {
    console.error("Poth facility data validation failed");
    return [];
  }
  return validated.data.filter((facility) =>
    validDistricts.has(facility.district),
  );
}
