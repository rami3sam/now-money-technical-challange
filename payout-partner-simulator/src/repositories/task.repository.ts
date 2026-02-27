import { TaskStatus } from "../enums/taskStatus.enum.ts";
import { Task, type TaskType } from "../models/task.ts";

export class TasksRepository {
  findById(id: string) {
    return Task.findById(id).exec();
  }

  async create(data: TaskType) {
    const newTask = await Task.create(data);
    const savedTask = await newTask.save();
    if (!savedTask) throw new Error("Failed to save task");
    return savedTask;
  }

  async updateTask(id: string, updates: Partial<TaskType>) {
    const task = await Task.findById(id).exec();
    if (!task) throw Error(`Task with id ${id} not found`);

    return Task.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after" },
    ).exec();
  }

  findBetweenDates(startDate: Date, endDate: Date) {
    return Task.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();
  }

  getPendingTasksToRun() {
    return Task.find({
      executeAt: { $lte: new Date() },
      status: TaskStatus.PENDING,
    })
      .sort({ executeAt: 1 })
      .exec();
  }

  updateTaskStatus(id: string, status: TaskStatus) {
    return Task.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { returnDocument: "after" },
    ).exec();
  }

    scheduleFailedTaskForRetry(id: string, retryDate: Date) {
      return Task.findByIdAndUpdate(
        id,
        {
          status: TaskStatus.PENDING,
          $inc: { retryCount: 1 },
          executeAt: retryDate,
        },
        { returnDocument: "after" },
      ).exec();
    }
  
}
