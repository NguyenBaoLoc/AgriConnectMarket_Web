import axios from 'axios';
import { API } from '../../../../api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface FarmItem {
  farmName: string;
  farmDesc?: string;
  bannerUrl?: string;
  phone?: string;
  area?: string;
  isConfirmAsMall?: boolean;
  createdAt?: string;
  id: string;
}

export async function getFarms(
  searchTerm?: string,
  isMallFarm?: boolean
): Promise<ApiResponse<FarmItem[]>> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const params: Record<string, any> = {};
    if (searchTerm) params.searchTerm = searchTerm;
    if (typeof isMallFarm === 'boolean') params.IsMallFarm = isMallFarm;

    const response = await api.get<ApiResponse<FarmItem[]>>(API.farm.list, {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}
