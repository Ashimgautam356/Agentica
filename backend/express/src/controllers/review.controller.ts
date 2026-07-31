import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import * as reviewService from "../services/review.service";

export const listReviews: RequestHandler = asyncHandler(async (request, response) => {
  const reviews = await reviewService.listReviews(getPagination(request.query));

  response.json({ success: true, data: reviews });
});

export const createReview: RequestHandler = asyncHandler(async (request, response) => {
  const review = await reviewService.createReview(request.body);

  response.status(201).json({ success: true, data: review });
});

export const deleteReview: RequestHandler = asyncHandler(async (request, response) => {
  await reviewService.deleteReview(request.params.id as string);

  response.status(204).send();
});
