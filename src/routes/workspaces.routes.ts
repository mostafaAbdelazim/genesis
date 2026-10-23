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
import { validate } from "../middleware/validate.middleware.js";
import { createWorkspaceBodySchema, workspaceParamsSchema } from "../schemas/workspace.schemas.js";

const router = Router();
router.use(authMiddleware);

router.post(
  "/",
  validate(createWorkspaceBodySchema, "body"),
  asyncHandler(createWorkspaceController),
);

router.get(
  "/:workspaceId",
  validate(workspaceParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getWorkspaceController),
);
router.delete(
  "/:workspaceId",
  validate(workspaceParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.OWNER),
  asyncHandler(deleteWorkspaceController),
);

router.use("/:workspaceId/projects", projectsRoutes);

export default router;
