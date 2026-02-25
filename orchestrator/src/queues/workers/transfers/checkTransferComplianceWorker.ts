import currency from "currency.js";
import { bannedCountries, bannedPeople } from "../../../constants/constants.ts";
import { ComplianceDecisions } from "../../../enums/complianceDecisions.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../../enums/transferStatus.enum.ts";
import { Transfer } from "../../../models/transfer.ts";
import {
  checkForNameInList,
  getComplianceMaximum,
} from "../../../utils/utilFunctions.ts";
import type { CurrencyCodes } from "../../../enums/currencyCodes.enum.ts";
import { addToTaskQueue } from "../../taskQueue.ts";
import { TaskHandlers } from "../../../enums/taskHandlers.enum.ts";
import type { TaskType } from "../../../models/task.ts";

export async function checkTransferComplianceWorker(
  task: TaskType & { id: string },
) {
  const transferId = task.payload;
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw Error(`Transfer with id ${transferId} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  if (bannedCountries.includes(recipient.country)) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_REJECTED,
    );

    transfer.status = TransferStatus.COMPLIANCE_REJECTED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_REJECTED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.REJECTED,
      triggeredRule: `Recipient country "${recipient.country}" is banned`,
    });

    const updateTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (updateTransfer)
      addToTaskQueue({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updateTransfer.id,
      });
    else
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_REJECTED",
      );
  } else if (checkForNameInList(recipient.name, bannedPeople)) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_PENDING });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `Recipient name ${recipient.name} is banned`,
    });
    const updateTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!updateTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  } else if (
    currency(transfer.sendAmount) <
    currency(getComplianceMaximum(transfer.sendCurrency as CurrencyCodes))
  ) {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_APPROVED,
    );

    transfer.status = TransferStatus.COMPLIANCE_APPROVED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_APPROVED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.APPROVED,
      triggeredRule: `amount ${transfer.sendAmount} is below compliance threshold`,
    });
    const updateTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!updateTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_APPROVED",
      );

    addToTaskQueue({
      taskHandler: TaskHandlers.INITIATE_PAYOUT,
      payload: updateTransfer.id,
    });
  } else {
    assertTransferStatusTransition(
      transfer.status,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_PENDING });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `amount ${transfer.sendAmount} is above compliance threshold`,
    });
    const updateTransfer = await Transfer.findOneAndUpdate(
      { _id: transfer.id, status: TransferStatus.CONFIRMED },
      { $set: transfer },
    ).exec();

    if (!updateTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  }
}
