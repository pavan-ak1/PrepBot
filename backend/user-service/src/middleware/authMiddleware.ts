import type { NextFunction, Request, Response } from "express";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    next();
  } catch (err) {
    console.error("User Service Authentication Middleware Error:", err);
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
};
