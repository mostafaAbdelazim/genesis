import type { Request, Response } from "express";
import { getHealth } from "../services/health.service.js";

export async function healthController(_req: Request, res: Response) {
    const payload = await getHealth();
    const code = payload.database === "up" ? 200 : 503;
    res.status(code).json(payload);
}