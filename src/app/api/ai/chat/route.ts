import { buildBartaSpeechText, maxSpeechText } from "@/features/barta/barta-spoken-text";
import { issueAudioTicket } from "@/features/barta/audio-ticket";
import { getBartaBleedingClarification, getUsualPeriodQuestion } from "@/features/barta/bleeding-clarification";
import { approvedBartaCorpus } from "@/features/barta/approved-corpus";
import { bartaFollowUpQuestion, getBartaKnowledgeAnswer, prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "@/features/barta/approved-knowledge";
import { getBartaOpenRouterSelector } from "@/features/barta/openrouter-intent";
import { getBartaGreeting, stripOpeningGreeting } from "@/features/barta/conversation";
import { getBankSafety, getQuestionBankIntent } from "@/features/barta/question-bank-routing";
import { getBartaSafetyResponse } from "@/features/barta/safety-gate";
import { getBartaDemoLanguage } from "@/features/barta/demo-questions";
import { getSyntheticBartaAnswer } from "@/features/barta/synthetic-demo";
import { jsonNoStore } from "@/lib/api-response";
import { bartaAnswerSchema, bartaRequestSchema, type BartaAnswer, type BartaRequest } from "@/lib/contracts/barta";

// The sample form still sends only a question.
const starterRequestSchema = bartaRequestSchema.pick({ question: true });
let preparedKnowledge: ReturnType<typeof prepareBartaKnowledge> = null;
let preparedOn = "";

function getKnowledge() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (preparedOn !== today) {
    preparedOn = today;
    try {
      preparedKnowledge = prepareBartaKnowledge(approvedBartaCorpus, now);
    } catch {
      preparedKnowledge = null;
    }
  }
  return preparedKnowledge;
}

function decisionReply(answer: BartaAnswer, language: BartaRequest["language"], status: number) {
  const speech = answer.status === "not_connected" ? undefined : buildBartaSpeechText(answer, language);
  const ticket = speech ? issueAudioTicket(speech, language) : undefined;
  const audio = speech && speech.length <= maxSpeechText ? { audioText: speech, ...(ticket && { audioTicket: ticket }) } : {};
  if (answer.status === "grounded") {
    return jsonNoStore(bartaAnswerSchema.parse({
      ...answer,
      ...audio,
      action_level: "info",
      abstained: false,
      confidence: "high",
      [language === "bn" ? "answer_bn" : "answer_en"]: answer.answer,
      ...(answer.claims && { claims: answer.claims.map((claim) => ({ ...claim, chunk_ids: [claim.chunkId] })) }),
    }), status);
  }
  if (answer.status === "abstained") {
    const urgent = answer.reason === "urgent_care" || answer.reason === "crisis_support";
    const seeProvider = answer.reason === "outside_education_scope" || answer.reason === "mental_health_support";
    return jsonNoStore(bartaAnswerSchema.parse({
      ...answer,
      ...audio,
      action_level: urgent ? "urgent" : seeProvider ? "see_provider" : "info",
      abstained: true, confidence: "low",
    }), status);
  }
  if (answer.status === "clarification") {
    return jsonNoStore(bartaAnswerSchema.parse({
      ...answer,
      ...audio,
      action_level: "info", abstained: true, confidence: "low",
    }), status);
  }
  return jsonNoStore({ ...answer, ...audio }, status);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ message: "Invalid request.", status: "not_connected" }, 400);
  }
  const requestData = bartaRequestSchema.safeParse(body);
  if (requestData.success) {
    const { question, language, retention, previousChunkId } = requestData.data;
    const safetyResponse = getBankSafety(question, language) ?? getBartaSafetyResponse(question, language);
    if (safetyResponse) return decisionReply(safetyResponse, language, 200);

    if (retention.mode !== "ephemeral") {
      return jsonNoStore({ message: "Saved Barta conversations are unavailable." }, 400);
    }

    const bleeding = getBartaBleedingClarification(question, language);
    if (bleeding) return decisionReply(bleeding, language, 200);

    const greeting = getBartaGreeting(question, language);
    if (greeting) return decisionReply(greeting, language, 200);

    const knowledge = getKnowledge();
    if (knowledge?.available === false) {
      return jsonNoStore({
        status: "not_connected",
        answer: null,
        message: language === "bn"
          ? "বার্তার যাচাই করা সূত্র এখনো প্রস্তুত হয়নি।"
          : "Barta’s reviewed sources are not ready yet.",
      }, 501);
    }
    const query = bartaFollowUpQuestion(knowledge, stripOpeningGreeting(question), language, previousChunkId);
    // A reviewed literal question takes priority over test-bank aliases and model routing.
    const exact = knowledge ? getBartaKnowledgeAnswer(knowledge, query, language) : undefined;
    if (exact?.status === "grounded") return decisionReply(exact, language, 200);
    const intent = getQuestionBankIntent(query, language);
    const answer = await resolveBartaKnowledgeAnswer(
      knowledge,
      intent?.canonical ?? getUsualPeriodQuestion(query, language) ?? query,
      language,
      getBartaOpenRouterSelector(),
    );
    const fallback = knowledge && intent && answer.status === "abstained" && answer.reason === "insufficient_evidence"
      ? intent.fallback() : answer;
    return decisionReply(fallback, language, knowledge ? 200 : 503);
  }

  const parsed = starterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore({ message: "Please enter a valid question.", status: "not_connected" }, 400);
  }

  const { question } = parsed.data;
  const safetyResponse = getBartaSafetyResponse(question, getBartaDemoLanguage(question));
  if (safetyResponse) return jsonNoStore(safetyResponse, 200);

  if (process.env.NODE_ENV === "development" && process.env.PROHOR_BARTA_DEMO === "1") {
    return jsonNoStore(getSyntheticBartaAnswer(question), 200);
  }

  return jsonNoStore({
    message: "Barta is not connected yet. No AI answer was generated.",
    status: "not_connected",
  }, 501);
}
