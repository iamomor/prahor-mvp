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
const phone = z.string().trim().max(32).regex(/^[0-9+() -]*$/);
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
// Signup keeps the narrower roleDetailsSchema; these extra self-reported fields are edited after setup.
export const profileDetailsSchema = roleDetailsSchema.extend({
  area: z.string().trim().max(120).default(""),
  dateOfBirth: z.union([z.literal(""), z.iso.date()]).default(""),
  bloodGroup: z.enum(["", ...bloodGroups]).default(""),
  emergencyName: z.string().trim().max(120).default(""),
  emergencyRelation: z.string().trim().max(60).default(""),
  emergencyPhone: z.string().trim().max(32).default(""),
});
export type ProfileDetails = z.infer<typeof profileDetailsSchema>;
export const onboardingSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(120),
  // One self-declared role per signup; extra roles need operator approval, never self-selection.
  purposes: z.array(signupPurposeSchema).length(1),
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
  details: profileDetailsSchema.default({ ...emptyRoleDetails, area: "", dateOfBirth: "", bloodGroup: "",
    emergencyName: "", emergencyRelation: "", emergencyPhone: "" }),
  roles: z.array(z.strictObject({ role: workspaceRoleSchema, status: z.enum(["approved", "pending", "revoked"]) })).max(3),
  provider: z.strictObject({ kinds: z.array(z.enum(["doctor", "chw"])).max(2),
    organization: z.string().max(160), registrationNumber: z.string().max(100),
    status: z.enum(["pending", "approved", "revoked"]), mode: z.literal("simulated"),
  }).nullable(),
});
export type AccountAccess = z.infer<typeof accountAccessSchema>;
// Help areas the mother asks for. They label the relationship only and never expose health/diary/chat data.
export const supporterScopes = ["visit_preparation", "appointment_company", "transport", "medicine_reminders",
  "nutrition_meals", "household_help", "emotional_support", "paperwork_costs", "care_coordination", "baby_care",
  "emergency_contact"] as const;
export const supporterScopeSchema = z.enum(supporterScopes);
export type SupporterScope = z.infer<typeof supporterScopeSchema>;
export const supporterConnectionSchema = z.strictObject({
  id: z.uuid(), motherId: z.uuid(), supporterId: z.uuid(),
  motherName: z.string().max(120), supporterName: z.string().max(120),
  scopes: z.array(supporterScopeSchema).min(1).max(supporterScopes.length),
  status: z.enum(["pending", "active", "revoked", "expired"]), expiresAt: z.iso.datetime({ offset: true }),
});
export type SupporterConnection = z.infer<typeof supporterConnectionSchema>;
export const accountActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("onboard"), profile: onboardingSchema }),
  z.strictObject({ action: z.literal("switch"), role: workspaceRoleSchema }),
  z.strictObject({ action: z.literal("invite"), supporterId: z.uuid(),
    scopes: z.array(supporterScopeSchema).min(1).max(supporterScopes.length).refine(v => new Set(v).size === v.length),
    expiresAt: z.iso.datetime({ offset: true }), reviewConfirmed: z.literal(true) }),
  z.strictObject({ action: z.literal("accept"), code: z.string().regex(/^[a-f0-9]{64}$/) }),
  z.strictObject({ action: z.literal("revoke"), connectionId: z.uuid() }),
  z.strictObject({ action: z.literal("profile"), displayName: z.string().trim().min(1).max(120),
    details: profileDetailsSchema.extend({ phone, emergencyPhone: phone }) }),
  z.strictObject({ action: z.literal("email"), email: z.string().trim().toLowerCase().max(254).email() }),
  z.strictObject({ action: z.literal("password"), currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128) }),
]);
