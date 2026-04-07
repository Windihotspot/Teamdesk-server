import { Application } from "express";
import authRoutes from "./auth.routes";

export function registerRoutes(app: Application) {
  // All auth routes under /auth
  app.use("/auth", authRoutes);
}
