import { Router } from "express";
import { registerController, loginController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { meController } from "../controllers/me.controller.js";
const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.use(authMiddleware);
router.get("/me", meController);

export default router;