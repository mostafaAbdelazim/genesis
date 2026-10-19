import { Request, Response } from "express";
import { createWorkspace, getWorkspace, deleteWorkspace } from "../services/workspace.service.js";
import { isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";
import { AppError } from "../utils/AppError.js";

export async function createWorkspaceController(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;
    if (
      typeof name !== "string" ||
      isNullOrUndefinedOrEmpty(name) ||
      typeof slug !== "string" ||
      isNullOrUndefinedOrEmpty(slug)
    ) {
      console.error(name, slug);
      throw new AppError("Invalid name or slug", 401);
    }
    const userId = req.user!.sub;
    const workspace = await createWorkspace(userId, { name, slug });
    res.status(201).json({
      message: `${name} Workspace created successfully`,
      workspace: workspace,
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getWorkspaceController(req: Request, res: Response) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const workspace = await getWorkspace(workspaceId);
    res.status(200).json(workspace);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteWorkspaceController(req: Request, res: Response) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    await deleteWorkspace(workspaceId);
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    throw toAppError(error);
  }
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError("Internal server error", 500);
}
