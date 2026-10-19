import { Request, Response } from "express";
import { register, login, refresh, logout } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export async function registerController(req: Request, res: Response) {
  try {
    const result = await register(req.body.email, req.body.password, req.body.name);
    res.status(201).json(result);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const result = await login(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function refreshController(req: Request, res: Response) {
  try {
    const result = await refresh(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    await logout(req.body.refreshToken);
    res.status(204).send();
  } catch (error) {
    throw toAppError(error);
  }
}

function toAppError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : "Internal server error";
  if (message === "Invalid credentials" || message === "Invalid refresh token") {
    return new AppError(message, 401);
  }
  if (message === "Email already in use") {
    return new AppError(message, 409);
  }
  if (message.startsWith("Invalid") || message.includes("required")) {
    return new AppError(message, 400);
  }
  return new AppError("Internal server error", 500);
}
