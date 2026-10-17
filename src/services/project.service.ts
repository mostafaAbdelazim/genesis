import { prisma } from "../lib/prisma.js";
import { Project } from "@prisma/client";

export async function createProject(
  name: string,
  description: string | undefined,
  workspaceId: string,
): Promise<Project> {
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        workspaceId,
      },
    });
    return project;
  } catch (error) {
    throw new Error("Failed to create project");
  }
}

export async function getProjects(workspaceId: string): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  } catch (error) {
    throw new Error("Failed to get projects");
  }
}

export async function getProject(projectId: string, workspaceId: string): Promise<Project | null> {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });
    return project;
  } catch (error) {
    throw new Error("Failed to get project");
  }
}

export async function deleteProject(projectId: string, workspaceId: string): Promise<number> {
  try {
    const result = await prisma.project.deleteMany({
      where: {
        id: projectId,
        workspaceId,
      },
    });
    return result.count;
  } catch (error) {
    throw new Error("Failed to delete project");
  }
}
