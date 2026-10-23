import { Request, Response } from "express";
import { getProject } from "../services/project.service.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../services/tasks.service.js";
import { AppError } from "../utils/AppError.js";

export async function createTaskController(req: Request, res: Response) {
  try {
    const { projectId, workspaceId } = req.params as { projectId: string; workspaceId: string };
    await ensureProjectExists(projectId, workspaceId);
    const { title, description, assigneeId } = req.body;
    const task = await createTask(projectId, { title, description, assigneeId });
    res.status(201).json(task);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getTasksController(req: Request, res: Response) {
  try {
    const { projectId, workspaceId } = req.params as { projectId: string; workspaceId: string };
    await ensureProjectExists(projectId, workspaceId);
    const tasks = await getTasks(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getTaskController(req: Request, res: Response) {
  try {
    const { projectId, workspaceId, taskId } = req.params as {
      projectId: string;
      workspaceId: string;
      taskId: string;
    };

    await ensureProjectExists(projectId, workspaceId);
    const task = await getTask(projectId, taskId);
    if (!task) {
      throw new AppError("Task not found", 404);
    }
    res.status(200).json(task);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateTaskController(req: Request, res: Response) {
  try {
    const { projectId, workspaceId, taskId } = req.params as {
      projectId: string;
      workspaceId: string;
      taskId: string;
    };

    await ensureProjectExists(projectId, workspaceId);
    const { title, description, assigneeId, status, priority } = req.body;
    const task = await updateTask(projectId, taskId, {
      title,
      description,
      assigneeId,
      status,
      priority,
    });
    res.status(200).json(task);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteTaskController(req: Request, res: Response) {
  try {
    const { projectId, workspaceId, taskId } = req.params as {
      projectId: string;
      workspaceId: string;
      taskId: string;
    };

    await ensureProjectExists(projectId, workspaceId);

    await deleteTask(projectId, taskId);
    res.status(204).send();
  } catch (error) {
    throw toAppError(error);
  }
}

async function ensureProjectExists(projectId: string, workspaceId: string) {
  const project = await getProject(projectId, workspaceId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError("Internal server error", 500);
}
