import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task } from "../models/task.ts";
import { providePayoutStatusWorker } from "./workers/payout/providePayoutStatus.ts";
import { processPayout } from "./workers/payout/processPayout.ts";

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

        if (task.taskHandler === TaskHandlers.PROVIDE_PAYOUT_STATUS) {
          const { payoutId } = task.payload;
          await providePayoutStatusWorker(payoutId);
        } else if (task.taskHandler === TaskHandlers.PROCESS_PAYOUT) {
          const { payoutId } = task.payload;
          await processPayout(payoutId);
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

  isRunning = false;
}

export { addToTaskQueue, runQueueWorker };
