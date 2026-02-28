import { TaskStatus } from "../enums/taskStatus.enum.js";
import { Task, type TaskType } from "../models/task.js";
import type { TasksRepository } from "../repositories/task.repository.js";
import { getBackoffTime } from "../utils/utilFunctions.js";
import { addTask } from "./tasks/add.js";

export class TasksService {
  constructor(private taskRepository: TasksRepository) {
    this.recoverTasksAfterCrash();
  }
  async add(task: TaskType) {
    return await addTask(this.taskRepository, task);
  }

  async getPendingTasksToRun() {
    return await this.taskRepository.getPendingTasksToRun();
  }

  async updateTaskStatusRunning(id: string) {
    return await this.taskRepository.updateTaskStatusRunning(id);
  }

  async updateTaskStatusFinished(id: string) {
    return await this.taskRepository.updateTaskStatusFinished(id);
  }

  async updateTaskStatusFailed(id: string) {
    return await this.taskRepository.updateTaskStatusFailed(id);
  }
  async recoverTasksAfterCrash(){
    return await this.taskRepository.recoverTasksAfterCrash();
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
