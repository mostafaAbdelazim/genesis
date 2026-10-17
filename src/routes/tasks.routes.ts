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

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.post("/", requireWorkspaceRole(WorkspaceRole.MEMBER), createTaskController);
router.get("/", requireWorkspaceRole(WorkspaceRole.MEMBER), getTasksController);
router.get("/:taskId", requireWorkspaceRole(WorkspaceRole.MEMBER), getTaskController);
router.put("/:taskId", requireWorkspaceRole(WorkspaceRole.MEMBER), updateTaskController);
router.delete("/:taskId", requireWorkspaceRole(WorkspaceRole.ADMIN), deleteTaskController);

export default router;
