import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export async function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ statusCode: err.statusCode, error: err.message });
  }
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ statusCode: 400, code: "VALIDATION_ERROR", error: err.issues[0].message });
  }
  if ("type" in err && (err as { type?: string }).type === "entity.too.large") {
    return res.status(413).json({ statusCode: 413, error: "Request body is too large" });
  }
  console.error(err);
  return res
    .status(500)
    .json({ statusCode: 500, code: "INTERNAL_SERVER_ERROR", error: "Internal server error" });
}
