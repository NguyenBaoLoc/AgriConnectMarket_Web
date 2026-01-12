import axios from "axios";
import { API } from "../../../../api";
import type { GetMyNotificationResponse, Notification, UpdateNotificationResponse } from "../types";

export async function getMyNotifications(): Promise<Notification[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(API.notifications.me, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data as GetMyNotificationResponse;
    if (responseData.success) {
      return responseData.data || [];
    } else {
      throw new Error(responseData.message || 'Failed to load notifications');
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function updateNotificationStatus(notificationId: string): Promise<string> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(API.notifications.patch(notificationId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data as UpdateNotificationResponse;
    if (responseData.success) {
      return responseData.data || "";
    } else {
      throw new Error(responseData.message || 'Failed to update notification status');
    }
  } catch (error) {
    console.error("Error updating notification status:", error);
    return "";
  }
}

export async function readAll(): Promise<string> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(API.notifications.readall, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = response.data as UpdateNotificationResponse;
    if (responseData.success) {
      return responseData.data || "";
    } else {
      throw new Error(responseData.message || 'Failed to update notification status');
    }
  } catch (error) {
    console.error("Error updating notification status:", error);
    return "";
  }
}