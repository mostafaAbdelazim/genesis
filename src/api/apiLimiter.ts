import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError.js";
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new AppError("Too many requests, please try again later.", 429));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new AppError("Too many login attempts, please try again later.", 429));
  },
});
