import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./shared/config/config";
import { registerRoutes } from "./routes";
import { setupSwagger } from "./shared/swagger/swagger";

export function buildApp(): Application {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://unpkg.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  // CORS
  const origins =
    config.CORS_ALLOWED_ORIGINS === "*"
      ? true
      : config.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin: origins,
      credentials: config.CORS_ALLOW_CREDENTIALS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Device-ID",
        "X-App-Version",
        "X-App-Build",
        "X-Device-Model",
        "X-OS",
        "X-OS-Version",
      ],
    }),
  );

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Swagger UI
  setupSwagger(app);

  // Register all routes
  registerRoutes(app);

  return app;
}
