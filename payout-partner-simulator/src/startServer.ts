import { app, payoutsService, tasksService } from "./app.js";
import { logger } from "./config/logger.js";
import { EnvVariables } from "./constants/config.js";
import { runQueueWorker } from "./queues/taskQueue.js";
import connectDB from "./utils/connectDB.js";
import {
  getTaskErrorHandlers,
  executeTask as getTaskHandlers,
} from "./utils/getTaskHandlers.js";

const PORT = EnvVariables.PORT;

async function startServer() {
  await connectDB();
  runQueueWorker(
    tasksService,
    getTaskHandlers(payoutsService),
    getTaskErrorHandlers(),
  );

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();
