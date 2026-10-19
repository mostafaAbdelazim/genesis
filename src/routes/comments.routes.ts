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

const commentsRouter = Router({ mergeParams: true });
commentsRouter.use(authMiddleware);
commentsRouter.post(
  "/",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(createCommentController),
);
commentsRouter.get(
  "/",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getCommentsController),
);
commentsRouter.delete(
  "/:commentId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(deleteCommentController),
);

export default commentsRouter;
