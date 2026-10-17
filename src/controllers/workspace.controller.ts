import { Request, Response } from "express";
import { createWorkspace, getWorkspace, deleteWorkspace } from "../services/workspace.service.js";
import { isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";

export async function createWorkspaceController(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;
    if (
      typeof name !== "string" ||
      isNullOrUndefinedOrEmpty(name) ||
      typeof slug !== "string" ||
      isNullOrUndefinedOrEmpty(slug)
    ) {
      return res.status(401).json({ message: "Invalid name or slug" });
    }
    const userId = req.user!.sub;
    const workspace = await createWorkspace(userId, { name, slug });
    res.status(201).json({
      message: `${name} Workspace created successfully`,
      workspace: workspace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
}

export async function getWorkspaceController(req: Request, res: Response) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const workspace = await getWorkspace(workspaceId);
    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: (error as Error).message });
  }
}

export async function deleteWorkspaceController(req: Request, res: Response) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    await deleteWorkspace(workspaceId);
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: (error as Error).message });
  }
}
