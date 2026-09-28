import { randomInt } from "node:crypto";
import type { PaymentProvider, PaymentResult } from "./payment.provider";

const FAILED_CARD = "4000000000000002";

export class MockPaymentProvider implements PaymentProvider {
  async processPayment(
    _orderId: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
  ): Promise<PaymentResult> {
    void expiryMonth;
    void expiryYear;
    void cvv;
    const success = cardNumber !== FAILED_CARD;

    return {
      success,
      transactionId: `TXN-${Date.now()}-${randomInt(100000, 1000000)}`,
      status: success ? "PAID" : "FAILED",
    };
  }
}
