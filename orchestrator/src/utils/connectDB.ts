import mongoose from "mongoose"
import { EnvVariables } from "../constants/config.ts";

async function connectDB() {
  try {
    await mongoose.connect(EnvVariables.DB_URI);
    console.log("MongoDB connected");
  } catch (error: any) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB