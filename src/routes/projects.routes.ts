import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/workspace.middleware.js";
import { WorkspaceRole } from "@prisma/client";
import { createProjectController, getProjectsController, getProjectController, deleteProjectController } from "../controllers/projects.controller.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", requireWorkspaceRole(WorkspaceRole.MEMBER), createProjectController);
router.get("/", requireWorkspaceRole(WorkspaceRole.MEMBER), getProjectsController);
router.get("/:projectId", requireWorkspaceRole(WorkspaceRole.MEMBER), getProjectController);
router.delete("/:projectId", requireWorkspaceRole(WorkspaceRole.MEMBER), deleteProjectController);

export { router as projectsRoutes };