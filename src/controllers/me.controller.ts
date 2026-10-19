import { Request, Response } from "express";
import { me } from "../services/me.service.js";
import { AppError } from "../utils/AppError.js";

export async function meController(req: Request, res: Response) {
  try {
    const result = await me(req.user!.sub);
    if (!result) {
      throw new AppError("User not found", 404);
    }
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Internal server error", 500);
  }
}
