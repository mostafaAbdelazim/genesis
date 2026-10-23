import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

type Target = "body" | "params" | "query";

export const validate =
  (schema: ZodTypeAny, target: Target): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      return next(parsed.error);
    }
    req[target] = parsed.data;
    next();
  };
