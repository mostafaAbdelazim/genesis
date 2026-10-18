import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http_error.js";

export async function createComment(taskId: string, authorId: string, body: string) {
  return prisma.comment.create({
    data: {
      body,
      taskId,
      authorId,
    },
  });
}

export async function getComments(taskId: string) {
  return prisma.comment.findMany({
    where: {
      taskId,
    },
  });
}

export async function deleteComment(taskId: string, id: string, authorId: string) {
  const count = await prisma.comment.deleteMany({
    where: {
      id,
      authorId,
      taskId,
    },
  });
  if (count.count === 0) {
    throw new HttpError("Comment not found", 404);
  }
}
