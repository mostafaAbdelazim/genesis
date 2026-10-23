import { Router } from "express";
import {
  createCommentController,
  getCommentsController,
  deleteCommentController,
} from "../controllers/comments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCommentBodySchema, commentParamsSchema } from "../schemas/comments.schemas.js";
import { workspaceParamsSchema } from "../schemas/workspace.schemas.js";
import { projectParamsSchema } from "../schemas/project.schemas.js";
import { taskParamsSchema } from "../schemas/task.schemas.js";

const commentsRouter = Router({ mergeParams: true });
commentsRouter.use(authMiddleware);
commentsRouter.post(
  "/",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  validate(createCommentBodySchema, "body"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(createCommentController),
);
commentsRouter.get(
  "/",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getCommentsController),
);
commentsRouter.delete(
  "/:commentId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  validate(taskParamsSchema, "params"),
  validate(commentParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(deleteCommentController),
);

export default commentsRouter;
