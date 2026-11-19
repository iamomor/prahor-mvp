import { buildBartaSpeechText, maxSpeechText } from "@/features/barta/barta-spoken-text";
import { issueAudioTicket } from "@/features/barta/audio-ticket";
import { getBundledSpeechUrl } from "@/features/barta/bundled-speech";
import { getBartaBleedingClarification, getUsualPeriodQuestion } from "@/features/barta/bleeding-clarification";
import { approvedBartaCorpus } from "@/features/barta/approved-corpus";
import { bartaFollowUpQuestion, getBartaKnowledgeAnswer, prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "@/features/barta/approved-knowledge";
import { getBartaOpenRouterSelector } from "@/features/barta/openrouter-intent";
import { getBartaGreeting, stripOpeningGreeting } from "@/features/barta/conversation";
import { getBartaCoverage } from "@/features/barta/conversation-coverage";
import { educationTopics } from "@/features/barta/education-topics";
import { getBankSafety, getQuestionBankIntent } from "@/features/barta/question-bank-routing";
import { getBartaRouteResponse, getBartaSafetyResponse } from "@/features/barta/safety-gate";
import { getBartaDemoLanguage } from "@/features/barta/demo-questions";
import { getSyntheticBartaAnswer } from "@/features/barta/synthetic-demo";
import { jsonNoStore } from "@/lib/api-response";
import { boundedJson } from "@/lib/auth/validation";
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

// shortcut: per-instance memory, so limits reset on cold start and are per serverless instance; move to a shared store if abuse appears.
const chatHits = new Map<string, { start: number; count: number }>();
const chatLimitPerMinute = 20;
function overChatLimit(request: Request, now = Date.now()) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (chatHits.size > 5000) chatHits.clear();
  const hit = chatHits.get(ip);
  if (!hit || now - hit.start >= 60_000) { chatHits.set(ip, { start: now, count: 1 }); return false; }
  return ++hit.count > chatLimitPerMinute;
}

async function decisionReply(answer: BartaAnswer, language: BartaRequest["language"], status: number) {
  const speech = answer.status === "not_connected" ? undefined : buildBartaSpeechText(answer, language);
  const audioText = speech && speech.length <= maxSpeechText ? speech : undefined;
  const audioTicket = audioText ? issueAudioTicket(audioText, language) : undefined;
  const audioClipUrl = audioText && !audioTicket ? await getBundledSpeechUrl(audioText, language) : undefined;
  const audio = { audioText, audioTicket, audioClipUrl };
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
    body = await boundedJson(request);
  } catch {
    return jsonNoStore({ message: "Invalid request.", status: "not_connected" }, 400);
  }
  const requestData = bartaRequestSchema.safeParse(body);
  if (requestData.success) {
    const { question, language, retention, previousChunkId } = requestData.data;
    const questionWithoutGreeting = stripOpeningGreeting(question);
    const safetyResponse = getBankSafety(question, language) ?? getBartaSafetyResponse(question, language)
      ?? (questionWithoutGreeting !== question
        ? getBankSafety(questionWithoutGreeting, language) ?? getBartaSafetyResponse(questionWithoutGreeting, language)
        : undefined);
    if (safetyResponse?.status === "abstained"
      && (safetyResponse.reason === "urgent_care" || safetyResponse.reason === "crisis_support")) {
      return decisionReply(safetyResponse, language, 200);
    }
    const hasPreviousAnswer = Boolean(previousChunkId);
    const coverage = getBartaCoverage(question, { hasPreviousAnswer });
    if (coverage?.type === "route") {
      return decisionReply(getBartaRouteResponse(coverage.route, language), language, 200);
    }
    if (safetyResponse) return decisionReply(safetyResponse, language, 200);
    // Throttle only after safety replies, so danger-sign guidance is never rate limited.
    if (overChatLimit(request)) {
      const limited = jsonNoStore({ message: "Too many questions in a minute. Please wait and try again.", status: "not_connected" }, 429);
      limited.headers.set("Retry-After", "60"); return limited;
    }

    if (retention.mode !== "ephemeral") {
      return jsonNoStore({ message: "Saved Barta conversations are unavailable." }, 400);
    }

    if (coverage?.type === "reply" && coverage.id === "pii") {
      return decisionReply({ status: "conversation", answer: null, citations: [], message: coverage[language] }, language, 200);
    }
    const bleeding = getBartaBleedingClarification(questionWithoutGreeting, language);
    if (bleeding) return decisionReply(bleeding, language, 200);

    if (coverage?.type === "reply") {
      const message = coverage[language];
      const answer: BartaAnswer = coverage.topics
        ? {
          status: "clarification", answer: null, citations: [], message,
          suggestions: [educationTopics.anc[language], educationTopics.newborn[language], educationTopics.breastfeeding[language]],
        }
        : { status: "conversation", answer: null, citations: [], message };
      return decisionReply(answer, language, 200);
    }

    const greeting = getBartaGreeting(question, language, hasPreviousAnswer);
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
    const query = bartaFollowUpQuestion(knowledge, questionWithoutGreeting, language, previousChunkId);
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
