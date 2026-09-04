import assert from "node:assert/strict";
import test from "node:test";
import {
  createProductReviewSchema,
  customerReviewParamsSchema,
  listProductReviewsQuerySchema,
} from "./review.schema";
import { createTestimonialSchema } from "./testimonial.schema";
import { processPaymentSchema } from "./payment.schema";
import { createOrderSchema } from "./order.schema";

const productId = "c4f85fb0-750d-49a3-a095-f776a98b4a05";
const reviewId = "a38b830c-bbee-4bc3-95b1-5d241d0fbe66";

test("validates product review inputs", () => {
  assert.equal(
    createProductReviewSchema.safeParse({ rating: 5, description: "Great" }).success,
    true,
  );
  assert.equal(
    createProductReviewSchema.safeParse({ rating: 0, description: "Great" }).success,
    false,
  );
  assert.equal(
    createProductReviewSchema.safeParse({ rating: 6, description: "Great" }).success,
    false,
  );
  assert.equal(
    createProductReviewSchema.safeParse({ rating: 4, description: "   " }).success,
    false,
  );
  assert.equal(
    createProductReviewSchema.safeParse({ rating: 4, description: "x".repeat(1001) }).success,
    false,
  );
});

test("validates review sorting and deletion identifiers", () => {
  assert.equal(listProductReviewsQuerySchema.safeParse({ sort: "rating-desc" }).success, true);
  assert.equal(listProductReviewsQuerySchema.safeParse({ sort: "invalid" }).success, false);
  assert.equal(customerReviewParamsSchema.safeParse({ id: productId, reviewId }).success, true);
  assert.equal(customerReviewParamsSchema.safeParse({ id: "bad", reviewId: "bad" }).success, false);
});

test("validates testimonial messages", () => {
  assert.equal(createTestimonialSchema.safeParse({ message: "Helpful store" }).success, true);
  assert.equal(createTestimonialSchema.safeParse({ message: "   " }).success, false);
  assert.equal(createTestimonialSchema.safeParse({ message: "x".repeat(2001) }).success, false);
});

test("validates and normalizes mock card details", () => {
  const valid = processPaymentSchema.safeParse({
    orderId: productId,
    cardNumber: "4111 1111 1111 1111",
    expiryMonth: "12",
    expiryYear: String(new Date().getUTCFullYear() + 1),
    cvv: "123",
  });

  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.cardNumber, "4111111111111111");
  assert.equal(
    processPaymentSchema.safeParse({
      orderId: productId,
      cardNumber: "not-a-card",
      expiryMonth: "13",
      expiryYear: "2000",
      cvv: "1",
    }).success,
    false,
  );
});

test("requires a 10-digit checkout contact and a usable shipping address", () => {
  const order = {
    items: [{ productId, quantity: 1 }],
    shippingName: "Test Customer",
    shippingContact: "9812345678",
    shippingAddress: "Kathmandu, Nepal",
  };

  assert.equal(createOrderSchema.safeParse(order).success, true);
  assert.equal(createOrderSchema.safeParse({ ...order, shippingContact: "98123" }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...order, shippingAddress: "x" }).success, false);
});
