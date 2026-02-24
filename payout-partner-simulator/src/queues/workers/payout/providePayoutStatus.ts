import axios from "axios";
import { Payout } from "../../../models/payout.ts";

export async function providePayoutStatusWorker(payoutId: string) {
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
