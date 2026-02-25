import axios from "axios";
import { Payout } from "../../../models/payout.ts";
import type { TaskType } from "../../../models/task.ts";
import { signHmacMiddleware as signHmac } from "../../../utils/utilFunctions.ts";
import { EnvVariables } from "../../../constants/config.ts";

export async function providePayoutStatusWorker(
  task: TaskType & { id: string },
) {
  const payoutId = task.payload;
  const payout = await Payout.findById(payoutId);

  if (!payout) throw Error(`Payout with id ${payoutId} not found`);
  const payload = {
    partnerPayoutId: payout.partnerPayoutId,
    status: payout.payoutStatus,
  };
  const signature = signHmac(EnvVariables.WEBHOOK_SECRET, payload);

  const quoteResponse = await axios.post(
    "http://localhost:8000/webhooks/payout-status",
    payload,
    { headers: { "X-Signature": signature } },
  );
}
