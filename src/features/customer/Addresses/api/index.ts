import axios from 'axios';
import { API } from '../../../../api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface AddressItem {
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  profileId?: string;
  id: string;
}

export async function getAddressesMe(): Promise<ApiResponse<AddressItem[]>> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const response = await api.get<ApiResponse<AddressItem[]>>(API.address.me);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}

export async function addAddress(
  payload: Omit<AddressItem, 'id'>
): Promise<ApiResponse<AddressItem>> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const response = await api.post<ApiResponse<AddressItem>>(
      API.address.add,
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}

export async function updateAddress(
  addressId: string,
  payload: Partial<AddressItem>
): Promise<ApiResponse<AddressItem>> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const response = await api.put<ApiResponse<AddressItem>>(
      API.address.update(addressId),
      payload
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}

export async function setDefaultAddress(
  addressId: string,
): Promise<ApiResponse<AddressItem>> {
  try {
    const token = localStorage.getItem('token');

    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const response = await api.patch<ApiResponse<AddressItem>>(
      API.address.setDefault(addressId),
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}

export async function deleteAddress(
  addressId: string
): Promise<ApiResponse<null>> {
  try {
    const token = localStorage.getItem('token');
    const api = axios.create({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const response = await api.delete<ApiResponse<null>>(
      API.address.delete(addressId)
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
}
