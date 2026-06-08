import dotenv from "dotenv";
dotenv.config();

import express, { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SERVICES } from "./config/services.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

console.log("Services:", SERVICES);

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
  })
);

app.use(
  "/api/v1/jobprep",
  createProxyMiddleware({
    target: SERVICES.JOBPREP,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/interview${path}`,

    on: {
      proxyReq: (proxyReq, req: Request) => {
        console.log("Incoming URL:", req.originalUrl);
        console.log("Forwarded URL:", proxyReq.path);
      },
    },
  })
);

app.use(
  "/api/v1/session",
  createProxyMiddleware({
    target: SERVICES.SESSION,
    changeOrigin: true,

    pathRewrite: (path) => `/api/v1/session${path}`,

    on: {
      proxyReq: (proxyReq, req: Request) => {
        console.log("Incoming URL:", req.originalUrl);
        console.log("Forwarded URL:", proxyReq.path);
      },
    },
  })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});