import express, { json, response, type Request, type Response } from "express";
import connectDB from "./utils/connectDB.js";
import { EnvVariables } from "./constants/config.js";
import { runQueueWorker } from "./queues/taskQueue.js";
import { TasksService } from "./services/tasks.service.js";
import { TasksRepository } from "./repositories/task.repository.js";
import { TransfersRepository } from "./repositories/transfers.repository.js";
import { TransfersService } from "./services/transfers.service.js";
import { transfersRoutes } from "./routes/transfersRoutes.js";
import { webhookRoutes } from "./routes/webhooks.js";

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

export { app, tasksService, transfersService };