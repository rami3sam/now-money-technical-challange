import express, { json, response, type Request, type Response } from "express";
import connectDB from "./utils/connectDB.ts";
import { EnvVariables } from "./constants/config.ts";
import { runQueueWorker } from "./queues/taskQueue.ts";
import { TasksService } from "./services/tasks.service.ts";
import { TasksRepository } from "./repositories/task.repository.ts";
import { TransfersRepository } from "./repositories/transfers.repository.ts";
import { TransfersService } from "./services/transfers.service.ts";
import { transfersRoutes } from "./routes/transfersRoutes.ts";
import { webhookRoutes } from "./routes/webhooks.ts";
import {
  getTaskErrorHandlers,
  getTaskHandlers,
} from "./utils/getTaskHandlers.ts";

const PORT = EnvVariables.PORT;
const app = express();
const taskRepository = new TasksRepository();
const tasksService = new TasksService(taskRepository);
const transfersRepository = new TransfersRepository();
const transfersService = new TransfersService(
  transfersRepository,
  tasksService,
);

app.use(
  express.json({
    verify: (req: Request, res: Response, buf: any) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use("/transfers", transfersRoutes(transfersService));
app.use("/webhooks", webhookRoutes(transfersService, tasksService));

async function startServer() {
  await connectDB(EnvVariables.DB_URI);

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
