import type { ApiResponse } from '../../../../types';
import type { Order } from '../../OrdersPage/types';

type NotificationType = 'Vouncher' | 'Order';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  isDeleted: boolean;
  profileId: string;
  createdAt: string;
  order: Order | null;
}
interface GetMyNotificationResponse extends ApiResponse<Notification[]> {}
interface UpdateNotificationResponse extends ApiResponse<string> {}
export type {
  Notification,
  GetMyNotificationResponse,
  UpdateNotificationResponse,
};
