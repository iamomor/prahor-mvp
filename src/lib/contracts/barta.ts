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
});

export const bartaRequestSchema = z.strictObject({
  question: nonEmptyText(1200), language: languageSchema,
  retention: z.discriminatedUnion("mode", [
    z.strictObject({ mode: z.literal("ephemeral") }),
    z.strictObject({ mode: z.literal("saved"), conversationId: idSchema.nullable(), confirmed: z.literal(true) }),
  ]).default({ mode: "ephemeral" }),
});

/** Citation existence, source approval and statement support must also be verified on the server. */
export const bartaAnswerSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("grounded"), answer: nonEmptyText(12000),
    citations: z.array(citationSchema).min(1).max(20),
    limitations: z.array(nonEmptyText(500)).min(1).max(10),
  }),
  z.strictObject({
    status: z.literal("abstained"), answer: z.null(), citations: z.array(z.never()).length(0),
    reason: z.enum(["insufficient_evidence", "outside_education_scope", "sources_unavailable"]),
    message: nonEmptyText(500),
  }),
  z.strictObject({ status: z.literal("not_connected"), answer: z.null(), message: nonEmptyText(500) }),
]);

export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;
export type BartaRequest = z.infer<typeof bartaRequestSchema>;
export type BartaAnswer = z.infer<typeof bartaAnswerSchema>;
export type Citation = z.infer<typeof citationSchema>;
