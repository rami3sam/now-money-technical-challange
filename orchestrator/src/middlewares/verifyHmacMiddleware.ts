import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export function verifyHmacMiddleware(secret: string, headerName = "X-Signature") {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawBody = (req as any).rawBody;
    const signature = req.header(headerName);

    if (!signature) {
      return res.status(400).send("Missing signature header");
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");

    const isValid =
      signature.length === digest.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));

    if (!isValid) return res.status(401).send("Invalid signature");

    next();
  };
}