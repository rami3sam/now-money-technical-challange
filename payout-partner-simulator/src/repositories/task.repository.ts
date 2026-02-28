import { TaskStatus } from "../enums/taskStatus.enum.js";
import { Task, type TaskType } from "../models/task.js";

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

  async updateTaskStatusRunning(id: string) {
    return await Task.findOneAndUpdate(
      { _id: id, status: TaskStatus.PENDING },
      { status: TaskStatus.RUNNING },
      { returnDocument: "after" },
    ).exec();
  }

  async updateTaskStatusFinished(id: string) {
    return await Task.findOneAndUpdate(
      { _id: id, status: TaskStatus.RUNNING },
      { status: TaskStatus.FINISHED },
      { returnDocument: "after" },
    ).exec();
  }

  async updateTaskStatusFailed(id: string) {
    return await Task.findOneAndUpdate(
      { _id: id, status: TaskStatus.RUNNING },
      { status: TaskStatus.FAILED },
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

  scheduleFailedTaskForRetry(id: string, retryDate: Date) {
    return Task.findOneAndUpdate(
      { _id: id, status: TaskStatus.RUNNING },
      {
        $set: { status: TaskStatus.PENDING, executeAt: retryDate },
        $inc: { retryCount: 1 },
      },
      { returnDocument: "after" },
    ).exec();
  }
}
