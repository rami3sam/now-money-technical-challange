import { describe, it, expect, vi, beforeAll } from "vitest";
import { TransfersService } from "./transfers.service.ts";
import { TasksService } from "./tasks.service.ts";
import { TasksRepository } from "../repositories/task.repository.ts";
import { TransfersRepository } from "../repositories/transfers.repository.ts";
import type { TransferType } from "../models/transfer.ts";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import { getDefaultHighWaterMark } from "node:stream";
import { update } from "lodash";
import axios from "axios";
import type { QuoteType } from "../models/quote.ts";
let transfersService: TransfersService;

vi.mock("axios");

const getFakeTransfer = (updates: any): TransferType =>
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

const getFakeQuote = (updates: any): any => ({
  destinationCountry: "SDN",
  payoutMethod: "CASH",
  sendAmount: "10000.00",
  sendCurrency: "USD",
  payoutCurrency: "AED",
  fxRate: "3.62",
  feeAmount: "250.00",
  payoutAmount: "35295.00",
  quoteExpiry: "2026-02-27T12:40:27.268Z",
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
      getFakeTransfer({}),
    );
    expect(createdTransfer).toHaveProperty("id");
    expect(createdTransfer).toHaveProperty("status", TransferStatus.CREATED);
  });
  it("should get a transfer by id", async () => {
    const createdTransfer = await transfersService.createTransfer(
      getFakeTransfer({}),
    );
    const fetchedTransfer = await transfersService.getTransfer(
      createdTransfer.id,
    );
    expect(fetchedTransfer).toHaveProperty("id", createdTransfer.id);
  });

  it("shouldn save an fresh quote", async () => {
    const createdTransfer = await transfersService.createTransfer(
      getFakeTransfer({}),
    );
    axios.post = vi
      .fn()
      .mockResolvedValue({
        data: getFakeQuote({
          quoteExpiry: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        }),
      });

    expect(
      await transfersService.quoteTransfer(createdTransfer.id),
    ).toHaveProperty("status", TransferStatus.QUOTED);
  });

  it("shouldn't save an expired quote", async () => {
    const createdTransfer = await transfersService.createTransfer(
      getFakeTransfer({}),
    );
    axios.post = vi.fn().mockResolvedValue({ data: getFakeQuote({}) });

    expect(
      transfersService.quoteTransfer(createdTransfer.id),
    ).rejects.toThrow();
  });

  it("shouldn't confirm an unqouted transfer", async () => {
    const createdTransfer = await transfersService.createTransfer(
      getFakeTransfer({}),
    );

    await expect(
      transfersService.confirmTransferQuote(createdTransfer.id),
    ).rejects.toThrow();
  });
});
