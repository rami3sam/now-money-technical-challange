import type { TaskType } from "../models/task.ts";
import { processPayoutWorker } from "../queues/workers/payout/processPayoutWorker.ts";
import { providePayoutStatusWorker } from "../queues/workers/payout/providePayoutStatus.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";

const emptyErrorHandler = async (task: TaskType & { id: string }) => {
  console.log(`No handler is specified for task  type ${task.taskHandler}`);
};

export const taskHandlerFunctions = {
  [TaskHandlers.PROCESS_PAYOUT]: processPayoutWorker,
  [TaskHandlers.PROVIDE_PAYOUT_STATUS]: providePayoutStatusWorker,
};

export const taskHandlerFailFunctions = {
  [TaskHandlers.PROCESS_PAYOUT]: emptyErrorHandler,
  [TaskHandlers.PROVIDE_PAYOUT_STATUS]: emptyErrorHandler,
};
