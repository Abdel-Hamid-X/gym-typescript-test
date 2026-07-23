import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import plansRouter from "./routes/plans.js";
import adminRouter from "./routes/admin.js";
import equipmentRouter from "./routes/equipment.js";
import coachesRouter from "./routes/coaches.js";
import classesRouter from "./routes/classes.js";
import messagesRouter from "./routes/messages.js";
import coachPortalRouter from "./routes/coachPortal.js";
import path from "path";

dotenv.config();

export function createApp(): Express {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/uploads", express.static(path.resolve("uploads")));

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/plans", plansRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/equipment", equipmentRouter);
  app.use("/api/coaches", coachesRouter);
  app.use("/api/classes", classesRouter);
  app.use("/api/contact-messages", messagesRouter);
  app.use("/api/coach", coachPortalRouter);

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  if (!process.env.DATABASE_URL) {
    console.error("CRITICAL: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
