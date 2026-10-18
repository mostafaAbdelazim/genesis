import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/http_error.js";

export async function createTask(
  projectId: string,
  input: { title: string; description?: string; assigneeId?: string },
) {
  return prisma.task.create({
    data: {
      ...input,
      projectId,
    },
  });
}

export async function getTasks(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      projectId: projectId,
    },
  });
  return tasks;
}

export async function getTask(projectId: string, id: string) {
  return await prisma.task.findFirst({ where: { id: id, projectId: projectId } });
}

export async function updateTask(
  projectId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    assigneeId?: string;
    status?: Prisma.TaskUpdateInput["status"];
    priority?: Prisma.TaskUpdateInput["priority"];
  },
) {
  const result = await prisma.task.updateManyAndReturn({
    where: { id: id, projectId: projectId },
    data,
  });
  if (result.length === 0) {
    throw new HttpError("Task not found", 404);
  }
  return result[0];
}

export async function deleteTask(projectId: string, id: string) {
  const result = await prisma.task.deleteMany({
    where: { id: id, projectId: projectId },
  });
  if (result.count === 0) {
    throw new HttpError("Task not found", 404);
  }
}
