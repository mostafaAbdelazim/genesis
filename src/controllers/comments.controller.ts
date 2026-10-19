import { Request, Response } from "express";
import { createComment, getComments, deleteComment } from "../services/comments.services.js";
import { AppError } from "../utils/AppError.js";
import { isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";
import { getTask } from "../services/tasks.service.js";
import { getProject } from "../services/project.service.js";
import { getWorkspace } from "../services/workspace.service.js";

export async function createCommentController(req: Request, res: Response) {
  const { workspaceId, projectId, taskId } = req.params as {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  const { body } = req.body as { body: string };
  if (isNullOrUndefinedOrEmpty(body)) {
    throw new AppError("Invalid body", 400);
  }
  const userId = req.user!.sub;
  try {
    const comment = await createComment(taskId, userId, body);
    res.status(201).json(comment);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCommentsController(req: Request, res: Response) {
  const { workspaceId, projectId, taskId } = req.params as {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  try {
    const comments = (await getComments(taskId)) ?? ([] as Comment[]);
    res.status(200).json(comments);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteCommentController(req: Request, res: Response) {
  const { workspaceId, projectId, taskId } = req.params as {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  const { commentId } = req.params as { commentId: string };
  if (isNullOrUndefinedOrEmpty(commentId)) {
    throw new AppError("Invalid comment id", 400);
  }
  const userId = req.user!.sub;
  try {
    await deleteComment(taskId, commentId, userId, workspaceId);
    res.status(204).send();
  } catch (error) {
    throw toAppError(error);
  }
}

async function ensureWorkspaceProjectTaskExists(
  workspaceId: string,
  projectId: string,
  taskId: string,
): Promise<void> {
  if (isNullOrUndefinedOrEmpty(workspaceId)) {
    throw new AppError("Invalid workspace id", 400);
  }
  if (isNullOrUndefinedOrEmpty(projectId)) {
    throw new AppError("Invalid project id", 400);
  }
  if (isNullOrUndefinedOrEmpty(taskId)) {
    throw new AppError("Invalid task id", 400);
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const project = await getProject(projectId, workspaceId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const task = await getTask(projectId, taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError("Internal server error", 500);
}
