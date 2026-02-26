import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import type { TaskType, TaskTypeWithId } from "../models/task.ts";
import type { TransfersService } from "../services/transfers.service.ts";

export function getTaskHandlers(transferService: TransfersService) {
  return {
    [TaskHandlers.CHECK_COMPLIANCE]: (task: TaskTypeWithId) => {
      transferService.checkTransferCompliance(task.payload as string);
    },
    [TaskHandlers.INITIATE_PAYOUT]: (task: TaskTypeWithId) => {
      transferService.initiatePayout(task.payload as string);
    },
    [TaskHandlers.REFUND_TRANSFER]: (task: TaskTypeWithId) => {
      transferService.refundTransfer(task.payload as string);
    },
    [TaskHandlers.TRIGGER_RECONCILIATION]: (task: TaskTypeWithId) => {
      const { startDate, endDate } = task.payload as {
        startDate: Date;
        endDate: Date;
      };
      transferService.reconciliateTransfers(startDate, endDate);
    },
  } as Record<TaskHandlers, (task: TaskTypeWithId) => Promise<void>>;
}

export function getTaskErrorHandlers(): Record<
  string,
  (task: TaskType) => Promise<any>
> {
  return {} as Record<string, (task: TaskType) => Promise<any>>;
}
