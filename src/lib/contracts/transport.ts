import { z } from "zod";
import { apiErrorSchema, contractVersion, idSchema } from "./common";
import { currentUserSchema } from "./platform";

/** Runtime counterparts of the existing v1 envelope types. */
export const apiSuccessSchema = <S extends z.ZodType>(data: S) => z.strictObject({
  data, requestId: idSchema, contractVersion: z.literal(contractVersion),
});
export const apiResultSchema = <S extends z.ZodType>(data: S) => z.union([apiSuccessSchema(data), apiErrorSchema]);
export const pageSchema = <S extends z.ZodType>(item: S) => z.strictObject({
  items: z.array(item), nextCursor: z.string().min(1).max(2048).nullable(),
});
export const currentUserResponseSchema = apiSuccessSchema(currentUserSchema);

/** Proposals for future list/path handlers; existing GETs do not adopt these silently. */
export const resourceIdParamsSchema = z.strictObject({ id: idSchema });
export const paginationQuerySchema = z.strictObject({
  limit: z.string().regex(/^\d{1,2}$/).transform(Number).pipe(z.number().int().min(1).max(50)).default(20),
  cursor: z.string().min(1).max(2048).optional(),
});
