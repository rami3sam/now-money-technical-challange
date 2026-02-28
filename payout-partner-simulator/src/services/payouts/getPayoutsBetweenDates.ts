import { Payout, type PayoutType } from "../../models/payout.js";
import type { PayoutsRepository } from "../../repositories/payouts.repository.js";

export const getPayouts = async (
  payoutsRepository: PayoutsRepository,
  startDate: Date,
  endDate: Date,
) => {
  const payouts = await payoutsRepository.findBetweenDates(startDate, endDate);
  if (!payouts) throw Error("No payouts found in this date range");
  const payoutsWithoutIds: Omit<PayoutType, "_id">[] = payouts;
  return payoutsWithoutIds;
};
