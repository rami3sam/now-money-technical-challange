import { describe, it, expect, vi, beforeAll } from "vitest";
import { TransfersService } from "./transfers.service.ts";
import { TasksService } from "./tasks.service.ts";
import { TasksRepository } from "../repositories/task.repository.ts";
import { TransfersRepository } from "../repositories/transfers.repository.ts";
import type { TransferType } from "../models/transfer.ts";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
let transfersService: TransfersService;
const transfer = {
  sender: {
    senderId: "4",
    name: "Hassan Jalal",
  },
  recipient: {
    name: "Rami Essamedeen",
    country: "ARE",
    payoutMethod: "CASH",
    payoutDetails: {
      personalIDNumber: "12344556",
      personalIDType: "PASSPORT",
    },
  },
  sendAmount: "10000.00",
  sendCurrency: "USD",
  payoutCurrency: "AED",
};

describe("TransfersService", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const url = mongoServer.getUri();
    mongoose.connect(url);
    const tasksRepository = new TasksRepository();
    const tasksService = new TasksService(tasksRepository);
    const transfersRepository = new TransfersRepository();
    transfersService = new TransfersService(transfersRepository, tasksService);
  });
  it("should create a transfer", async () => {
    const createdTransfer = await transfersService.createTransfer(
      transfer as TransferType,
    );
    expect(createdTransfer).toHaveProperty("id");
  });
  it("should get a transfer by id", async () => {
    const createdTransfer = await transfersService.createTransfer(
      transfer as TransferType,
    );
    const fetchedTransfer = await transfersService.getTransfer(
      createdTransfer.id,
    );
    expect(fetchedTransfer).toHaveProperty("id", createdTransfer.id);
  })
});
