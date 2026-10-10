import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = verifyAccessToken(token);        
        if (decoded) {
            req.user = decoded;
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}