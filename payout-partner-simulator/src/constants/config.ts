import dotenv from "dotenv"
dotenv.config()

export const EnvVariables = {
  PORT: process.env.PORT || 8001,
  DB_URI: process.env.DB_URI!,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET!,
}