import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as categoryService from "../services/category.service";

export const listCategories: RequestHandler = asyncHandler(async (_request, response) => {
  const categories = await categoryService.listCategories();

  response.json({ success: true, data: categories });
});

export const getCategory: RequestHandler = asyncHandler(async (request, response) => {
  const category = await categoryService.getCategory(request.params.id as string);

  response.json({ success: true, data: category });
});

export const createCategory: RequestHandler = asyncHandler(async (request, response) => {
  const category = await categoryService.createCategory(request.body);

  response.status(201).json({ success: true, data: category });
});

export const updateCategory: RequestHandler = asyncHandler(async (request, response) => {
  const category = await categoryService.updateCategory(request.params.id as string, request.body);

  response.json({ success: true, data: category });
});

export const deleteCategory: RequestHandler = asyncHandler(async (request, response) => {
  await categoryService.deleteCategory(request.params.id as string);

  response.status(204).send();
});
