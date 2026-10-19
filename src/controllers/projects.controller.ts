import { Request, Response } from "express";
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
} from "../services/project.service.js";
import { AppError } from "../utils/AppError.js";

export async function createProjectController(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const workspaceId = req.params.workspaceId as string;
    if (!name) {
      throw new AppError("Project name is required", 400);
    }
    const project = await createProject(name, description, workspaceId);
    res.status(201).json(project);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getProjectsController(req: Request, res: Response) {
  try {
    const workspaceId = req.params.workspaceId as string;
    const projects = await getProjects(workspaceId);
    res.status(200).json(projects);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getProjectController(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const workspaceId = req.params.workspaceId as string;
    const project = await getProject(projectId, workspaceId);
    if (!project) throw new AppError("Project not found", 404);
    res.status(200).json(project);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteProjectController(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const workspaceId = req.params.workspaceId as string;
    const count = await deleteProject(projectId, workspaceId);
    if (count === 0) throw new AppError("Project not found", 404);
    res.status(200).json({ message: "Project deleted successfully" });
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
