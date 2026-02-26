import type { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import { TaskStatus } from "../../enums/taskStatus.enum.ts";
import { Task, type TaskType } from "../../models/task.ts";
import type { TasksRepository } from "../../repositories/task.repository.ts";

export async function addTask(
  taskRepository: TasksRepository,
  task: TaskType
) {
  const newTask = new Task({
    taskHandler: task.taskHandler,
    executeAt: task.executeAt,
    payload: task.payload,
    status: TaskStatus.PENDING,
  });
  const dbTask = await taskRepository.create(newTask);
  if (!dbTask) {
    throw new Error(
      `Failed to save task to database with info "${JSON.stringify(task)}"`,
    );
  }

  return dbTask;
}
