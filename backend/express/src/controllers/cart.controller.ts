import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as cartService from "../services/cart.service";

export const getCart: RequestHandler = asyncHandler(async (_request, response) => {
  response.json({ success: true, data: await cartService.getCart(response.locals.customer.id) });
});

export const addItem: RequestHandler = asyncHandler(async (request, response) => {
  const cart = await cartService.addItem(response.locals.customer.id, request.body);
  response.status(201).json({ success: true, data: cart });
});

export const updateItem: RequestHandler = asyncHandler(async (request, response) => {
  const cart = await cartService.updateItem(
    response.locals.customer.id,
    request.params.productId as string,
    request.body.quantity,
  );
  response.json({ success: true, data: cart });
});

export const removeItem: RequestHandler = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    data: await cartService.removeItem(
      response.locals.customer.id,
      request.params.productId as string,
    ),
  });
});

export const clearCart: RequestHandler = asyncHandler(async (_request, response) => {
  response.json({ success: true, data: await cartService.clearCart(response.locals.customer.id) });
});
