import { NextResponse } from "next/server";

/** Use for every API outcome, including validation/authentication errors. */
export function jsonNoStore<T>(body: T, status: number): NextResponse<T> {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
