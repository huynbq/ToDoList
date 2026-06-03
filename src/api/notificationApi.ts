import { apiClient } from "./http";
import type {
  ReminderNotification,
  ReminderNotificationResponse,
  ReminderNotificationsResponse,
} from "../types/types";

export const getUnreadNotifications = async (): Promise<ReminderNotification[]> => {
  const { data } = await apiClient.get<ReminderNotificationsResponse>("/notifications");
  return data.data;
};

export const markNotificationRead = async (id: string): Promise<ReminderNotification> => {
  const { data } = await apiClient.patch<ReminderNotificationResponse>(`/notifications/${id}/read`);
  return data.data;
};
