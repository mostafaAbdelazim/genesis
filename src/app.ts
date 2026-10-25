import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiLimiter } from "./api/apiLimiter.js";
import { env } from "./config/env.js";
import { AppError } from "./utils/AppError.js";
const app = express();

app.use(helmet());

const origins = env.corsOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new AppError("Not allowed by CORS", 403));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use(morgan("dev"));

app.use(apiLimiter);

app.use("/api/v1", routes);

app.use(errorMiddleware);
export default app;
