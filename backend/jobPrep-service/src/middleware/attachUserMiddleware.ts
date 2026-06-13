import { Request, Response, NextFunction } from "express";

export const attachUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const userHeader = req.headers["x-user"];

  if (userHeader) {
    req.user = JSON.parse(userHeader as string);
  }

  next();
};