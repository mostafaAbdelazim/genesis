import { prisma } from "../lib/prisma.js";
import { WorkspaceRoleRank } from "../utils/workspace.role.rank.js";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteComment(
  taskId: string,
  id: string,
  userId: string,
  workspaceId: string,
) {
  const comment = await prisma.comment.findFirst({ where: { id, taskId } });
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership) {
    throw new AppError("You are not a member of this workspace", 403);
  }
  const isAuthor = comment.authorId === userId;
  const canModerate = WorkspaceRoleRank[membership.role] >= WorkspaceRoleRank[WorkspaceRole.ADMIN];
  if (!isAuthor && !canModerate) {
    throw new AppError("You are not the author of this comment", 403);
  }
  const count = await prisma.comment.deleteMany({ where: { id, taskId } });
  if (count.count === 0) {
    throw new AppError("Comment not found", 404);
  }
}
