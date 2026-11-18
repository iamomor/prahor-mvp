import { handleCareRequest } from "@/lib/care/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handleCareRequest(request, "acknowledge", (await context.params).id);
}
