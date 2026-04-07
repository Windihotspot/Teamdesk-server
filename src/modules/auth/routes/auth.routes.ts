import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authGuard } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// 🔐 Protected route
router.post(
  "/invite",
  authGuard,
  requireRole("owner", "admin"),
  AuthController.invite,
);

export default router;
