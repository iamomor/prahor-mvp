import { handleCareRequest } from "@/lib/care/server";

export async function POST(request: Request) {
  return handleCareRequest(request, "create-consent");
}
