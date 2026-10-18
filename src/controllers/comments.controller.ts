import { Request, Response } from "express";
import { createComment, getComments, deleteComment } from "../services/comments.services.js";
import { HttpError } from "../utils/http_error.js";
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
  const error = await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  const { body } = req.body as { body: string };
  if (isNullOrUndefinedOrEmpty(body)) {
    return res.status(400).json({ error: "Invalid body" });
  }
  const userId = req.user!.sub;
  try {
    const comment = await createComment(taskId, userId, body);
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCommentsController(req: Request, res: Response) {
  const { workspaceId, projectId, taskId } = req.params as {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  const error = await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  try {
    const comments = (await getComments(taskId)) ?? ([] as Comment[]);
    res.status(200).json(comments);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCommentController(req: Request, res: Response) {
  const { workspaceId, projectId, taskId } = req.params as {
    workspaceId: string;
    projectId: string;
    taskId: string;
  };
  const error = await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  const { commentId } = req.params as { commentId: string };
  if (isNullOrUndefinedOrEmpty(commentId)) {
    return res.status(400).json({ error: "Invalid comment id" });
  }
  const userId = req.user!.sub;
  try {
    await deleteComment(taskId, commentId, userId, workspaceId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function ensureWorkspaceProjectTaskExists(
  workspaceId: string,
  projectId: string,
  taskId: string,
): Promise<HttpError | null> {
  if (isNullOrUndefinedOrEmpty(workspaceId)) {
    return new HttpError("Invalid workspace id", 400);
  }
  if (isNullOrUndefinedOrEmpty(projectId)) {
    return new HttpError("Invalid project id", 400);
  }
  if (isNullOrUndefinedOrEmpty(taskId)) {
    return new HttpError("Invalid task id", 400);
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return new HttpError("Workspace not found", 404);
  }

  const project = await getProject(projectId, workspaceId);
  if (!project) {
    return new HttpError("Project not found", 404);
  }

  const task = await getTask(projectId, taskId);
  if (!task) {
    return new HttpError("Task not found", 404);
  }
  return null;
}
