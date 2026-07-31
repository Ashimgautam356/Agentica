import cors from "cors";
import express from "express";
import helmet from "helmet";
import { ApiError } from "./errors/api-error";
import { errorHandler, notFoundHandler } from "./errors/middleware";
import { adminRouter, publicRouter, superAdminRouter } from "./routes/index";

const defaultCorsOrigins = ["http://localhost:5173", "http://localhost:3000"];

function corsOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return configuredOrigins;
  }

  return Array.from(new Set([...configuredOrigins, ...defaultCorsOrigins]));
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || corsOrigins().includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new ApiError("FORBIDDEN", `CORS blocked origin: ${origin}`));
      },
    }),
  );
  app.use(express.json());

  app.use("/api", publicRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/super-admin", superAdminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
