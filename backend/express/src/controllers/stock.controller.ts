import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import * as stockService from "../services/stock.service";

export const listStocks: RequestHandler = asyncHandler(async (request, response) => {
  const stocks = await stockService.listStocks(getPagination(request.query));

  response.json({ success: true, data: stocks });
});

export const getStock: RequestHandler = asyncHandler(async (request, response) => {
  const stock = await stockService.getStock(request.params.id as string);

  response.json({ success: true, data: stock });
});

export const createStock: RequestHandler = asyncHandler(async (request, response) => {
  const stock = await stockService.createStock(request.body);

  response.status(201).json({ success: true, data: stock });
});

export const updateStock: RequestHandler = asyncHandler(async (request, response) => {
  const stock = await stockService.updateStock(request.params.id as string, request.body);

  response.json({ success: true, data: stock });
});

export const deleteStock: RequestHandler = asyncHandler(async (request, response) => {
  await stockService.deleteStock(request.params.id as string);

  response.status(204).send();
});
