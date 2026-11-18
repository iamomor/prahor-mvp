import { jsonNoStore } from "@/lib/api-response";
import { createSupportRequestRequestSchema } from "@/lib/contracts/bondhon";

const starterRequestSchema = createSupportRequestRequestSchema.pick({ message: true, method: true });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ message: "Invalid request; not sent.", status: "not_sent" }, 400);
  }
  if (!starterRequestSchema.safeParse(body).success) {
    return jsonNoStore({ message: "Check the request fields. No message was sent.", status: "not_sent" }, 400);
  }

  // This path never persists or delivers a request. Secure integration remains separate work.
  return jsonNoStore({
    message: "Not sent. Human-care delivery is not configured in this starter.",
    status: "not_sent",
  }, 501);
}
