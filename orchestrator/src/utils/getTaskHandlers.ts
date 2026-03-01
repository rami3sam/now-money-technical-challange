import { TaskHandlers } from "../enums/taskHandlers.enum.js";
import type { TaskType, TaskTypeWithId } from "../models/task.js";
import type { TransfersService } from "../services/transfers.service.js";

export function getTaskHandlers(transferService: TransfersService) {
  return {
    [TaskHandlers.CHECK_COMPLIANCE]: (task: TaskTypeWithId) =>
      transferService.checkTransferCompliance(task.payload as string),
    [TaskHandlers.INITIATE_PAYOUT]: (task: TaskTypeWithId) =>
      transferService.initiatePayout(task.payload as string),
    [TaskHandlers.REFUND_TRANSFER]: (task: TaskTypeWithId) =>
      transferService.refundTransfer(task.payload as string),
    [TaskHandlers.TRIGGER_RECONCILIATION]: (task: TaskTypeWithId) =>
      transferService.reconciliateTransfers(
        task.payload.startDate,
        task.payload.endDate,
      ),
  } as any;
}

export function getTaskErrorHandlers(): Record<
  string,
  (task: TaskType) => Promise<any>
> {
  return {}
}
