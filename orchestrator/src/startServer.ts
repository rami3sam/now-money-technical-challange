import { app, tasksService, transfersService } from "./app.js";
import { logger } from "./config/logger.js";
import { EnvVariables } from "./constants/config.js";
import { runQueueWorker } from "./queues/taskQueue.js";
import connectDB from "./utils/connectDB.js";
import {
  getTaskErrorHandlers,
  getTaskHandlers,
} from "./utils/getTaskHandlers.js";
const PORT = EnvVariables.PORT;
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
  });
  runQueueWorker(
    tasksService,
    getTaskHandlers(transfersService),
    getTaskErrorHandlers(),
  );
}

startServer();
