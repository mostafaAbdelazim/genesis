import { Router } from "express";
import {
  createCommentController,
  getCommentsController,
  deleteCommentController,
} from "../controllers/comments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";

const commentsRouter = Router({ mergeParams: true });
commentsRouter.use(authMiddleware);
commentsRouter.post("/", requireWorkspaceRole(WorkspaceRole.MEMBER), createCommentController);
commentsRouter.get("/", requireWorkspaceRole(WorkspaceRole.MEMBER), getCommentsController);
commentsRouter.delete(
  "/:commentId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  deleteCommentController,
);

export default commentsRouter;
