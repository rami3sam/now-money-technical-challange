import dotenv from "dotenv";
dotenv.config();

export const EnvVariables = {
  PORT: process.env.PORT || 8002,
  DB_URI: process.env.DB_URI!,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET!,
  ORCHESTRATOR_SERVICE_URL: process.env.ORCHESTRATOR_SERVICE_URL!,
} as const;
