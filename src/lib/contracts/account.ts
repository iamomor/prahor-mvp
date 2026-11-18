import { z } from "zod";

export const workspaceRoleSchema = z.enum(["mother", "provider", "supporter"]);
export const activeRoleSchema = z.enum(["mother", "provider", "supporter", "member"]);
export const signupPurposeSchema = z.enum(["mother", "supporter", "doctor", "chw"]);
export const roleDetailsSchema = z.strictObject({
  phone: z.string().trim().max(32).default(""),
  district: z.string().trim().max(100).default(""),
  careStage: z.enum(["", "planning", "pregnant", "postpartum", "prefer_not_to_say"]).default(""),
  supporterType: z.enum(["", "family", "caregiver", "supporter"]).default(""),
  qualification: z.string().trim().max(120).default(""),
  specialty: z.string().trim().max(120).default(""),
  serviceArea: z.string().trim().max(120).default(""),
});
export type RoleDetails = z.infer<typeof roleDetailsSchema>;
export const emptyRoleDetails: RoleDetails = { phone: "", district: "", careStage: "", supporterType: "",
  qualification: "", specialty: "", serviceArea: "" };
export const onboardingSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(120),
  purposes: z.array(signupPurposeSchema).min(1).max(4).refine(v => new Set(v).size === v.length),
  organization: z.string().trim().max(160).default(""),
  registrationNumber: z.string().trim().max(100).default(""),
  details: roleDetailsSchema.default(emptyRoleDetails),
}).superRefine((v, ctx) => {
  if ((v.purposes.includes("doctor") || v.purposes.includes("chw")) && !v.organization)
    ctx.addIssue({ code: "custom", path: ["organization"], message: "Enter your organization or practice." });
  if (v.purposes.includes("doctor") && !v.registrationNumber)
    ctx.addIssue({ code: "custom", path: ["registrationNumber"], message: "Enter your professional registration number." });
});
export type Onboarding = z.infer<typeof onboardingSchema>;
export type SignupPurpose = z.infer<typeof signupPurposeSchema>;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type ActiveRole = z.infer<typeof activeRoleSchema>;
export const accountAccessSchema = z.strictObject({
  userId: z.uuid(), displayName: z.string().max(120), activeRole: activeRoleSchema,
  onboarded: z.boolean(),
  details: roleDetailsSchema.default(emptyRoleDetails),
  roles: z.array(z.strictObject({ role: workspaceRoleSchema, status: z.enum(["approved", "pending", "revoked"]) })).max(3),
  provider: z.strictObject({ kinds: z.array(z.enum(["doctor", "chw"])).max(2),
    organization: z.string().max(160), registrationNumber: z.string().max(100),
    status: z.enum(["pending", "approved", "revoked"]), mode: z.literal("simulated"),
  }).nullable(),
});
export type AccountAccess = z.infer<typeof accountAccessSchema>;
// These grants authorize coordination only. They never expose health/diary/chat data.
export const supporterScopeSchema = z.enum(["visit_preparation", "care_coordination"]);
export const supporterConnectionSchema = z.strictObject({
  id: z.uuid(), motherId: z.uuid(), supporterId: z.uuid(),
  motherName: z.string().max(120), supporterName: z.string().max(120),
  scopes: z.array(supporterScopeSchema).min(1).max(2),
  status: z.enum(["pending", "active", "revoked", "expired"]), expiresAt: z.iso.datetime({ offset: true }),
});
export type SupporterConnection = z.infer<typeof supporterConnectionSchema>;
export const accountActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("onboard"), profile: onboardingSchema }),
  z.strictObject({ action: z.literal("switch"), role: workspaceRoleSchema }),
  z.strictObject({ action: z.literal("invite"), supporterId: z.uuid(),
    scopes: z.array(supporterScopeSchema).min(1).max(2).refine(v => new Set(v).size === v.length),
    expiresAt: z.iso.datetime({ offset: true }), reviewConfirmed: z.literal(true) }),
  z.strictObject({ action: z.literal("accept"), code: z.string().regex(/^[a-f0-9]{64}$/) }),
  z.strictObject({ action: z.literal("revoke"), connectionId: z.uuid() }),
]);
