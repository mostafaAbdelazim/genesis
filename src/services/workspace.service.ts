import { Workspace } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

export async function createWorkspace(
  userId: string,
  input: { name: string; slug: string },
): Promise<Workspace> {
  try {
    const { name, slug } = input;
    const found = await prisma.workspace.findFirst({
      where: {
        slug,
      },
    });
    if (found) {
      throw new AppError("Workspace with this slug already exists", 400);
    }
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });
    return workspace;
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to create workspace", 500);
  }
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
    return workspace;
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to get workspace", 500);
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to delete workspace", 500);
  }
}
