import express, { json } from "express";
import { EnvVariables } from "./constants/config.js";
import connectDB from "./utils/connectDB.js";
import { runQueueWorker } from "./queues/taskQueue.js";
import { TasksRepository } from "./repositories/task.repository.js";
import { TasksService } from "./services/tasks.service.js";
import { PayoutsService } from "./services/payouts.service.js";
import { partnerPayoutsRoutes } from "./routes/partnerRoutes.js";
import { payoutsRoutes } from "./routes/payoutsRoutes.js";
import { PayoutsRepository } from "./repositories/payouts.repository.js";

const app = express();
const tasksRepository = new TasksRepository();
const tasksService = new TasksService(tasksRepository);
const payoutsRepository = new PayoutsRepository();
const payoutsService = new PayoutsService(payoutsRepository, tasksService);

app.use(json());

app.use("/partner", partnerPayoutsRoutes(payoutsService, tasksService));
app.use("/payouts", payoutsRoutes(payoutsService, tasksService));

export { app, tasksService, payoutsService };