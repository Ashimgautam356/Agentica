import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as notificationService from "../services/notification.service";

export const listMyNotifications: RequestHandler = asyncHandler(async (_request, response) => {
  const notifications = await notificationService.listNotifications(response.locals.customer.id);
  response.json({ success: true, data: notifications });
});

export const getMyUnreadCount: RequestHandler = asyncHandler(async (_request, response) => {
  const result = await notificationService.getUnreadCount(response.locals.customer.id);
  response.json({ success: true, data: result });
});

export const markMyNotificationRead: RequestHandler = asyncHandler(async (request, response) => {
  const notification = await notificationService.markNotificationRead(
    response.locals.customer.id,
    request.params.id as string,
  );
  response.json({ success: true, data: notification });
});

export const markAllMyNotificationsRead: RequestHandler = asyncHandler(
  async (_request, response) => {
    const result = await notificationService.markAllNotificationsRead(response.locals.customer.id);
    response.json({ success: true, data: result });
  },
);
