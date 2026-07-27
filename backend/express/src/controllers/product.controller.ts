import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as productService from "../services/product.service";

export const listProducts: RequestHandler = asyncHandler(async (_request, response) => {
  const products = await productService.listProducts();

  response.json({ success: true, data: products });
});

export const getProduct: RequestHandler = asyncHandler(async (request, response) => {
  const product = await productService.getProduct(request.params.id as string);

  response.json({ success: true, data: product });
});

export const listProductsByCategory: RequestHandler = asyncHandler(async (request, response) => {
  const products = await productService.listProductsByCategory(request.params.id as string);

  response.json({ success: true, data: products });
});

export const createProduct: RequestHandler = asyncHandler(async (request, response) => {
  const product = await productService.createProduct(request.body);

  response.status(201).json({ success: true, data: product });
});

export const updateProduct: RequestHandler = asyncHandler(async (request, response) => {
  const product = await productService.updateProduct(request.params.id as string, request.body);

  response.json({ success: true, data: product });
});

export const deleteProduct: RequestHandler = asyncHandler(async (request, response) => {
  await productService.deleteProduct(request.params.id as string);

  response.status(204).send();
});
