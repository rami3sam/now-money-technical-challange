import dotenv from "dotenv";

dotenv.config();
const config = {
  orchestratorServiceUrl: process.env.ORCHESTRATOR_SERVICE_URL!,
  fxQuoteServiceUrl: process.env.FX_QUOTE_SERVICE_URL!,
  payoutPartnerSimulatorServiceUrl:
    process.env.PAYOUT_PARTNER_SIMULATOR_SERVICE_URL!,
  webhookSecret: process.env.WEBHOOK_SECRET!,
};
import { describe, it, expect } from "vitest";
import axios from "axios";
import { waitForCondition } from "./utils";

describe("App integration tests", () => {
  let transferIdThatWillBePaid: string;
  const transferThatWillBePaid = {
    sender: {
      senderId: "4",
      name: "Hassan Jalal",
    },
    recipient: {
      name: "Rami Essamedeen+++",
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

  it("POST /transfers should create a transfer", async () => {
    const res = await axios.post(
      `${config.orchestratorServiceUrl}/transfers`,
      transferThatWillBePaid,
    );

    //@ts-ignore
    transferIdThatWillBePaid = res.data._id;
    expect(res.data).toHaveProperty("status", "CREATED");
  });

  it("POST /transfers/:id/quote should quote the transfer", async () => {
    const res = await axios.post(
      `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}/quote`,
    );

    expect(res.data).toHaveProperty("data.status", "QUOTED");
  });

  it("POST /transfers/:id/confirm should confirm the transfer", async () => {
    const res = await axios.post(
      `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}/confirm`,
    );

    expect(res.data).toHaveProperty("data.status", "CONFIRMED");
  });

  it("the transfer should be compliance pending after confirm since the amount is too large", async () => {
    let res;
    await waitForCondition(async () => {
      res = await axios.get(
        `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}`,
      );
      //@ts-ignore
      return res.data.status === "COMPLIANCE_PENDING";
    });
    //@ts-ignore
    expect(res.data).toHaveProperty("status", "COMPLIANCE_PENDING");
  });

  it("POST /transfers/:id/approve should confirm the transfer", async () => {
    const res = await axios.post(
      `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}/compliance/approve?reviewerId=100`,
    );

    expect(res.status).toBe(200);
  });

  it("the transfer should be compliance approved after approval", async () => {
    let res;
    await waitForCondition(async () => {
      res = await axios.get(
        `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}`,
      );
      //@ts-ignore
      return res.data.status === "COMPLIANCE_APPROVED";
    });

    expect(res).toHaveProperty("data.status", "COMPLIANCE_APPROVED");
  });

  it("the transfer should be be change to payout pending after approval", async () => {
    let res;
    await waitForCondition(async () => {
      res = await axios.get(
        `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}`,
      );
      //@ts-ignore
      return res.data.status === "PAYOUT_PENDING";
    });

    expect(res).toHaveProperty("data.status", "PAYOUT_PENDING");
  });

  it("the transfer should be be change to PAID", async () => {
    let res;
    await waitForCondition(async () => {
      res = await axios.get(
        `${config.orchestratorServiceUrl}/transfers/${transferIdThatWillBePaid}`,
      );
      //@ts-ignore
      return res.data.status === "PAID";
    });

    expect(res).toHaveProperty("data.status", "PAID");
  });
});
