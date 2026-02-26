import { checkTransferComplianceWorker } from "../queues/workers/transfers/checkTransferComplianceWorker.ts";
import type { TaskType } from "../models/task.ts";
import { initaitePayoutWorker } from "../queues/workers/transfers/initiatePayoutWorker.ts";
import { quoteTransferWorker } from "../queues/workers/transfers/quoteTransferWorker.ts";
import { refundTransferWorker } from "../queues/workers/transfers/refundTransferWorker.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";
import { transfersReconciliationWorker } from "../queues/workers/transfers/transferReconciliationWorker.ts";

export const taskHandlerFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {
  [TaskHandlers.QUOTE_TRANSFER]: quoteTransferWorker,
  [TaskHandlers.CHECK_COMPLIANCE]: checkTransferComplianceWorker,
  [TaskHandlers.INITIATE_PAYOUT]: initaitePayoutWorker,
  [TaskHandlers.REFUND_TRANSFER]: refundTransferWorker,
  [TaskHandlers.TRIGGER_RECONCILIATION]: transfersReconciliationWorker,
};

export const taskHandlerFailFunctions: Record<
  string,
  (task: TaskType & { id: string }) => Promise<void>
> = {};
