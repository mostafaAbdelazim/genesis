import { Router } from "express";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";
import {
  createWorkspaceController,
  getWorkspaceController,
  deleteWorkspaceController,
} from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { projectsRoutes } from "./projects.routes.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createWorkspaceController);
router.get("/:workspaceId", requireWorkspaceRole(WorkspaceRole.MEMBER), getWorkspaceController);
router.delete(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.OWNER),
  deleteWorkspaceController,
);

router.use("/:workspaceId/projects", projectsRoutes);

export default router;
