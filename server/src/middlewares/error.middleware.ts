import type { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
};

export default errorHandler;
