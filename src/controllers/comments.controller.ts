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
    return res.status((error.cause as { code: number }).code ?? 500).json({ error: error.message });
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
    return res.status((error.cause as { code: number }).code ?? 500).json({ error: error.message });
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
    return res.status((error.cause as { code: number }).code ?? 500).json({ error: error.message });
  }
  const { commentId } = req.params as { commentId: string };
  if (isNullOrUndefinedOrEmpty(commentId)) {
    return res.status(400).json({ error: "Invalid comment id" });
  }
  const userId = req.user!.sub;
  try {
    await deleteComment(taskId, commentId, userId);
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
): Promise<Error | null> {
  if (isNullOrUndefinedOrEmpty(workspaceId)) {
    return Error("Invalid workspace id", { cause: { code: 400 } });
  }
  if (isNullOrUndefinedOrEmpty(projectId)) {
    return Error("Invalid project id", { cause: { code: 400 } });
  }
  if (isNullOrUndefinedOrEmpty(taskId)) {
    return Error("Invalid task id", { cause: { code: 400 } });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return Error("Workspace not found", { cause: { code: 404 } });
  }

  const project = await getProject(projectId, workspaceId);
  if (!project) {
    return Error("Project not found", { cause: { code: 404 } });
  }

  const task = await getTask(projectId, taskId);
  if (!task) {
    return Error("Task not found", { cause: { code: 404 } });
  }

  return null;
}
