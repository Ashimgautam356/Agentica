import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import type { ListProductReviewsQueryInput } from "../schemas/review.schema";
import * as reviewService from "../services/review.service";

export const listReviews: RequestHandler = asyncHandler(async (request, response) => {
  const reviews = await reviewService.listReviews(getPagination(request.query));

  response.json({ success: true, data: reviews });
});

export const createReview: RequestHandler = asyncHandler(async (request, response) => {
  const review = await reviewService.createReview(request.body);

  response.status(201).json({ success: true, data: review });
});

export const listProductReviews: RequestHandler = asyncHandler(async (request, response) => {
  const reviews = await reviewService.listProductReviews(
    request.params.id as string,
    request.query as unknown as ListProductReviewsQueryInput,
    getPagination(request.query),
  );

  response.json({ success: true, data: reviews });
});

export const createProductReview: RequestHandler = asyncHandler(async (request, response) => {
  const review = await reviewService.createProductReview(
    response.locals.customer.id,
    request.params.id as string,
    request.body,
  );

  response.status(201).json({ success: true, data: review });
});

export const deleteProductReview: RequestHandler = asyncHandler(async (request, response) => {
  await reviewService.deleteProductReview(
    request.params.reviewId as string,
    request.params.id as string,
    response.locals.customer.id,
  );

  response.status(204).send();
});

export const deleteReview: RequestHandler = asyncHandler(async (request, response) => {
  await reviewService.deleteReview(request.params.id as string);

  response.status(204).send();
});
