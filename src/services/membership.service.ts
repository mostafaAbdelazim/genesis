import { prisma } from "../lib/prisma.js";
import { Membership } from "@prisma/client";

export async function getMembership(workspaceId: string, userId: string): Promise<Membership | null> {
    try {
        const membership = await prisma.membership.findUnique({
            where: {
                userId_workspaceId: { userId, workspaceId },

            },
        });
        return membership;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get membership");
    }
}