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
  const { title, description, assignedId } = req.body;
  if (
    isNullOrUndefinedOrEmpty(title) ||
    (assignedId !== null && isNullOrUndefinedOrEmpty(assignedId))
  ) {
    return res.status(400).json({ error: "Invalid title or assigned id" });
  }
  try {
    const task = await createTask(projectId, { title, description, assignedId });
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
    return res
      .status((error.cause as { code: number })?.code ?? 500)
      .json({ error: error.message });
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
    return res
      .status((error.cause as { code: number })?.code ?? 500)
      .json({ error: error.message });
  }
  try {
    const task = await getTask(projectId, taskId);
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
    return res
      .status((error.cause as { code: number })?.code ?? 500)
      .json({ error: error.message });
  }
  const { title, description, assignedId } = req.body;
  if (isNullOrUndefinedOrEmpty(title)) {
    return res.status(400).json({ error: "Invalid title" });
  }
  if (assignedId !== null && isNullOrUndefinedOrEmpty(assignedId)) {
    return res.status(400).json({ error: "Invalid assigned id" });
  }

  try {
    const task = await updateTask(projectId, taskId, { title, description, assignedId });
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
    return res
      .status((error.cause as { code: number })?.code ?? 500)
      .json({ error: error.message });
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

async function ensureProjectExists(projectId: string, workspaceId: string): Promise<Error | null> {
  if (isNullOrUndefinedOrEmpty(projectId) || isNullOrUndefinedOrEmpty(workspaceId)) {
    return Error("Invalid project or workspace id", { cause: { code: 400 } });
  }
  const project = await getProject(projectId, workspaceId);
  if (!project) {
    return Error("Project not found", { cause: { code: 404 } });
  }
  return null;
}
