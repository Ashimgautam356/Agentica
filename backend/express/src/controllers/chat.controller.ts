import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as chatService from "../services/chat.service";

export const sendMessage: RequestHandler = asyncHandler(async (request, response) => {
  const result = await chatService.sendMessage(
    response.locals.customer.id,
    request.params.sessionId as string,
    request.body.content,
    request.body.handoffSummary,
  );
  response.status(201).json({ success: true, data: result });
});

export const getConversation: RequestHandler = asyncHandler(async (request, response) => {
  const conversation = await chatService.getConversation(
    response.locals.customer.id,
    request.params.sessionId as string,
  );
  response.json({ success: true, data: conversation });
});

export const getSummary: RequestHandler = asyncHandler(async (request, response) => {
  const summary = await chatService.getConversationSummary(
    response.locals.customer.id,
    request.params.sessionId as string,
  );
  response.json({ success: true, data: summary });
});
