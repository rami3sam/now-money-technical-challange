import { TaskStatus } from "../enums/taskStatus.enum.ts";
import type { TaskType } from "../models/task.ts";
import type { TasksRepository } from "../repositories/task.repository.ts";
import { getBackoffTime } from "../utils/utilFunctions.ts";
import { addTask } from "./tasks/add.ts";

export class TasksService {
  constructor(private taskRepository: TasksRepository) {}
  async add(task: TaskType) {
    return await addTask(this.taskRepository, task);
  }

  async getPendingTasksToRun() {
    return await this.taskRepository.getPendingTasksToRun();
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    return await this.taskRepository.updateTaskStatus(id, status);
  }

  async scheduleTaskForRetry(id: string, retryDate?: Date) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw Error(`Task with id ${id} not found`);
    if (!retryDate) {
      retryDate = new Date(Date.now() + getBackoffTime(task.retryCount));
    }
    return await this.taskRepository.scheduleFailedTaskForRetry(id, retryDate);
  }
}
