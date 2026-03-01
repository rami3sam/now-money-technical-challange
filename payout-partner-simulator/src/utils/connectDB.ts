import mongoose from "mongoose";
import { EnvVariables } from "../constants/config.js";
import { logger } from "../config/logger.js";


async function connectDB() {
  try {
    await mongoose.connect(EnvVariables.DB_URI);
    logger.info("MongoDB connected");
  } catch (error: any) {
    logger.error("DB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB