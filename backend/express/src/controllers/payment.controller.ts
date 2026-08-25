import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import * as paymentService from "../services/payment.service";

export const listPayments: RequestHandler = asyncHandler(async (request, response) => {
  const payments = await paymentService.listPayments(getPagination(request.query));

  response.json({ success: true, data: payments });
});

export const getPayment: RequestHandler = asyncHandler(async (request, response) => {
  const payment = await paymentService.getPayment(request.params.id as string);

  response.json({ success: true, data: payment });
});

export const createPayment: RequestHandler = asyncHandler(async (request, response) => {
  const payment = await paymentService.createPayment(
    response.locals.customer.id,
    request.params.id as string,
    request.body,
  );

  response.status(201).json({ success: true, data: payment });
});

export const updatePaymentStatus: RequestHandler = asyncHandler(async (request, response) => {
  const payment = await paymentService.updatePaymentStatus(
    request.params.id as string,
    request.body,
  );

  response.json({ success: true, data: payment });
});
