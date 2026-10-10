import { prisma } from "../lib/prisma.js";

export async function me(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { passwordHash: true },
    });
    return user;
}