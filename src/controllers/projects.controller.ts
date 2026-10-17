import { Request, Response } from "express";
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
} from "../services/project.service.js";

export async function createProjectController(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const workspaceId = req.params.workspaceId as string;
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }
    const project = await createProject(name, description, workspaceId);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
}

export async function getProjectsController(req: Request, res: Response) {
  try {
    const workspaceId = req.params.workspaceId as string;
    const projects = await getProjects(workspaceId);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to get projects" });
  }
}

export async function getProjectController(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const workspaceId = req.params.workspaceId as string;
    const project = await getProject(projectId, workspaceId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to get project" });
  }
}

export async function deleteProjectController(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId as string;
    const workspaceId = req.params.workspaceId as string;
    const count = await deleteProject(projectId, workspaceId);
    if (count === 0) return res.status(404).json({ error: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
}
