import { prisma } from "../lib/prisma.js";
import { Membership } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
export async function getMembership(
  workspaceId: string,
  userId: string,
): Promise<Membership | null> {
  try {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });
    return membership;
  } catch (error) {
    console.error(error);
    throw new AppError("Failed to get membership", 500);
  }
}
