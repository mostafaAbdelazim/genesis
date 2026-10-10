import { Request, Response } from "express";
import { register, login } from "../services/auth.service.js";

export async function registerController(req: Request, res: Response) {
    try {
        const result = await register(req.body.email, req.body.password, req.body.name);
        res.status(201).json(result);
    } catch (error) {
        handleError(error as Error, res);
    }
}

export async function loginController(req: Request, res: Response) {
    try {
        const result = await login(req.body.email, req.body.password);
        res.status(200).json(result);
    } catch (error) {
        handleError(error as Error, res);
    }
}

function handleError(error: Error, res: Response) {
    const message = (error as Error).message;
    if (message === "Invalid credentials") return res.status(401).json({ error: message });
    if (message === "Email already in use") return res.status(409).json({ error: message });
    if (message.startsWith("Invalid") || message.includes("required")) {
        return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: "Internal server error" });
}