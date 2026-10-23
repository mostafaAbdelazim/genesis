import { Request, Response } from "express";
import { createComment, getComments, deleteComment } from "../services/comments.services.js";
import { AppError } from "../utils/AppError.js";
import { getTask } from "../services/tasks.service.js";
import { getProject } from "../services/project.service.js";
import { getWorkspace } from "../services/workspace.service.js";

export async function createCommentController(req: Request, res: Response) {
  try {
    const { workspaceId, projectId, taskId } = req.params as {
      workspaceId: string;
      projectId: string;
      taskId: string;
    };

    await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
    const { content } = req.body as { content: string };

    const userId = req.user!.sub;

    const comment = await createComment(taskId, userId, content);
    res.status(201).json(comment);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCommentsController(req: Request, res: Response) {
  try {
    const { workspaceId, projectId, taskId } = req.params as {
      workspaceId: string;
      projectId: string;
      taskId: string;
    };
    await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);

    const comments = (await getComments(taskId)) ?? ([] as Comment[]);
    res.status(200).json(comments);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteCommentController(req: Request, res: Response) {
  try {
    const { workspaceId, projectId, taskId } = req.params as {
      workspaceId: string;
      projectId: string;
      taskId: string;
    };
    await ensureWorkspaceProjectTaskExists(workspaceId, projectId, taskId);
    const { commentId } = req.params as { commentId: string };
    const userId = req.user!.sub;
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
