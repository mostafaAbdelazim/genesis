import { Request, Response, NextFunction } from "express";
import { getMembership } from "../services/membership.service.js";
import { WorkspaceRole } from "@prisma/client";
import { WorkspaceRoleRank } from "../utils/workspace.role.rank.js";

export function requireWorkspaceRole(requiredRole: WorkspaceRole) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { workspaceId } = req.params;
    if (typeof workspaceId !== "string" || workspaceId.trim() === "") {
      return res.status(400).json({ error: "Invalid workspace id" });
    }
    const userId = req.user!.sub;
    const membership = await getMembership(workspaceId, userId);

    if (!membership) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    if (WorkspaceRoleRank[membership.role] < WorkspaceRoleRank[requiredRole]) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    req.membership = membership;
    next();
  };
}
