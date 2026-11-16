import { getSyntheticBartaAnswer } from "@/features/barta/synthetic-demo";
import { jsonNoStore } from "@/lib/api-response";
import { bartaRequestSchema } from "@/lib/contracts/barta";

// The current UI sends only a question. Reuse the canonical field validation.
const starterRequestSchema = bartaRequestSchema.pick({ question: true });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ message: "Invalid request.", status: "not_connected" }, 400);
  }
  const parsed = starterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore({ message: "Please enter a valid question.", status: "not_connected" }, 400);
  }

  if (process.env.NODE_ENV === "development" && process.env.PROHOR_BARTA_DEMO === "1") {
    return jsonNoStore(getSyntheticBartaAnswer(parsed.data.question), 200);
  }

  return jsonNoStore({
    message: "Barta is not connected yet. No AI answer was generated.",
    status: "not_connected",
  }, 501);
}
