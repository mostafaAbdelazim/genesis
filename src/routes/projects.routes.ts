import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";
import {
  createProjectController,
  getProjectsController,
  getProjectController,
  deleteProjectController,
} from "../controllers/projects.controller.js";
import tasksRoutes from "./tasks.routes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", requireWorkspaceRole(WorkspaceRole.MEMBER), asyncHandler(createProjectController));
router.get("/", requireWorkspaceRole(WorkspaceRole.MEMBER), asyncHandler(getProjectsController));
router.get(
  "/:projectId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getProjectController),
);
router.delete(
  "/:projectId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(deleteProjectController),
);

router.use("/:projectId/tasks", tasksRoutes);

export { router as projectsRoutes };
