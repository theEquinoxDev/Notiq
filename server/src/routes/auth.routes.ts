import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import rateLimitMiddleware from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", rateLimitMiddleware, register);
router.post("/login", rateLimitMiddleware, login);

export default router;