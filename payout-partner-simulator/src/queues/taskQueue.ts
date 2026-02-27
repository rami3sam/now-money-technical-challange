import type { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task, type TaskTypeWithId } from "../models/task.ts";
import type { TasksService } from "../services/tasks.service.ts";

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
        const updatedTask = await tasksService.updateTaskStatus(
          task.id,
          TaskStatus.RUNNING,
        );
        if (taskHandlerFunctions[task.taskHandler])
          await taskHandlerFunctions[task.taskHandler]!(task);

        const finishedTask = await tasksService.updateTaskStatus(
          task.id,
          TaskStatus.FINISHED,
        );
      } catch (err) {
        if (task.retryCount > task.maxRetries) {
          const updatedTask = await tasksService.updateTaskStatus(
            task.id,
            TaskStatus.FAILED,
          );
          if (updatedTask && taskHandlerFailFunctions[task.taskHandler])
            await taskHandlerFailFunctions[task.taskHandler]!(task);
        } else {
          const updatedTask = await tasksService.scheduleTaskForRetry(task.id);

          if (!updatedTask)
            console.error(
              `Failed to update task with id ${task.id} for retrying.`,
            );
        }
        console.error(`Error processing task with id ${task.id}:`, err);
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
