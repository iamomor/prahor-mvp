import { handleCareRequest } from "@/lib/care/server";

export async function POST(request: Request) {
  return handleCareRequest(request, "create-request");
}

export async function GET(request: Request) {
  return handleCareRequest(request, "request-list");
}
