import { TaskHandlers } from "../enums/taskHandlers.enum.ts";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { Transfer } from "../models/transfer.ts";
import { LinkedQueue } from "../utils/queue.ts";
import {
  checkTransferCompliance,
  initaitePayout,
  quoteTransferWorker,
} from "./workers/transferWorkers.ts";

export type Task = {
  id: string;
  payload: any;
  executeAt: Date; // when the task should run
  taskHandler: TaskHandlers;
};

const TransferQueue = new LinkedQueue<Task>();
let isRunning = false;

function addToTransferQueue(task: Task) {
  TransferQueue.enqueue(task);
  runQueueWorker();
}

async function runQueueWorker() {
  if (isRunning) return;
  isRunning = true;
  while (!TransferQueue.isEmpty()) {
    const task = TransferQueue.dequeue()!;

    if (task.executeAt > new Date()) {
      TransferQueue.enqueue(task);
      continue;
    }

    try {
      if (task.taskHandler === TaskHandlers.QUOTE_TRANSFER) {
        await quoteTransferWorker(task.payload);
      } else if (task.taskHandler === TaskHandlers.CHECK_COMPLIANCE) {
        await checkTransferCompliance(task.payload);
      } else if (task.taskHandler === TaskHandlers.INITIATE_PAYOUT) {
        await initaitePayout(task.payload);
      }
    } catch (err) {
      console.error(`Error processing task with id ${task.id}:`, err);
    }
  }

  isRunning = false;
}

export { addToTransferQueue, runQueueWorker };
