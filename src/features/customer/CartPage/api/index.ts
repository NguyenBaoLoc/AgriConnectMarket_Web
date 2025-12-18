import axios from 'axios';
import type { GetCartItemResponse, UpdateDeleteCartResponse } from '../types';
import { API } from '../../../../api';

export interface AddToCartRequest {
  cartId: string;
  batchId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  batchId: string;
  quantity: number;
}

export async function getCartItems(): Promise<GetCartItemResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<GetCartItemResponse>(API.cart.me, {
      headers,
    });
    const responseData = response.data;
    return responseData;
  } catch (error) {
    if (
      error instanceof Error &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      return (error.response as { data: GetCartItemResponse }).data;
    }
    throw error;
  }
}

export async function addToCart(
  payload: AddToCartRequest
): Promise<GetCartItemResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post<GetCartItemResponse>(
      API.cart.add,
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
      return (error.response as { data: GetCartItemResponse }).data;
    }
    throw error;
  }
}

export async function updateCartItemQuantity(
  cartId: string,
  payload: UpdateCartItemRequest
): Promise<UpdateDeleteCartResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.patch<UpdateDeleteCartResponse>(
      API.cart.updateItem(cartId),
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
      return (error.response as { data: UpdateDeleteCartResponse }).data;
    }
    throw error;
  }
}

export async function removeCartItem(
  itemId: string
): Promise<UpdateDeleteCartResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.delete<UpdateDeleteCartResponse>(
      API.cart.removeItem(itemId),
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
      return (error.response as { data: UpdateDeleteCartResponse }).data;
    }
    throw error;
  }
}

export async function deleteAllCart(
  cartId: string
): Promise<UpdateDeleteCartResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // PATCH with empty body to the delete-all endpoint
    const response = await axios.patch<UpdateDeleteCartResponse>(
      API.cart.deleteAll(cartId),
      {},
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
      return (error.response as { data: UpdateDeleteCartResponse }).data;
    }
    throw error;
  }
}
