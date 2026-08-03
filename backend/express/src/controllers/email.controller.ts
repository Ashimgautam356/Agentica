import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as emailService from "../services/email.service";

export const sendEmail: RequestHandler = asyncHandler(async (request, response) => {
  const email = await emailService.sendEmail(request.body);

  response.status(202).json({ success: true, data: email });
});
