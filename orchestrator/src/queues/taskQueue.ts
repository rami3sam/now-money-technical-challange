import type { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task, type TaskType, type TaskTypeWithId } from "../models/task.ts";
import { getBackoffTime } from "../utils/utilFunctions.ts";

let isRunning = false;

async function runQueueWorker(
  taskHandlerFunctions: Record<TaskHandlers, ((task: TaskTypeWithId) => Promise<void>)>,
  taskHandlerFailFunctions: Record<TaskHandlers, ((task: TaskTypeWithId) => Promise<void>)>,
) {
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
            { returnDocument: "after" },
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
            { returnDocument: "after" },
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

export { runQueueWorker };
