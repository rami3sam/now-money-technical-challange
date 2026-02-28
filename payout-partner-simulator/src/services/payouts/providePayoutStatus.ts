import axios from "axios";
import { PayoutsRepository } from "../../repositories/payouts.repository.js";
import { EnvVariables } from "../../constants/config.js";
import { signHmac } from "../../utils/utilFunctions.js";

export const providePayoutStatus = async (
  payoutsRepository: PayoutsRepository,
  payoutId: string,
) => {
  const payout = await payoutsRepository.findById(payoutId);

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
};
