import type { TaskType } from "../models/task.ts";
import type { TasksRepository } from "../repositories/task.repository.ts";
import { addTask } from "./tasks/add.ts";


export class TasksService {
  constructor(private taskRepository: TasksRepository) {}
  async add(task: TaskType) {
    return await addTask(this.taskRepository, task);
  }
}
