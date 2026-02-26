import { PayoutStatus } from "../../enums/payoutStatus.enum.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import type { PayoutType } from "../../models/payout.ts";
import { Task } from "../../models/task.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import type { TasksService } from "../tasks.service.ts";

const payoutStatus = async (
  transfersRepository: TransfersRepository,
  tasksService: TasksService,
  payout: PayoutType,
) => {
  const transfer = await transfersRepository.findByPartnerPayoutId(
    payout.partnerPayoutId as string,
  );
  if (!transfer) throw Error("Transfer not found");

  if (transfer.isPayoutProcessed) {
    return transfer;
  }

  if (payout.payoutStatus === PayoutStatus.PAID) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.PAID,
    );
    transfer.status = TransferStatus.PAID;

    const updateTransfer = await transfersRepository.updateTransfer(
      transfer.id,
      {
        status: TransferStatus.PAID,
        stateHistory: transfer.stateHistory,
        isPayoutProcessed: true,
        payoutsStatus: payout.payoutStatus,
      },
    );

    if (!updateTransfer)
      throw new Error("Failed to update transfer status to PAID");
  } else if (payout.payoutStatus === PayoutStatus.FAILED) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.FAILED,
    );
    transfer.status = TransferStatus.FAILED;
    transfer.stateHistory.push({ state: TransferStatus.FAILED });

    const updateTransfer = await transfersRepository.updateTransfer(
      transfer.id,
      {
        status: TransferStatus.FAILED,
        stateHistory: transfer.stateHistory,
        isPayoutProcessed: true,
        payoutsStatus: payout.payoutStatus,
      },
    );

    if (!updateTransfer)
      throw new Error("Failed to update transfer status to FAILED");

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updateTransfer.id,
      }),
    );
  }
};

export { payoutStatus };
