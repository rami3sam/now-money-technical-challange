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
import { each, update } from "lodash";
import { CountryCodes } from "../enums/countryCodes.enum.ts";
import { runQueueWorker } from "../queues/taskQueue.ts";
import {
  getTaskErrorHandlers,
  getTaskHandlers,
} from "../utils/getTaskHandlers.ts";
import { getEnabledCategories } from "node:trace_events";
import currency from "currency.js";
import test from "node:test";
import { stat } from "node:fs";
let transfersService: TransfersService;

vi.mock("axios");

const formatDate = (date: Date) => date.toISOString();

const provideDummyCreatedTransfer = (updates: any = undefined): any => ({
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
  status: "CREATED",
  ...updates,
});

const provideDummyQuotedTransfer = (
  updates: any = undefined,
  date: Date = new Date(),
): any => ({
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
  isPayoutProcessed: false,
  complianceDecisions: [],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: formatDate(new Date(date.getTime() - 5000)),
    },
    {
      state: "QUOTED",
      timestamp: formatDate(new Date(date.getTime() - 3000)),
    },
  ],
  status: "QUOTED",
  quote: {
    rate: "3.63",
    fee: "250.00",
    payoutAmount: "35392.50",
    expiry: formatDate(new Date(date.getTime() + 1000 * 60)),
  },
  ...updates,
});

const provideDummyConfirmedTransfer = (
  updates: any,
  date: Date = new Date(),
): any => ({
  final: {
    paidAmount: "10000.00",
  },
  isPayoutProcessed: false,
  complianceDecisions: [],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: formatDate(new Date(date.getTime() - 5000)),
    },
    {
      state: "QUOTED",
      timestamp: formatDate(new Date(date.getTime() - 3000)),
    },
    {
      state: "CONFIRMED",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
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
    expiry: formatDate(new Date(date.getTime() + 1000 * 60)),
  },
  immutableQuoteSnapshot: {
    rate: "3.68",
    fee: "250.00",
    payoutAmount: "35880.00",
    expiry: formatDate(new Date(date.getTime() - 2000)),
  },
  ...updates,
});

