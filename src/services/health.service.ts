export function getHealth(): { status: string; uptime: number } {
    return {
        status: "ok" as const,
        uptime: process.uptime(),
    };
};