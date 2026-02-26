import currency from "currency.js";
import { bannedCountries, bannedPeople } from "../../constants/constants.ts";
import { ComplianceDecisions } from "../../enums/complianceDecisions.ts";
import { TaskHandlers } from "../../enums/taskHandlers.enum.ts";
import {
  assertTransferStatusTransition,
  TransferStatus,
} from "../../enums/transferStatus.enum.ts";
import type { TransfersRepository } from "../../repositories/transfers.repository.ts";
import {
  checkForNameInList,
  getComplianceMaximum,
} from "../../utils/utilFunctions.ts";
import type { CurrencyCodes } from "../../enums/currencyCodes.enum.ts";
import type { TasksService } from "../tasks.service.ts";
import { Task } from "../../models/task.ts";

export async function checkTransferCompliance(
  transferRepository: TransfersRepository,
  tasksService: TasksService,
  id: string,
) {
  const transfer = await transferRepository.findById(id);
  if (!transfer) throw Error(`Transfer with id ${id} not found`);

  const { recipient } = transfer;
  if (!recipient) throw Error("Transfer recipient not found");

  if (bannedCountries.includes(recipient.country)) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_REJECTED,
    );

    transfer.status = TransferStatus.COMPLIANCE_REJECTED;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_REJECTED });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.REJECTED,
      triggeredRule: `Recipient country "${recipient.country}" is banned`,
    });

    const updateTransfer = await transferRepository.updateTransfer(
      id,
      transfer,
    );

    if (!updateTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_REJECTED",
      );

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.REFUND_TRANSFER,
        payload: updateTransfer.id,
      }),
    );
  } else if (checkForNameInList(recipient.name, bannedPeople)) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;
    transfer.stateHistory.push({ state: TransferStatus.COMPLIANCE_PENDING });
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `Recipient name ${recipient.name} is banned`,
    });

    const updateTransfer = await transferRepository.updateTransfer(
      transfer.id,
      transfer,
    );

    if (!updateTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  } else if (
    currency(transfer.sendAmount) <
    currency(getComplianceMaximum(transfer.sendCurrency as CurrencyCodes))
  ) {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_APPROVED,
    );

    transfer.status = TransferStatus.COMPLIANCE_APPROVED;
    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.APPROVED,
      triggeredRule: `amount ${transfer.sendAmount} is below compliance threshold`,
    });

    const updateTransfer = await transferRepository.updateTransfer(
      transfer.id,
      transfer,
    );

    if (!updateTransfer)
      throw new Error(
        "Failed to update transfer status to COMPLIANCE_APPROVED",
      );

    tasksService.add(
      new Task({
        taskHandler: TaskHandlers.INITIATE_PAYOUT,
        payload: updateTransfer.id,
      }),
    );
  } else {
    assertTransferStatusTransition(
      transfer.status as TransferStatus,
      TransferStatus.COMPLIANCE_PENDING,
    );

    transfer.status = TransferStatus.COMPLIANCE_PENDING;

    transfer.complianceDecisions.push({
      decision: ComplianceDecisions.PENDING,
      triggeredRule: `amount ${transfer.sendAmount} is above compliance threshold`,
    });

    const updatedTransfer = await transferRepository.updateTransfer(
      transfer.id,
      transfer,
    );

    if (!updatedTransfer)
      throw new Error("Failed to update transfer status to COMPLIANCE_PENDING");
  }
}
