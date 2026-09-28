import assert from "node:assert/strict";
import test from "node:test";
import { cartUpsertData } from "./cart.service";

const userId = "b7571387-278f-488e-8667-5b7cf3cb2322";
const productId = "c4f85fb0-750d-49a3-a095-f776a98b4a05";

test("cart additions are user-scoped and cumulative", () => {
  assert.deepEqual(cartUpsertData(userId, { productId, quantity: 2 }), {
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity: 2 },
    update: { quantity: { increment: 2 } },
  });
});
