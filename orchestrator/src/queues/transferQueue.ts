import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Transfer } from "../models/transfer.ts";
import { LinkedQueue } from "../utils/queue.ts";
import { quoteTransferWorker } from "./worker/transferWorkers.ts";

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
      if (transfer?.status === TransferStatus.CREATED) {
        await quoteTransferWorker(transferId);
      }
    } catch (err) {
      console.error(`Error processing transfer with id ${transferId}:`, err);
    }
  }
}

export { addToTransferQueue, runQueueWorker };
