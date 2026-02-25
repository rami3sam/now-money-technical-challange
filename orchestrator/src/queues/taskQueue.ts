import {
  taskHandlerFailFunctions,
  taskHandlerFunctions,
} from "../enums/taskHandlerFunctions.ts";
import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task } from "../models/task.ts";
import { getBackoffTime } from "../utils/utilFunctions.ts";

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

  return dbTask;
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
        if (taskHandlerFunctions[task.taskHandler])
          await taskHandlerFunctions[task.taskHandler]!(task);

        await Task.findByIdAndUpdate(task._id, {
          status: TaskStatus.FINISHED,
        }).exec();
      } catch (err) {
        if (task.retryCount > task.maxRetries) {
          const updatedTask = await Task.findOneAndUpdate(
            { _id: task._id, status: TaskStatus.RUNNING },
            {
              status: TaskStatus.FAILED,
            },
          ).exec();
          if (updatedTask && taskHandlerFailFunctions[task.taskHandler])
            await taskHandlerFailFunctions[task.taskHandler]!(task);
        } else {
          const updatedTask = await Task.findOneAndUpdate(
            { _id: task._id, status: TaskStatus.RUNNING },
            {
              status: TaskStatus.PENDING,
              $inc: { retryCount: 1 },
              executeAt: new Date(Date.now() + getBackoffTime(task.retryCount)),
            },
          ).exec();

          if (!updatedTask)
            console.error(
              `Failed to update task with id ${task._id} for retrying.`,
            );
        }
        console.error(`Error processing task with id ${task._id}:`, err);
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
