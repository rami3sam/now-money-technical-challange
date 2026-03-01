import { TaskHandlers } from "../enums/taskHandlers.enum.js";
import type { TaskType, TaskTypeWithId } from "../models/task.js";
import type { PayoutsService } from "../services/payouts.service.js";

export function getTaskHandlers(payoutsService: PayoutsService) {
  return {
    [TaskHandlers.PROCESS_PAYOUT]: (task: TaskTypeWithId) => 
      payoutsService.processPayout(task.payload as string)
    ,
    [TaskHandlers.PROVIDE_PAYOUT_STATUS]: (task: TaskTypeWithId) => 
      payoutsService.providePayoutStatus(task.payload as string)
    ,
  };
}

export function getTaskErrorHandlers(): Record<
  string,
  (task: TaskType) => Promise<any>
> {
  return {} as Record<string, (task: TaskType) => Promise<any>>;
}
