import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load environment variables from parent folders if available
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "./config/services.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "UP",
    service: "API Gateway",
    timestamp: new Date(),
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: SERVICES.USER,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/auth${path}`,

    on: {
      proxyReq: (proxyReq, req: Request) => {
        console.log("Incoming URL:", req.originalUrl);
        console.log("Forwarded URL:", proxyReq.path);
      },
    },
  }),
);

app.use(
  "/api/v1/jobprep",
  authenticateUser,
  createProxyMiddleware({
    target: SERVICES.JOBPREP,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/interview${path}`,

    on: {
      proxyReq: (proxyReq, req: Request) => {
        if (req.user) {
          proxyReq.setHeader("x-user", JSON.stringify(req.user));
        }

        console.log("Incoming URL:", req.originalUrl);
        console.log("Forwarded URL:", proxyReq.path);
      },
    },
  }),
);

app.use(
  "/api/v1/session",
  authenticateUser,
  createProxyMiddleware({
    target: SERVICES.SESSION,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/session${path}`,

    on: {
      proxyReq: (proxyReq, req: Request) => {
        if (req.user) {
          proxyReq.setHeader("x-user", JSON.stringify(req.user));
        }

        console.log("Incoming URL:", req.originalUrl);
        console.log("Forwarded URL:", proxyReq.path);
      },
    },
  }),
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});
