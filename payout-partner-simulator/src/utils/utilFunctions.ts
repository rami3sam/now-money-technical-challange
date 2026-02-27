import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export const getBackoffTime = (
  attempt: number = 1,
  baseDelay: number = 500,
  factor: number = 2,
  maxDelay: number = 10000,
) => {
  const exponential = baseDelay * Math.pow(factor, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, maxDelay);
};

export function signHmac(secret: string, body: any) {
  const payload = JSON.stringify(body);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = hmac.digest("hex");

  return signature;
}
