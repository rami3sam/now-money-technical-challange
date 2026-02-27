import { app, payoutsService, tasksService } from "./app.ts";
import { EnvVariables } from "./constants/config.ts";
import { runQueueWorker } from "./queues/taskQueue.ts";
import connectDB from "./utils/connectDB.ts";
import {
  getTaskErrorHandlers,
  getTaskHandlers,
} from "./utils/getTaskHandlers.ts";

const PORT = EnvVariables.PORT;

async function startServer() {
  await connectDB();
  runQueueWorker(
    tasksService,
    getTaskHandlers(payoutsService),
    getTaskErrorHandlers(),
  );

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
