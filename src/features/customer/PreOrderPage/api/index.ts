import axios from 'axios';
import { API } from '../../../../api';
import type { PreOrderRequest, PreOrderResponse } from '../types';

export async function createPreOrder(
  payload: PreOrderRequest
): Promise<PreOrderResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post<PreOrderResponse>(
      API.order.preOrder,
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      return (error.response as { data: PreOrderResponse }).data;
    }
    throw error;
  }
}
