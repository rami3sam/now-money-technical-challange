import { logger } from "../config/logger.js";
import type { TaskHandlers } from "../enums/taskHandlers.enum.js";
import { TaskStatus } from "../enums/taskStatus.enum.js";
import { Task, type TaskTypeWithId } from "../models/task.js";
import type { TasksService } from "../services/tasks.service.js";

let isRunning = false;

async function runQueueWorker(
  tasksService: TasksService,
  taskHandlerFunctions: Record<
    TaskHandlers,
    (task: TaskTypeWithId) => Promise<void>
  >,
  taskHandlerFailFunctions: Record<
    TaskHandlers,
    (task: TaskTypeWithId) => Promise<void>
  >,
) {
  if (isRunning) return;
  isRunning = true;
  let tasks = await tasksService.getPendingTasksToRun();
  do {
    const task = tasks.pop();
    if (task !== undefined) {
      try {
        const updatedTask = await tasksService.updateTaskStatusRunning(task.id);
        if (taskHandlerFunctions[task.taskHandler])
           await taskHandlerFunctions[task.taskHandler](task)

        const finishedTask = await tasksService.updateTaskStatusFinished(
          task.id,
        );
      } catch (err: any) {
        if (task.retryCount > task.maxRetries) {
          const updatedTask = await tasksService.updateTaskStatusFailed(
            task.id,
          );
          if (updatedTask && taskHandlerFailFunctions[task.taskHandler])
            await taskHandlerFailFunctions[task.taskHandler]!(task);
        } else {
          const updatedTask = await tasksService.scheduleTaskForRetry(task.id);

          if (!updatedTask)
            logger.error(
              `Failed to update task with id ${task.id} for retrying.`,
            );
        }
        logger.error(`Error processing task with id ${task.id}:`, err);
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
