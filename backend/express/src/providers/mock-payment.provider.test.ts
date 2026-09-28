import assert from "node:assert/strict";
import test from "node:test";
import { MockPaymentProvider } from "./mock-payment.provider";

const provider = new MockPaymentProvider();

test("mock provider accepts the success card and rejects the failure card", async () => {
  const success = await provider.processPayment("order", "4111111111111111", "12", "2030", "123");
  const failure = await provider.processPayment("order", "4000000000000002", "12", "2030", "123");

  assert.equal(success.status, "PAID");
  assert.equal(failure.status, "FAILED");
  assert.match(success.transactionId, /^TXN-\d+-\d{6}$/);
});
