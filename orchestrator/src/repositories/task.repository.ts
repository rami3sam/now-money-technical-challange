import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Task, type TaskType } from "../models/task.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";

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
}
