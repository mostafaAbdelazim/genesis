import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
export async function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
  
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
