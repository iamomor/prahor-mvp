import { NextResponse } from "next/server";
import { directoryQuerySchema } from "@/lib/contracts/poth-current";
import { getPothFacilities } from "@/features/poth/pothFacilityStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = directoryQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    district: url.searchParams.get("district") ?? "",
    limit: url.searchParams.get("limit") ?? "50",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid directory search parameters." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { q, district, limit } = parsed.data;
  const needle = q.toLocaleLowerCase();
  const facilities = getPothFacilities()
    .filter((facility) =>
      (!district || facility.district === district) &&
      (!needle ||
        `${facility.name} ${facility.district} ${facility.address}`
          .toLocaleLowerCase()
          .includes(needle)),
    )
    .slice(0, limit);

  return NextResponse.json(
    { facilities, sourceType: "reviewed-import", bookingAvailable: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
