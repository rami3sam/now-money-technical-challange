import dotenv from "dotenv"
dotenv.config()

export const EnvVariables = {
  PORT: process.env.PORT || 8000,
  DB_URI: process.env.DB_URI,
  CANCELLATION_FEE_PERCENTAGE: Number(process.env.CANCELLATION_FEE_PERCENTAGE) || 0.01, // 1 percent
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET!,
  RECONCILIATION_TOLERANCE: Number(process.env.RECONCILIATION_TOLERANCE) || 0.01,
}

