import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import * as orderService from "../services/order.service";

export const listOrders: RequestHandler = asyncHandler(async (request, response) => {
  const orders = await orderService.listOrders(getPagination(request.query));

  response.json({ success: true, data: orders });
});

export const listMyOrders: RequestHandler = asyncHandler(async (request, response) => {
  const orders = await orderService.listCustomerOrders(
    response.locals.customer.id,
    getPagination(request.query),
  );

  response.json({ success: true, data: orders });
});

export const getOrder: RequestHandler = asyncHandler(async (request, response) => {
  const order = await orderService.getOrder(request.params.id as string);

  response.json({ success: true, data: order });
});

export const getMyOrder: RequestHandler = asyncHandler(async (request, response) => {
  const order = await orderService.getCustomerOrder(
    response.locals.customer.id,
    request.params.id as string,
  );

  response.json({ success: true, data: order });
});

export const createOrder: RequestHandler = asyncHandler(async (request, response) => {
  const order = await orderService.createOrder(response.locals.customer.id, request.body);

  response.status(201).json({ success: true, data: order });
});

export const updateOrderStatus: RequestHandler = asyncHandler(async (request, response) => {
  const order = await orderService.updateOrderStatus(request.params.id as string, request.body);

  response.json({ success: true, data: order });
});
