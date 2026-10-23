import { z } from "zod";

export const commentParamsSchema = z.looseObject({
  commentId: z.cuid(),
});

export const createCommentBodySchema = z.object({
  content: z.string().nonempty("Content is required"),
});
