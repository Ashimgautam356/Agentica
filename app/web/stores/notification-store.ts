"use client";

import { create } from "zustand";
import { api, getApiError, type ApiResponse } from "@/lib/api";

export type Notification = {
  id: string;
  orderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationState = {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: "",

  reset() {
    set({ items: [], unreadCount: 0, isLoading: false, error: "" });
  },

  async fetchNotifications() {
    set({ isLoading: true, error: "" });
    try {
      const response = await api.get<ApiResponse<Notification[]>>("/notifications");
      const items = response.data.data;
      set({ items, unreadCount: items.filter((item) => !item.isRead).length, isLoading: false });
    } catch (error) {
      set({ error: getApiError(error, "Could not load notifications."), isLoading: false });
    }
  },

  async fetchUnreadCount() {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
      set({ unreadCount: response.data.data.count });
    } catch {
      // The next poll retries automatically.
    }
  },

  async markRead(id) {
    const notification = get().items.find((item) => item.id === id);
    if (!notification || notification.isRead) return;

    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: getApiError(error, "Could not mark notification as read.") });
    }
  },

  async markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      set((state) => ({
        items: state.items.map((item) => ({ ...item, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: getApiError(error, "Could not mark notifications as read.") });
    }
  },
}));
