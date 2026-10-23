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
import { validate } from "../middleware/validate.middleware.js";
import { createProjectBodySchema, projectParamsSchema } from "../schemas/project.schemas.js";
import { workspaceParamsSchema } from "../schemas/workspace.schemas.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post(
  "/",
  validate(workspaceParamsSchema, "params"),
  validate(createProjectBodySchema, "body"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(createProjectController),
);
router.get(
  "/",
  validate(workspaceParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getProjectsController),
);
router.get(
  "/:projectId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(getProjectController),
);
router.delete(
  "/:projectId",
  validate(workspaceParamsSchema, "params"),
  validate(projectParamsSchema, "params"),
  requireWorkspaceRole(WorkspaceRole.MEMBER),
  asyncHandler(deleteProjectController),
);

router.use("/:projectId/tasks", tasksRoutes);

export { router as projectsRoutes };
