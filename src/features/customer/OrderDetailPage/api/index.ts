import axios from 'axios';
import { API } from '../../../../api';

interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function getOrderDetail(
  orderId: string
): Promise<OrderDetailResponse> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.order.get(orderId);
    const response = await api.get<OrderDetailResponse>(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: string
): Promise<OrderDetailResponse> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.order.updateStatus(orderId);
    const response = await api.patch<OrderDetailResponse>(url, {
      orderStatus,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
