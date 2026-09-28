export type PaymentResult = {
  success: boolean;
  transactionId: string;
  status: "PAID" | "FAILED";
};

export interface PaymentProvider {
  processPayment(
    orderId: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
  ): Promise<PaymentResult>;
}
