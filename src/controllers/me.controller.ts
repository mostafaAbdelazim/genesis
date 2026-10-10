import { Request, Response } from "express";
import { me } from "../services/me.service.js";

export async function meController(req: Request, res: Response) {
    try {
        const result = await me(req.user!.sub);
        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}