import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskParamsSchema = z.looseObject({
  taskId: z.cuid(),
});

export const createTaskBodySchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  assigneeId: z.cuid().optional(),
});

export const updateTaskBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  assigneeId: z.cuid().optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
});
