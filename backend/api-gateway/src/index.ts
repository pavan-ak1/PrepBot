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

app.get("/health", async (_, res) => {
  const services = [
    { id: "user", name: "User Service", url: SERVICES.USER ? `${SERVICES.USER}/api/v1/auth/health` : null },
    { id: "jobprep", name: "JobPrep Service", url: SERVICES.JOBPREP ? `${SERVICES.JOBPREP}/api/v1/interview/health` : null },
    { id: "session", name: "Session Service", url: SERVICES.SESSION ? `${SERVICES.SESSION}/health` : null },
  ];

  const results: Record<string, "online" | "loading"> = {
    gateway: "online",
  };

  await Promise.all(
    services.map(async (service) => {
      if (!service.url) {
        results[service.id] = "loading";
        return;
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        
        const response = await fetch(service.url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          results[service.id] = "online";
        } else {
          results[service.id] = "loading";
        }
      } catch (err) {
        results[service.id] = "loading";
      }
    })
  );

  const allOnline = Object.values(results).every((status) => status === "online");

  res.status(200).json({
    status: allOnline ? "UP" : "WARMING_UP",
    services: results,
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

app.get("/api/v1/auth/logout", authenticateUser, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const { default: redisClient } = await import("./config/redis.js");
        const redisJwtTtl = process.env.REDIS_JWT_TTL
          ? parseInt(process.env.REDIS_JWT_TTL, 10)
          : 60 * 60 * 24 * 10; // Default to 10 days (864000 seconds)
        if (redisClient.isOpen) {
          await redisClient.set(token, "blacklisted", {
            EX: redisJwtTtl,
          });
        } else {
          console.warn("Redis client is not open. Skipping token blacklisting.");
        }
      }
    }
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Gateway logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
});

app.use(
  "/api/v1/auth",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.split("?")[0].endsWith("/getMe")) {
      return authenticateUser(req, res, next);
    }
    next();
  },
  createProxyMiddleware({
    target: SERVICES.USER,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/auth${path}`,

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

const port = process.env.PORT || process.env.PORT_API_GATEWAY || 3000;

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});
