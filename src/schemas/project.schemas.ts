import { z } from "zod";

export const projectParamsSchema = z.looseObject({
  projectId: z.cuid(),
});

export const createProjectBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must be less than 100 characters long"),
  description: z.string().optional(),
});
