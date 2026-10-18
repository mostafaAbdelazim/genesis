import { Request, Response } from "express";
import { getProject } from "../services/project.service.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../services/tasks.service.js";
import { isNullOrUndefinedOrEmpty } from "../utils/input_validator.js";
import { HttpError } from "../utils/http_error.js";

export async function createTaskController(req: Request, res: Response) {
  const { projectId, workspaceId } = req.params as { projectId: string; workspaceId: string };
  const error = await ensureProjectExists(projectId, workspaceId);
  if (error) {
    return res
      .status((error.cause as { code: number })?.code ?? 500)
      .json({ error: error.message });
  }
  const { title, description, assigneeId } = req.body;
  if (
    isNullOrUndefinedOrEmpty(title) ||
    (assigneeId != null && isNullOrUndefinedOrEmpty(assigneeId))
  ) {
    return res.status(400).json({ error: "Invalid title or assignee id" });
  }
  try {
    const task = await createTask(projectId, { title, description, assigneeId });
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to create task" });
  }
}

export async function getTasksController(req: Request, res: Response) {
  const { projectId, workspaceId } = req.params as { projectId: string; workspaceId: string };
  const error = await ensureProjectExists(projectId, workspaceId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  const tasks = await getTasks(projectId);
  res.status(200).json(tasks);
}

export async function getTaskController(req: Request, res: Response) {
  const { projectId, workspaceId, taskId } = req.params as {
    projectId: string;
    workspaceId: string;
    taskId: string;
  };
  const error = await ensureProjectExists(projectId, workspaceId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  try {
    const task = await getTask(projectId, taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to get task" });
  }
}

export async function updateTaskController(req: Request, res: Response) {
  const { projectId, workspaceId, taskId } = req.params as {
    projectId: string;
    workspaceId: string;
    taskId: string;
  };
  const error = await ensureProjectExists(projectId, workspaceId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  const { title, description, assigneeId, status, priority } = req.body;
  if (isNullOrUndefinedOrEmpty(title)) {
    return res.status(400).json({ error: "Invalid title" });
  }
  if (assigneeId != null && assigneeId.trim() === "") {
    return res.status(400).json({ error: "Invalid assigneeId" });
  }

  try {
    const task = await updateTask(projectId, taskId, {
      title,
      description,
      assigneeId,
      status,
      priority,
    });
    res.status(200).json(task);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to update task" });
  }
}

export async function deleteTaskController(req: Request, res: Response) {
  const { projectId, workspaceId, taskId } = req.params as {
    projectId: string;
    workspaceId: string;
    taskId: string;
  };
  const error = await ensureProjectExists(projectId, workspaceId);
  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }
  try {
    await deleteTask(projectId, taskId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to delete task" });
  }
}

async function ensureProjectExists(
  projectId: string,
  workspaceId: string,
): Promise<HttpError | null> {
  if (isNullOrUndefinedOrEmpty(projectId) || isNullOrUndefinedOrEmpty(workspaceId)) {
    return new HttpError("Invalid project or workspace id", 400);
  }
  const project = await getProject(projectId, workspaceId);
  if (!project) {
    return new HttpError("Project not found", 404);
  }
  return null;
}
