import { Router } from "express";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { meController } from "../controllers/me.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerBodySchema, loginBodySchema, refreshBodySchema } from "../schemas/auth.schemas.js";

const router = Router();

router.post("/register", validate(registerBodySchema, "body"), asyncHandler(registerController));
router.post("/login", validate(loginBodySchema, "body"), asyncHandler(loginController));
router.post("/refresh", validate(refreshBodySchema, "body"), asyncHandler(refreshController));
router.post("/logout", validate(refreshBodySchema, "body"), asyncHandler(logoutController));

router.use(authMiddleware);
router.get("/me", asyncHandler(meController));

export default router;
