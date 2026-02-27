import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import type { TaskType, TaskTypeWithId } from "../models/task.ts";
import type { PayoutsService } from "../services/payouts.service.ts";

export function getTaskHandlers(payoutsService: PayoutsService) {
  return {
    [TaskHandlers.PROCESS_PAYOUT]: (task: TaskTypeWithId) => {
      payoutsService.processPayout(task.payload as string);
    },
    [TaskHandlers.PROVIDE_PAYOUT_STATUS]: (task: TaskTypeWithId) => {
      payoutsService.providePayoutStatus(task.payload as string);
    },
  } as Record<TaskHandlers, (task: TaskTypeWithId) => Promise<void>>;
}

export function getTaskErrorHandlers(): Record<
  string,
  (task: TaskType) => Promise<any>
> {
  return {} as Record<string, (task: TaskType) => Promise<any>>;
}
