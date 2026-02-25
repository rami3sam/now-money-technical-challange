import { PayoutStatus } from "../../../enums/payoutStatus.enum.ts";
import { TaskHandlers } from "../../../enums/taskHandlers.enum.ts";
import { Payout } from "../../../models/payout.ts";
import type { TaskType } from "../../../models/task.ts";
import { addToTaskQueue } from "../../taskQueue.ts";

export async function processPayoutWorker(task: TaskType & { id: string }) {
  const payoutId = task.payload
  const payout = await Payout.findById(payoutId);
  if (!payout) throw Error(`Payout with id ${payoutId} not found`);

  payout.payoutStatus =
    Math.random() > 0.2 ? PayoutStatus.PAID : PayoutStatus.FAILED;
  const newPayout = await payout.save();

  if (!newPayout) throw Error(`Failed to update payout with id ${payoutId}`);

  addToTaskQueue({
    taskHandler: TaskHandlers.PROVIDE_PAYOUT_STATUS,
    payload: {
      payoutId: payout._id,
    },
    executeAt: new Date(Date.now() + 5000),
  });
}
