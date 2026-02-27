import { PayoutStatus } from "../../enums/payoutStatus.enum.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import { Task, type TaskTypeWithId } from "../../models/task.ts";
import type { PayoutsRepository } from "../../repositories/payouts.repository.ts";
import type { TasksService } from "../tasks.service.ts";

export const processPayout = async (
  tasksService: TasksService,
  payoutsRepository: PayoutsRepository,
  payoutId: string,
) => {
  const payout = await payoutsRepository.findById(payoutId);
  if (!payout) throw Error(`Payout with id ${payoutId} not found`);

  const payoutStatus =
    Math.random() > 0.2 ? PayoutStatus.PAID : PayoutStatus.FAILED;
  const newPayout = await payoutsRepository.updatePayout(payoutId, {
    payoutStatus: payoutStatus,
  });

  if (!newPayout) throw Error(`Failed to update payout with id ${payoutId}`);

  tasksService.add(
    new Task({
      taskHandler: TaskHandlers.PROVIDE_PAYOUT_STATUS,
      payload: payoutId,
      executeAt: new Date(Date.now() + 5000),
    }),
  );
};
