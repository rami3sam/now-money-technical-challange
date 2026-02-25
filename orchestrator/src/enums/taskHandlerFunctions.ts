
import { checkTransferComplianceWorker } from "../queues/workers/transfers/checkTransferComplianceWorker.ts";
import { initaitePayoutWorker } from "../queues/workers/transfers/initiatePayoutWorker.ts";
import { markTransferFailedWorker } from "../queues/workers/transfers/makeTransferFailedWorker.ts";
import { quoteTransferWorker } from "../queues/workers/transfers/quoteTransferWorker.ts";
import { refundTransferWorker } from "../queues/workers/transfers/refundTransferWorker.ts";
import { TaskHandlers } from "./taskHandlers.enum.ts";

export const taskHandlerFunctions = {
  [TaskHandlers.QUOTE_TRANSFER]: quoteTransferWorker,
  [TaskHandlers.CHECK_COMPLIANCE]: checkTransferComplianceWorker,
  [TaskHandlers.INITIATE_PAYOUT]: initaitePayoutWorker,
  [TaskHandlers.REFUND_TRANSFER]: refundTransferWorker,
};

export const taskHandlerFailFunctions = {
  [TaskHandlers.QUOTE_TRANSFER]: markTransferFailedWorker,
  [TaskHandlers.CHECK_COMPLIANCE]: markTransferFailedWorker,
  [TaskHandlers.INITIATE_PAYOUT]: markTransferFailedWorker,
  [TaskHandlers.REFUND_TRANSFER]: markTransferFailedWorker,
};