const provideDummmyComplianceTransfer = (
  status:
    | TransferStatus.COMPLIANCE_APPROVED
    | TransferStatus.COMPLIANCE_REJECTED
    | TransferStatus.COMPLIANCE_PENDING,
  updates: any = undefined,
  date: Date = new Date(),
): any => {
  let lastDecision: any;

  if (status === TransferStatus.COMPLIANCE_APPROVED) {
    lastDecision = {
      decision: "APPROVED_MANUALLY",
      triggeredRule: "Transfer approved by manual review",
      reviewerId: "100",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    };
  } else if (status === TransferStatus.COMPLIANCE_REJECTED) {
    lastDecision = {
      decision: "REJECTED_MANUALLY",
      triggeredRule: "Transfer rejected by manual review",
      reviewerId: "100",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    };
  }

  return {
    final: {
      paidAmount: "10000.00",
    },
    isPayoutProcessed: false,
    complianceDecisions: [
      {
        decision: "PENDING",
        triggeredRule: "amount 10000.00 is above compliance threshold",
        timestamp: formatDate(new Date(date.getTime() - 2000)),
      },
      lastDecision,
    ],
    stateHistory: [
      {
        state: "CREATED",
        timestamp: formatDate(new Date(date.getTime() - 5000)),
      },
      {
        state: "QUOTED",
        timestamp: formatDate(new Date(date.getTime() - 4000)),
      },
      {
        state: "CONFIRMED",
        timestamp: formatDate(new Date(date.getTime() - 3000)),
      },
      {
        state: "COMPLIANCE_PENDING",
        timestamp: formatDate(new Date(date.getTime() - 2000)),
      },
      {
        state: "COMPLIANCE_APPROVED",
        timestamp: formatDate(new Date(date.getTime() - 1000)),
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
    status: status,
    quote: {
      rate: "3.72",
      fee: "250.00",
      payoutAmount: "36270.00",
      expiry: formatDate(new Date(date.getTime())),
    },
    immutableQuoteSnapshot: {
      rate: "3.72",
      fee: "250.00",
      payoutAmount: "36270.00",
      expiry: "2026-02-28T07:00:36.530Z",
    },
    payoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
    partnerPayoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
    ...updates,
  };
};

const provideDummmyPayoutPendingTransfer = (
  updates: any = undefined,
  date: Date = new Date(),
): any => ({
  final: {
    paidAmount: "10000.00",
  },
  isPayoutProcessed: false,
  complianceDecisions: [
    {
      decision: "PENDING",
      triggeredRule: "amount 10000.00 is above compliance threshold",
      timestamp: formatDate(new Date(date.getTime() - 2000)),
    },
    {
      decision: "APPROVED_MANUALLY",
      triggeredRule: "Transfer approved by manual review",
      reviewerId: "100",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    },
  ],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: formatDate(new Date(date.getTime() - 5000)),
    },
    {
      state: "QUOTED",
      timestamp: formatDate(new Date(date.getTime() - 4000)),
    },
    {
      state: "CONFIRMED",
      timestamp: formatDate(new Date(date.getTime() - 3000)),
    },
    {
      state: "COMPLIANCE_PENDING",
      timestamp: formatDate(new Date(date.getTime() - 2000)),
    },
    {
      state: "COMPLIANCE_APPROVED",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    },
    {
      state: "PAYOUT_PENDING",
      timestamp: formatDate(new Date(date.getTime() - 500)),
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
  status: "PAYOUT_PENDING",
  quote: {
    rate: "3.72",
    fee: "250.00",
    payoutAmount: "36270.00",
    expiry: formatDate(new Date(date.getTime())),
  },
  immutableQuoteSnapshot: {
    rate: "3.72",
    fee: "250.00",
    payoutAmount: "36270.00",
    expiry: "2026-02-28T07:00:36.530Z",
  },
  payoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
  partnerPayoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
  ...updates,
});

const provideDummyTransferAfterSettledPayout = (
  payoutStatus: "PAID" | "FAILED",
  updates: any = undefined,
  date: Date = new Date(),
): any => ({
  final: {
    paidAmount: "10000.00",
  },
  isPayoutProcessed: true,
  complianceDecisions: [
    {
      decision: "PENDING",
      triggeredRule: "amount 10000.00 is above compliance threshold",
      timestamp: formatDate(new Date(date.getTime() - 2000)),
    },
    {
      decision: "APPROVED_MANUALLY",
      triggeredRule: "Transfer approved by manual review",
      reviewerId: "100",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    },
  ],
  stateHistory: [
    {
      state: "CREATED",
      timestamp: formatDate(new Date(date.getTime() - 5000)),
    },
    {
      state: "QUOTED",
      timestamp: formatDate(new Date(date.getTime() - 4000)),
    },
    {
      state: "CONFIRMED",
      timestamp: formatDate(new Date(date.getTime() - 3000)),
    },
    {
      state: "COMPLIANCE_PENDING",
      timestamp: formatDate(new Date(date.getTime() - 2000)),
    },
    {
      state: "COMPLIANCE_APPROVED",
      timestamp: formatDate(new Date(date.getTime() - 1000)),
    },
    {
      state: "PAYOUT_PENDING",
      timestamp: formatDate(new Date(date.getTime() - 500)),
    },
    {
      state: payoutStatus,
      timestamp: formatDate(new Date(date.getTime() - 500)),
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
  status: payoutStatus,
  quote: {
    rate: "3.72",
    fee: "250.00",
    payoutAmount: "36270.00",
    expiry: formatDate(new Date(date.getTime())),
  },
  immutableQuoteSnapshot: {
    rate: "3.72",
    fee: "250.00",
    payoutAmount: "36270.00",
    expiry: "2026-02-28T07:00:36.530Z",
  },
  payoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
  partnerPayoutId: "019ca30b-d1e4-746a-aefd-c5cb4cd395ff",
  ...updates,
});

const provideDummyPayoutStatusUpdate = (
  partnerPayoutId: string,
  status: string,
): any => ({
  partnerPayoutId,
  status,
});

const provideDummyTransfer = (
  status: TransferStatus,
  updates: any = undefined,
): any => {
  switch (status) {
    case TransferStatus.CREATED:
      return provideDummyCreatedTransfer(updates);
    case TransferStatus.QUOTED:
      return provideDummyQuotedTransfer(updates);
    case TransferStatus.CONFIRMED:
      return provideDummyConfirmedTransfer(updates);
    case TransferStatus.COMPLIANCE_APPROVED:
    case TransferStatus.COMPLIANCE_REJECTED:
    case TransferStatus.COMPLIANCE_PENDING:
      return provideDummmyComplianceTransfer(status);
    case TransferStatus.PAYOUT_PENDING:
      return provideDummmyPayoutPendingTransfer(updates);
    case TransferStatus.PAID:
    case TransferStatus.FAILED:
      return provideDummyTransferAfterSettledPayout(status, updates);
    default:
      throw new Error(`Unsupported transfer status: ${status}`);
  }
};
const provideDummyQuote = (updates: any = undefined): any => ({
  fxRate: "3.72",
  feeAmount: "250.00",
  payoutAmount: "36270.00",
  quoteExpiry: "2026-02-25T15:25:36.749Z",
  ...updates,
});

const provideDummyInitiatePayoutResponse = (updates: any): any => ({
  partnerPayoutId: "019c9b5b-7ca8-750d-b749-0c3bd5280fd1",
  status: "PENDING",
  ...updates,
});

//----------------------------------------------------------------------------------------------

describe("TransfersService", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const url = mongoServer.getUri();
    mongoose.connect(url);
    const tasksRepository = new TasksRepository();
    const tasksService = new TasksService(tasksRepository);
    const transfersRepository = new TransfersRepository();
    transfersService = new TransfersService(transfersRepository, tasksService);
    runQueueWorker(
      tasksService,
      getTaskHandlers(transfersService),
      getTaskErrorHandlers(),
    );
  });

  afterEach(async () => {
    await Transfer.deleteMany({});
  });

  it("should create a transfer", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyCreatedTransfer({}),
    );
    expect(createdTransfer).toHaveProperty("id");
    expect(createdTransfer).toHaveProperty("status", TransferStatus.CREATED);
  });
  it("should get a transfer by id", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyCreatedTransfer({}),
    );
    const fetchedTransfer = await transfersService.getTransfer(
      createdTransfer.id,
    );
    expect(fetchedTransfer).toHaveProperty("id", createdTransfer.id);
  });

  it("should save an fresh quote", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyCreatedTransfer({}),
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
      provideDummyCreatedTransfer({}),
    );
    axios.post = vi.fn().mockResolvedValue({ data: provideDummyQuote({}) });

    await expect(
      transfersService.quoteTransfer(createdTransfer.id),
    ).rejects.toThrow();
  });

  it("shouldn't confirm an unqouted transfer", async () => {
    const createdTransfer = await transfersService.createTransfer(
      provideDummyCreatedTransfer({}),
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
    dummyTransfer.recipient.country = CountryCodes.ARE;
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.checkTransferCompliance(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.COMPLIANCE_APPROVED,
    );
  });

  it("should initiate payout of an compliance approved transfer", async () => {
    const dummyTransfer = provideDummmyComplianceTransfer(
      TransferStatus.COMPLIANCE_APPROVED,
    );
    const createdTransfer = await Transfer.create(dummyTransfer);

    axios.post = vi
      .fn()
      .mockResolvedValue({ data: provideDummyInitiatePayoutResponse({}) });

    const confirmedTransfer = await transfersService.initiatePayout(
      createdTransfer._id.toString(),
    );

    expect(confirmedTransfer).toHaveProperty(
      "status",
      TransferStatus.PAYOUT_PENDING,
    );
  });

  it("should change status to failed after receiving payout failure status", async () => {
    const dummyTransfer = provideDummmyPayoutPendingTransfer({});
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.updatePayoutStatus(
      provideDummyPayoutStatusUpdate(dummyTransfer.partnerPayoutId, "FAILED"),
    );

    expect(confirmedTransfer).toHaveProperty("status", TransferStatus.FAILED);
  });

  it("should change status to paid after receiving payout success status", async () => {
    const dummyTransfer = provideDummmyPayoutPendingTransfer({});
    const createdTransfer = await Transfer.create(dummyTransfer);

    const confirmedTransfer = await transfersService.updatePayoutStatus(
      provideDummyPayoutStatusUpdate(dummyTransfer.partnerPayoutId, "PAID"),
    );

    expect(confirmedTransfer).toHaveProperty("status", TransferStatus.PAID);
  });

  it("should throw an error if payout status is an value outside of PAID or FAILED", async () => {
    const dummyTransfer = provideDummmyPayoutPendingTransfer({});
    const createdTransfer = await Transfer.create(dummyTransfer);

    await expect(
      transfersService.updatePayoutStatus(
        provideDummyPayoutStatusUpdate(
          dummyTransfer.partnerPayoutId,
          "UNKNOWN",
        ),
      ),
    ).rejects.toThrowError();
  });

  it.each([TransferStatus.FAILED, TransferStatus.COMPLIANCE_REJECTED])(
    "should refund a %s payout and should be refunded full amount",
    async (status) => {
      const dummyTransfer = provideDummyTransfer(status);
      const createdTransfer = await Transfer.create(dummyTransfer);
      const refundedTransfer = await transfersService.refundTransfer(
        createdTransfer._id.toString(),
      );
      expect(refundedTransfer).toHaveProperty(
        "status",
        TransferStatus.REFUNDED,
      );
      expect(refundedTransfer).toHaveProperty(
        "final.refundedAmount",
        currency(createdTransfer.final!.paidAmount!).value.toFixed(2),
      );
    },
  );

  it("shouldn't refund a successful payout and should throw an error", async () => {
    const dummyTransfer = provideDummyTransferAfterSettledPayout("PAID");
    const createdTransfer = await Transfer.create(dummyTransfer);
    await expect(
      transfersService.refundTransfer(createdTransfer._id.toString()),
    ).rejects.toThrowError();
  });

  it.each([TransferStatus.CREATED, TransferStatus.QUOTED])(
    "should be able to cancel a %s status transfer",
    async (status) => {
      const dummyTransfer = provideDummyTransfer(status);
      const createdTransfer = await Transfer.create(dummyTransfer);
      const cancelledTransfer = await transfersService.cancelTransfer(
        createdTransfer._id.toString(),
      );
      expect(cancelledTransfer).toHaveProperty(
        "status",
        TransferStatus.CANCELLED,
      );
      expect(cancelledTransfer).toHaveProperty("final.paidAmount", undefined);
    },
  );

  it.each([
    TransferStatus.CONFIRMED,
    TransferStatus.COMPLIANCE_APPROVED,
    TransferStatus.COMPLIANCE_PENDING,
  ])(
    "should be able to cancel a %s status transfer but paidAmount should be equal to sendAmount and refuned later",
    async (status) => {
      const dummyTransfer = provideDummyTransfer(status);
      const createdTransfer = await Transfer.create(dummyTransfer);
      const cancelledTransfer = await transfersService.cancelTransfer(
        createdTransfer._id.toString(),
      );
      expect(cancelledTransfer).toHaveProperty(
        "status",
        TransferStatus.CANCELLED,
      );
      expect(cancelledTransfer).toHaveProperty(
        "final.paidAmount",
        cancelledTransfer.sendAmount,
      );
    },
  );
});
