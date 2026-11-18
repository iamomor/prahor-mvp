import { handleCareRequest } from "@/lib/care/server";

export async function GET(request: Request) {
  return handleCareRequest(request, "recipients");
}
