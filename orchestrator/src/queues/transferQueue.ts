import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Transfer } from "../models/transfer.ts";
import { LinkedQueue } from "../utils/queue.ts";
import {
  checkTransferCompliance,
  quoteTransferWorker,
} from "./workers/transferWorkers.ts";

const TransferQueue = new LinkedQueue<string>();
let isRunning = false;
function addToTransferQueue(transferId: string) {
  TransferQueue.enqueue(transferId);
  runQueueWorker();
}

async function runQueueWorker() {
  if (isRunning) return;
  isRunning = true;
  while (!TransferQueue.isEmpty()) {
    const transferId = TransferQueue.dequeue()!;
    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      console.error(`Transfer with id ${transferId} not found`);
      continue;
    }
    try {
      if (transfer?.status === TransferStatus.CREATED || transfer?.status === TransferStatus.QUOTE_EXPIRED) {
        await quoteTransferWorker(transferId);
      } else if (transfer?.status === TransferStatus.CONFIRMED) {
        await checkTransferCompliance(transferId);
      }
    } catch (err) {
      console.error(`Error processing transfer with id ${transferId}:`, err);
    }
  }

  isRunning = false;
}

export { addToTransferQueue, runQueueWorker };
