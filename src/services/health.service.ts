import { prisma } from "../lib/prisma.js";

export async function getHealth(): Promise<{ status: "ok" | "error"; database: "up" | "down"; uptime: number; }> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: "ok",
            database: "up",
            uptime: process.uptime(),
        };
    } catch (error) {
        console.error("database health check failed", error);
        return {
            status: "error",
            database: "down",
            uptime: process.uptime(),
        };
    }
};