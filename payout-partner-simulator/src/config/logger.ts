// logger.js
import winston from "winston";
import "winston-mongodb";
import { EnvVariables } from "../constants/config.js";
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.MongoDB({
      db: EnvVariables.DB_URI,
      collection: "app_logs",
      level: "info",
      options: { useUnifiedTopology: true },
      tryReconnect: true,
    }),
  ],
});
