import { NextResponse } from "next/server";
import { directoryQuerySchema } from "@/lib/contracts/poth-current";
import { parseDirectoryQuery, searchDirectory } from "@/features/poth/directoryCore";
import { getPothDiscovery } from "@/features/poth/discoveryStore";
import { getPothFacilities } from "@/features/poth/pothFacilityStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.has("view")) {
    if (url.searchParams.getAll("view").length !== 1 || url.searchParams.get("view") !== "discovery") {
      return NextResponse.json({ error: "Invalid directory view." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const params = new URLSearchParams(url.searchParams); params.delete("view");
    const query = parseDirectoryQuery(params);
    if (!query) return NextResponse.json({ error: "Invalid directory filters." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(searchDirectory(getPothDiscovery(), query), { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  }
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
