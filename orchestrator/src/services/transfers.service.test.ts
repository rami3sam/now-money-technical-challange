import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { TransfersService } from "./transfers.service.ts";
import { TasksService } from "./tasks.service.ts";
import { TasksRepository } from "../repositories/task.repository.ts";
import { TransfersRepository } from "../repositories/transfers.repository.ts";
import { Transfer, type TransferType } from "../models/transfer.ts";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { TransferStatus } from "../enums/transferStatus.enum.ts";
import axios from "axios";
import { update } from "lodash";
import { CountryCodes } from "../enums/countryCodes.enum.ts";
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

const provideDummyQuotedTransfer = (updates: any): any => ({
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
  ...updates,
});

const provideDummyConfirmedTransfer = (updates: any): any => ({
  final: {
    paidAmount: "10000.00",
  },
  isPayoutProcessed: false,
  complianceDecisions: [],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: "2026-02-27T16:27:23.410Z",
    },
    {
      state: "QUOTED",
      timestamp: "2026-02-27T16:27:30.969Z",
    },
    {
      state: "CONFIRMED",
      timestamp: "2026-02-27T16:27:34.101Z",
    },
  ],
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
  status: "CONFIRMED",
  quote: {
    rate: "3.68",
    fee: "250.00",
    payoutAmount: "35880.00",
    expiry: "2026-02-27T16:28:30.952Z",
  },
  immutableQuoteSnapshot: {
    rate: "3.68",
    fee: "250.00",
    payoutAmount: "35880.00",
    expiry: "2026-02-27T16:28:30.952Z",
  },
  ...updates,
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

  afterEach(async () => {
    await Transfer.deleteMany({});
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

    await expect(
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
    const createdTransfer = await Transfer.create(
      provideDummyQuotedTransfer({}),
    );

    const confirmedTransfer = await transfersService.confirmTransferQuote(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.CONFIRMED,
    );
  });

  it("should change status to COMPLIANCE_PENDING if above threshold", async () => {
    const createdTransfer = await Transfer.create(
      provideDummyConfirmedTransfer({}),
    );

    const confirmedTransfer = await transfersService.checkTransferCompliance(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.COMPLIANCE_PENDING,
    );
  });

  it("should change status to COMPLIANCE_PENDING banned person", async () => {
    const dummyTransfer = provideDummyConfirmedTransfer({});
    dummyTransfer.recipient.name = "Osama Bin Laden";
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.checkTransferCompliance(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.COMPLIANCE_PENDING,
    );
  });

  it("should reject transfer if recipient country is banned", async () => {
    const dummyTransfer = provideDummyConfirmedTransfer({});
    dummyTransfer.recipient.country = CountryCodes.IRN;
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.checkTransferCompliance(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.COMPLIANCE_REJECTED,
    );
  });

  it("should approve if sendAmount is below threshold and recipient country not banned", async () => {
    const dummyTransfer = provideDummyConfirmedTransfer({});
    dummyTransfer.sendAmount = "100.00";
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.checkTransferCompliance(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.COMPLIANCE_APPROVED,
    );
  });
});
