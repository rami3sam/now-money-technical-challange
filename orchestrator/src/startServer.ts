import { app, tasksService, transfersService } from "./app.js";
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
    console.log(`Server running on port ${PORT}`);
  });
  runQueueWorker(
    tasksService,
    getTaskHandlers(transfersService),
    getTaskErrorHandlers(),
  );
}

startServer();
