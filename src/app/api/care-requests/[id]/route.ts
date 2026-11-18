import { handleCareRequest } from "@/lib/care/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handleCareRequest(request, "request-detail", (await context.params).id);
}
