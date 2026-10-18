import { Request, Response, NextFunction } from "express";
import { isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";
import { getMembership } from "../services/membership.service.js";
import { WorkspaceRole } from "@prisma/client";
import { WorkspaceRoleRank } from "../utils/workspace.role.rank.js";

export function requireWorkspaceRole(requiredRole: WorkspaceRole) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { workspaceId } = req.params;
    if (typeof workspaceId !== "string" || isNullOrUndefinedOrEmpty(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }
    const userId = req.user!.sub;
    const membership = await getMembership(workspaceId, userId);

    if (!membership) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (WorkspaceRoleRank[membership.role] < WorkspaceRoleRank[requiredRole]) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    req.membership = membership;
    next();
  };
}
