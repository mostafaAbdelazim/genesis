import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export async function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "Validation failed", code: "VALIDATION_ERROR", details: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
