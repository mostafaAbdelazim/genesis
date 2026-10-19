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

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.post("/", requireWorkspaceRole(WorkspaceRole.MEMBER), asyncHandler(createTaskController));
router.get("/", requireWorkspaceRole(WorkspaceRole.MEMBER), asyncHandler(getTasksController));
router.get("/:taskId", requireWorkspaceRole(WorkspaceRole.MEMBER), asyncHandler(getTaskController));
router.put(
  "/:taskId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(updateTaskController),
);
router.delete(
  "/:taskId",
  requireWorkspaceRole(WorkspaceRole.ADMIN),
  asyncHandler(deleteTaskController),
);

router.use("/:taskId/comments", commentsRouter);

export default router;
