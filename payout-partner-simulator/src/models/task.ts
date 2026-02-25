import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { TaskStatus, TaskStatusValues } from "../enums/taskStatus.enum.ts";
import { TaskHandlerValues } from "../enums/taskHandlers.enum.ts";

export const taskSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: TaskStatusValues,
    required: true,
    default: TaskStatus.PENDING,
  },
  payload: {
    type: Schema.Types.Mixed,
  },
  taskHandler: {
    type: String,
    enum: TaskHandlerValues,
    required: true,
  },
  executeAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  maxRetries: {
    type: Number,
    default: 5,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
});

export const Task = mongoose.model("Tasks", taskSchema);
export type TaskType = InferSchemaType<typeof taskSchema>;
