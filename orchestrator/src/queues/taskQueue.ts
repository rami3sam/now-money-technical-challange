import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task } from "../models/task.ts";
import { checkTransferComplianceWorker } from "./workers/transfers/checkTransferComplianceWorker.ts";
import { initaitePayoutWorker } from "./workers/transfers/initiatePayoutWorker.ts";
import { quoteTransferWorker } from "./workers/transfers/quoteTransferWorker.ts";

let isRunning = false;

async function addToTaskQueue(task: {
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
  })
    .sort({ executeAt: 1 })
    .exec();
  do {
    const task = tasks.pop();
    if (task !== undefined) {
      try {
        const updatedTask = await Task.findByIdAndUpdate(task._id, {
          status: TaskStatus.RUNNING,
        }).exec();

        if (task.taskHandler === TaskHandlers.QUOTE_TRANSFER) {
          await quoteTransferWorker(task);
        } else if (task.taskHandler === TaskHandlers.CHECK_COMPLIANCE) {
          await checkTransferComplianceWorker(task);
        } else if (task.taskHandler === TaskHandlers.INITIATE_PAYOUT) {
          await initaitePayoutWorker(task);
        }

        await Task.findByIdAndUpdate(task._id, {
          status: TaskStatus.FINISHED,
        }).exec();
      } catch (err) {
        console.error(`Error processing task with id ${task}:`, err);
      }
    }

    while (tasks.length == 0) {
      tasks = await Task.find({
        executeAt: { $lte: new Date() },
        status: TaskStatus.PENDING,
      }).exec();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (true);
}

export { addToTaskQueue, runQueueWorker };
