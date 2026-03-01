import { EnvVariables } from "./constants/config.js";
import express, { json } from "express";
import quotesRoutes from "./routes/quotesRoutes.js";
import connectDB from "./utils/connectDB.js";
import healthRoutes from "./routes/healthRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { logger } from "./config/logger.js";
const PORT = EnvVariables.PORT;
const app = express();

app.use(json());
app.use("/quote", quotesRoutes);
app.use("/health", healthRoutes);
app.use(errorMiddleware);
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();
