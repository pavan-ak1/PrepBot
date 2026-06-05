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

const isJwtUserPayloadValid = (
  payload: unknown,
): payload is JwtUserPayload => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "username" in payload &&
    "email" in payload &&
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
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];


    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    const isBlacklisted = await redisClient.get(token);


    if (isBlacklisted) {

      return res.status(401).json({
        success: false,
        message: "Token is blacklisted",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET not found");
    }

    let decoded: unknown;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (!isJwtUserPayloadValid(decoded)) {

      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }
    
    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};