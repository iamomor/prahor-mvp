import { z } from "zod";
import { dateSchema, idSchema, languageSchema, nonEmptyText, timestampSchema } from "./common";

export const knowledgeSourceSchema = z.strictObject({
  id: idSchema, version: nonEmptyText(100), title: nonEmptyText(300), publisher: nonEmptyText(200),
  url: z.url({ protocol: /^https$/ }), language: languageSchema,
  publishedOn: dateSchema.nullable(), reviewedAt: timestampSchema.nullable(),
  reviewedByUserId: idSchema.nullable(),
  reviewStatus: z.enum(["pending", "approved", "rejected", "withdrawn"]),
}).refine(value => value.reviewStatus !== "approved" || Boolean(value.reviewedAt && value.reviewedByUserId), {
  message: "Approval requires a recorded reviewer and review timestamp.",
});

export const citationSchema = z.strictObject({
  sourceId: idSchema, chunkId: idSchema, sourceVersion: nonEmptyText(100),
  title: nonEmptyText(300), publisher: nonEmptyText(200),
  url: z.url({ protocol: /^https$/ }), locator: nonEmptyText(200), reviewedAt: timestampSchema,
  publicationYear: z.number().int().min(1900).max(2100).optional(),
  page: z.number().int().positive().optional(),
});

const bartaFollowUpSchema = z.enum(["headache_stage", "symptom_stage"]);
export type BartaFollowUp = z.infer<typeof bartaFollowUpSchema>;

export const bartaRequestSchema = z.strictObject({
  question: nonEmptyText(1200), language: languageSchema,
  previousChunkId: idSchema.optional(),
  followUpContext: bartaFollowUpSchema.optional(),
  retention: z.discriminatedUnion("mode", [
    z.strictObject({ mode: z.literal("ephemeral") }),
    z.strictObject({ mode: z.literal("saved"), conversationId: idSchema.nullable(), confirmed: z.literal(true) }),
  ]).default({ mode: "ephemeral" }),
});

const audioTicket = z.string().regex(/^\d{13}\.[a-f0-9]{64}$/u).optional();

const audioText = nonEmptyText(4000).optional();
const audioClipUrl = z.string().regex(/^\/barta-voice\/[a-f0-9]{64}\.mp3$/u).optional();

const decisionFields = {
  audioText,
  audioTicket,
  audioClipUrl,
  action_level: z.enum(["info", "see_provider", "urgent"]).optional(),
  abstained: z.boolean().optional(),
  confidence: z.enum(["source_supported", "high", "medium", "low"]).optional(),
  answer_bn: nonEmptyText(12000).optional(),
  answer_en: nonEmptyText(12000).optional(),
};

/** Citation existence, source approval and statement support must also be verified on the server. */
export const bartaAnswerSchema = z.discriminatedUnion("status", [
  z.strictObject({
    ...decisionFields,
    status: z.literal("grounded"), answer: nonEmptyText(12000),
    citations: z.array(citationSchema).min(1).max(20),
    limitations: z.array(nonEmptyText(500)).min(1).max(10),
    followUp: nonEmptyText(200).optional(),
    claims: z.array(z.strictObject({
      text: nonEmptyText(12000), chunkId: idSchema, chunk_ids: z.array(idSchema).min(1).optional(),
    })).min(1).optional(),
    actionLevel: z.literal("education").optional(),
  }),
  z.strictObject({
    ...decisionFields,
    status: z.literal("abstained"), answer: z.null(), citations: z.array(z.never()).length(0),
    reason: z.enum([
      "insufficient_evidence", "outside_education_scope", "sources_unavailable",
      "urgent_care", "crisis_support", "mental_health_support",
    ]),
    message: nonEmptyText(500),
    suggestions: z.array(nonEmptyText(200)).max(3).optional(),
  }),
  z.strictObject({
    ...decisionFields,
    status: z.literal("clarification"),
    answer: z.null(),
    citations: z.array(z.never()).length(0),
    message: nonEmptyText(500),
    suggestions: z.array(nonEmptyText(200)).max(3),
    followUpContext: bartaFollowUpSchema.optional(),
  }),
  z.strictObject({
    status: z.literal("conversation"),
    audioTicket,
    audioText,
    audioClipUrl,
    answer: z.null(),
    citations: z.array(z.never()).length(0),
    message: nonEmptyText(500),
  }),
  z.strictObject({ status: z.literal("not_connected"), answer: z.null(), message: nonEmptyText(500) }),
]);

export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;
export type BartaRequest = z.infer<typeof bartaRequestSchema>;
export type BartaAnswer = z.infer<typeof bartaAnswerSchema>;
export type Citation = z.infer<typeof citationSchema>;

/** Optional generated speech; tickets authorize the exact server-issued text. */
export const bartaAudioRequestSchema = z.union([
  z.strictObject({ text: z.string().min(1).max(4000), language: languageSchema, ticket: z.string().length(78) }),
  z.strictObject({ language: languageSchema, help: z.literal(true) }),
]);
