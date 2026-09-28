import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as testimonialService from "../services/testimonial.service";

export const listTestimonials: RequestHandler = asyncHandler(async (_request, response) => {
  const testimonials = await testimonialService.listTestimonials();

  response.json({ success: true, data: testimonials });
});

export const getMyTestimonial: RequestHandler = asyncHandler(async (_request, response) => {
  const testimonial = await testimonialService.getMyTestimonial(response.locals.customer.id);

  response.json({ success: true, data: testimonial });
});

export const createTestimonial: RequestHandler = asyncHandler(async (request, response) => {
  const testimonial = await testimonialService.createTestimonial(
    response.locals.customer.id,
    request.body,
  );

  response.status(201).json({ success: true, data: testimonial });
});
