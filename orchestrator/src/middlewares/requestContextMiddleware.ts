import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";
import {v7 as uuidv7} from "uuid";
export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  (req as any).locals = {
    correlationId: (req.headers["x-correlation-id"] as string) || uuidv7(),
  };

  res.setHeader("x-correlation-id", (req as any).locals.correlationId);
  next();
}
