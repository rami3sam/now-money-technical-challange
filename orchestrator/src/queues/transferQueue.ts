import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Task, type TaskType } from "../models/task.ts";
import { Transfer } from "../models/transfer.ts";
import { LinkedQueue } from "../utils/queue.ts";
import {
  checkTransferCompliance,
  initaitePayout,
  quoteTransferWorker,
} from "./workers/transferWorkers.ts";

let isRunning = false;

async function addToTransferQueue(task: {
  taskHandler: TaskHandlers;
  payload: any;
  executeAt?: Date;
}) {
  const newTask = new Task({
    taskHandler: task.taskHandler,
    executeAt: task.executeAt,
    payload: task.payload,
    status: TaskStatus.PENDING,
  });
  const dbTask = await newTask.save();
  if (!dbTask) {
    throw new Error(
      `Failed to save task to database with info "${JSON.stringify(task)}"`,
    );
  }
}

async function runQueueWorker() {
  if (isRunning) return;
  isRunning = true;
  let tasks = await Task.find({
    executeAt: { $lte: new Date() },
    status: TaskStatus.PENDING,
  }).exec();
  do {
    const task = tasks.pop();
    if (task == undefined) break;

    try {
      if (task.taskHandler === TaskHandlers.QUOTE_TRANSFER) {
        await quoteTransferWorker(task.payload);
      } else if (task.taskHandler === TaskHandlers.CHECK_COMPLIANCE) {
        await checkTransferCompliance(task.payload);
      } else if (task.taskHandler === TaskHandlers.INITIATE_PAYOUT) {
        await initaitePayout(task.payload);
      }

      await Task.findByIdAndUpdate(task._id, {
        status: TaskStatus.FINISHED,
      }).exec();
    } catch (err) {
      console.error(`Error processing task with id ${task}:`, err);
    }

    while (tasks.length == 0) {
      tasks = await Task.find({
        executeAt: { $lte: new Date() },
        status: TaskStatus.PENDING,
      }).exec();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (true);

  isRunning = false;
}

export { addToTransferQueue, runQueueWorker };
