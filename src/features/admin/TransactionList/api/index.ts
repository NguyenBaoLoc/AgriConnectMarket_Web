import axios from 'axios';
import type {
  GetTransactionListResponse,
  GetTransactionDetailResponse,
} from '../types/index';
import { API } from '../../../../api';

export async function getTransactionList(): Promise<GetTransactionListResponse> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.transaction.list;
    const response = await api.get(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function getTransactionDetail(
  transactionId: string
): Promise<GetTransactionDetailResponse> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.transaction.get(transactionId);
    const response = await api.get(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
export async function resolveTransaction(
  transactionId: string
): Promise<GetTransactionDetailResponse> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.transaction.resolve(transactionId);
    const response = await api.patch(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
