// src/middleware/error.middleware.js

import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;

  // Log full error details
  logger.error({
    message: err.message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    transferId: (req as any).locals?.transferId || "N/A"
  });

  // Send response to client
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
  });
}