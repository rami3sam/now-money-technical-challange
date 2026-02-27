import express, { json } from "express";
import { EnvVariables } from "./constants/config.ts";
import connectDB from "./utils/connectDB.ts";
import { runQueueWorker } from "./queues/taskQueue.ts";
import { TasksRepository } from "./repositories/task.repository.ts";
import { TasksService } from "./services/tasks.service.ts";
import { PayoutsService } from "./services/payouts.service.ts";
import { partnerPayoutsRoutes } from "./routes/partnerRoutes.ts";
import { payoutsRoutes } from "./routes/payoutsRoutes.ts";
import { PayoutsRepository } from "./repositories/payouts.repository.ts";
import {
  getTaskErrorHandlers,
  getTaskHandlers,
} from "./utils/getTaskHandlers.ts";

const PORT = EnvVariables.PORT;
const app = express();
const tasksRepository = new TasksRepository();
const tasksService = new TasksService(tasksRepository);
const payoutsRepository = new PayoutsRepository();
const payoutsService = new PayoutsService(payoutsRepository, tasksService);

app.use(json());

app.use("/partner", partnerPayoutsRoutes(payoutsService, tasksService));
app.use("/payouts", payoutsRoutes(payoutsService, tasksService));

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
