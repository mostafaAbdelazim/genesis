import type { Request, Response } from "express";
import { getHealth } from "../services/health.service.js";

export function healthController(_req: Request, res: Response) {
    const playload = getHealth();
    res.status(200).json(playload);
}