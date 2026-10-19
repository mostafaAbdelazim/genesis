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
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(authMiddleware);

router.post("/", asyncHandler(createWorkspaceController));
router.get(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getWorkspaceController),
);
router.delete(
  "/:workspaceId",
  requireWorkspaceRole(WorkspaceRole.OWNER),
  asyncHandler(deleteWorkspaceController),
);

router.use("/:workspaceId/projects", projectsRoutes);

export default router;
