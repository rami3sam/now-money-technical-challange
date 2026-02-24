export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export const TaskStatusValues = Object.values(TaskStatus);
