import { checkTransferComplianceWorker } from "../queues/workers/transfers/checkTransferComplianceWorker.ts";
import type { TaskType } from "../models/task.ts";
import { initaitePayoutWorker } from "../queues/workers/transfers/initiatePayoutWorker.ts";
import { quoteTransferWorker } from "../queues/workers/transfers/quoteTransferWorker.ts";
import { refundTransferWorker } from "../queues/workers/transfers/refundTransferWorker.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";
import { markTransferFailedWorker } from "../queues/workers/transfers/markTransferFailedWorker.ts";

export const taskHandlerFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {
  [TaskHandlers.QUOTE_TRANSFER]: quoteTransferWorker,
  [TaskHandlers.CHECK_COMPLIANCE]: checkTransferComplianceWorker,
  [TaskHandlers.INITIATE_PAYOUT]: initaitePayoutWorker,
  [TaskHandlers.REFUND_TRANSFER]: refundTransferWorker,
  [TaskHandlers.MARK_TRANSFER_FAILED]: markTransferFailedWorker,
};

export const taskHandlerFailFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {
  [TaskHandlers.QUOTE_TRANSFER]: markTransferFailedWorker,
};
