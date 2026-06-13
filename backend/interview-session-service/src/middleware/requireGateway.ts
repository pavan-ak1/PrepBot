import { Request, Response, NextFunction } from "express";

export const requireGateway = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  next();
};