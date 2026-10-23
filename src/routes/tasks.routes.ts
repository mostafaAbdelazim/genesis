import { Router } from "express";
import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/tasks.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";
import commentsRouter from "../routes/comments.routes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTaskBodySchema, taskParamsSchema, updateTaskBodySchema } from "../schemas/task.schemas.js";
import { workspaceParamsSchema } from "../schemas/workspace.schemas.js";
import { projectParamsSchema } from "../schemas/project.schemas.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.post(
  "/",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(createTaskBodySchema, "body"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(createTaskController),
);
router.get(
  "/",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getTasksController),
);
router.get(
  "/:taskId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getTaskController),
);
router.put(
  "/:taskId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  validate(updateTaskBodySchema, "body"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(updateTaskController),
);
router.delete(
  "/:taskId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.ADMIN),
  asyncHandler(deleteTaskController),
);

router.use("/:taskId/comments", commentsRouter);

export default router;
