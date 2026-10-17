import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/http_error.js";

export async function createTask(
  projectId: string,
  input: { title: string; description?: string; assignedId?: string },
) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      assigneeId: input.assignedId,
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

export async function getTask(id: string, projectId: string) {
  const task = await prisma.task.findFirst({
    where: { id: id, projectId: projectId },
  });
  if (task === null) {
    throw new HttpError("Task not found", 404);
  }
  return task;
}

export async function updateTask(
  id: string,
  projectId: string,
  data: {
    title?: string;
    description?: string;
    assignedId?: string;
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

export async function deleteTask(id: string, projectId: string) {
  const result = await prisma.task.deleteMany({
    where: { id: id, projectId: projectId },
  });
  if (result.count === 0) {
    throw new HttpError("Task not found", 404);
  }
}
