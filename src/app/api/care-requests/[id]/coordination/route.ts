import { handleCareRequest } from "@/lib/care/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handleCareRequest(request, "coordination-detail", (await context.params).id);
}
