import type { TaskType } from "../models/task.ts";
import { processPayoutWorker } from "../queues/workers/payout/processPayoutWorker.ts";
import { providePayoutStatusWorker } from "../queues/workers/payout/providePayoutStatus.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";

export const taskHandlerFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {
  [TaskHandlers.PROCESS_PAYOUT]: processPayoutWorker,
  [TaskHandlers.PROVIDE_PAYOUT_STATUS]: providePayoutStatusWorker,
};

export const taskHandlerFailFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {
  //add here the task error handlers
};
