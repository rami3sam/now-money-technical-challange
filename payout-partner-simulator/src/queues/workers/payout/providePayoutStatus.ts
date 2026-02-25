import axios from "axios";
import { Payout } from "../../../models/payout.ts";
import type { TaskType } from "../../../models/task.ts";

export async function providePayoutStatusWorker(
  task: TaskType & { id: string },
) {
  const payoutId = task.payload;
  const payout = await Payout.findById(payoutId);
  if (!payout) throw Error(`Payout with id ${payoutId} not found`);

  const quoteResponse = await axios.post(
    "http://localhost:8000/webhooks/payout-status",
    {
      partnerPayoutId: payout.payoutId,
      status: payout.payoutStatus,
    },
  );
}
