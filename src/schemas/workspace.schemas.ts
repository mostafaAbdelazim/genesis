import { z } from "zod";

export const workspaceParamsSchema = z.looseObject({
  workspaceId: z.cuid(),
});

export const createWorkspaceBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must be less than 100 characters long"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters long")
    .max(100, "Slug must be less than 100 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});
