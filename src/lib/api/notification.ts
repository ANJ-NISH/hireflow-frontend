import { apiRequest } from "./client";
import type { Pagination } from "./job";

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_WITHDRAWN"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_RESCHEDULED"
  | "INTERVIEW_CANCELLED"
  | "INTERVIEW_REMINDER"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "JOB_REMOVED";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};

export const NOTIFICATIONS_CHANGED_EVENT = "hireflow:notifications-changed";

export function emitNotificationsChanged(source: "bell" | "page") {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { source } }));
}

export function listNotifications(params: { unreadOnly?: boolean; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.unreadOnly) q.set("unreadOnly", "true");
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));

  return apiRequest<{
    notifications: AppNotification[];
    unreadCount: number;
    pagination: Pagination;
  }>(`/api/notifications?${q.toString()}`);
}

export function getUnreadCount() {
  return apiRequest<{ unreadCount: number }>("/api/notifications/unread-count");
}

export function markAsRead(id: string) {
  return apiRequest<null>(`/api/notifications/${id}/read`, { method: "POST" });
}

export function markAllAsRead() {
  return apiRequest<{ updated: number }>("/api/notifications/read-all", { method: "POST" });
}

export function deleteNotification(id: string) {
  return apiRequest<null>(`/api/notifications/${id}`, { method: "DELETE" });
}