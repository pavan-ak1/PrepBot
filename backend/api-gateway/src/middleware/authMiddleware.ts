import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

interface JwtUserPayload {
  id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

const isJwtUserPayloadValid = (payload: any): payload is JwtUserPayload => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.id === "string" &&
    typeof payload.username === "string" &&
    typeof payload.email === "string"
  );
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token not provided", status: false });
    }

    const isBlacklisted = await redisClient.get(token);

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token is blacklisted",
        success: false,
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT SECRET not found");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isJwtUserPayloadValid(decoded)) {
      return res.status(401).json({
        message: "Invalid token payload",
        success: false,
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("API Gateway Authentication Middleware Error:", err);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};
