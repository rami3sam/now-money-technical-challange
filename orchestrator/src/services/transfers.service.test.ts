import { describe, it, expect, vi, beforeAll } from "vitest";
import { TransfersService } from "./transfers.service.ts";
import { TasksService } from "./tasks.service.ts";
import { TasksRepository } from "../repositories/task.repository.ts";
import { TransfersRepository } from "../repositories/transfers.repository.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import axios from "axios";
let transfersService: TransfersService;

vi.mock("axios");

const formatDate = (date: Date) => date.toISOString();

const provideDummyTransfer = (updates: any): any =>
  ({
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
    ...updates,
  }) as TransferType;

const provideQuotedTransfer = (updates: any): any => ({
  sender: {
    senderId: "4",
    name: "Hassan Jalal",
  },
  _id: "69a1baac61e10217d6f74e1f",
  recipient: {
    name: "Rami Essamedeen",
    country: "ARE",
    payoutMethod: "CASH",
    payoutDetails: {
      personalIDNumber: "12344556",
      personalIDType: "PASSPORT",
      _id: "69a1baac61e10217d6f74e21",
    },
    _id: "69a1baac61e10217d6f74e20",
  },
  sendAmount: "10000.00",
  sendCurrency: "USD",
  payoutCurrency: "AED",
  isPayoutProcessed: false,
  complianceDecisions: [],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: formatDate(new Date(Date.now() - 5000)),
    },
    {
      state: "QUOTED",
      timestamp: formatDate(new Date(Date.now() - 3000)),
    },
  ],
  status: "QUOTED",
  quote: {
    rate: "3.63",
    fee: "250.00",
    payoutAmount: "35392.50",
    expiry: formatDate(new Date(Date.now() + 1000 * 60)),
  },
});

const provideDummyQuote = (updates: any): any => ({
  fxRate: "3.72",
  feeAmount: "250.00",
  payoutAmount: "36270.00",
  quoteExpiry: "2026-02-25T15:25:36.749Z",
  ...updates,
});

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
      provideDummyTransfer({}),
    );
    expect(createdTransfer).toHaveProperty("id");
    expect(createdTransfer).toHaveProperty("status", TransferStatus.CREATED);
  });
  it("should get a transfer by id", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyTransfer({}),
    );
    const fetchedTransfer = await transfersService.getTransfer(
      createdTransfer.id,
    );
    expect(fetchedTransfer).toHaveProperty("id", createdTransfer.id);
  });

  it("should save an fresh quote", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyTransfer({}),
    );
    axios.post = vi.fn().mockResolvedValue({
      data: provideDummyQuote({
        quoteExpiry: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }),
    });

    expect(
      await transfersService.quoteTransfer(createdTransfer.id),
    ).toHaveProperty("status", TransferStatus.QUOTED);
  });

  it("shouldn't save an expired quote", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyTransfer({}),
    );
    axios.post = vi.fn().mockResolvedValue({ data: provideDummyQuote({}) });

    expect(
      transfersService.quoteTransfer(createdTransfer.id),
    ).rejects.toThrow();
  });

  it("shouldn't confirm an unqouted transfer", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyTransfer({}),
    );

    await expect(
      transfersService.confirmTransferQuote(createdTransfer.id),
    ).rejects.toThrow();
  });

  it("should confirm a quoted transfer", async () => {
    const createdTransfer = await Transfer.create(provideQuotedTransfer({}));

    const confirmedTransfer = await transfersService.confirmTransferQuote(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.CONFIRMED,
    );
  });
});
