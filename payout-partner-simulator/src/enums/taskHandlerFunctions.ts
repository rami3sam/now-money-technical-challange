import { processPayoutWorker } from "../queues/workers/payout/processPayoutWorker.ts";
import { providePayoutStatusWorker } from "../queues/workers/payout/providePayoutStatus.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";

export const taskHandlerFunctions = {
  [TaskHandlers.PROCESS_PAYOUT]: processPayoutWorker,
  [TaskHandlers.PROVIDE_PAYOUT_STATUS]: providePayoutStatusWorker,
};

export const taskHandlerFailFunctions = {
  [TaskHandlers.PROCESS_PAYOUT]: processPayoutWorker,
  [TaskHandlers.PROVIDE_PAYOUT_STATUS]: providePayoutStatusWorker,
};
