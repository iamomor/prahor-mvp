import { z } from "zod";
import { consentGrantSchema, providerRequestSchema, supportRequestSchema } from "./bondhon";
import { coordinationAuditSchema, coordinationMessageSchema } from "./coordination";
export const bondhonDetailSchema = z.strictObject({
  request: z.union([supportRequestSchema, providerRequestSchema]),
  messages: z.array(coordinationMessageSchema).max(200),
  grants: z.array(consentGrantSchema).max(20),
  audit: z.array(coordinationAuditSchema).max(100),
});
export type BondhonDetail = z.infer<typeof bondhonDetailSchema>;
