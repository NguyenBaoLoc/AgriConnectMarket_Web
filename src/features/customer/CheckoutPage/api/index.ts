import axios from "axios";
import type { ApiResponse } from "../../../../types";
import { API } from "../../../../api";
import type { CreateOrderRequest, CreateOrderResponse } from "../types";

export interface Address {
  id: string;
  detail: string;
  createdAt: string;
  createdBy: string;
}

export interface ShippingFeeResponse {
  success: boolean;
  message: string;
  data: number;
}

export type AddressListResponse = ApiResponse<Address[]>;

export async function getAddresses(): Promise<AddressListResponse> {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<AddressListResponse>(API.address.me, {
      headers,
    });
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: AddressListResponse }).data;
    }
    throw error;
  }
}

export async function getShippingFee(
  farmId: string,
  addressId: string,
  weight: number
): Promise<ShippingFeeResponse> {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const params = new URLSearchParams({
      farmId: farmId.toString(),
      addressId: addressId.toString(),
      weight: weight.toString(),
    }).toString();
    const response = await axios.get<ShippingFeeResponse>(
      `${API.shipping.calculateFee}?${params}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: ShippingFeeResponse }).data;
    }
    throw error;
  }
}

export async function createOrder(
  payload: CreateOrderRequest
): Promise<CreateOrderResponse> {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post<CreateOrderResponse>(
      API.order.create,
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: CreateOrderResponse }).data;
    }
    throw error;
  }
}

export async function initiatePayment(
  orderId: string
): Promise<any> {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };

    const paymentPayload = { orderId };
    console.log("Payment API payload:", paymentPayload);

    const response = await axios.post<any>(
      `${API.order.create.replace("/orders", "/payments")}`,
      paymentPayload,
      { headers }
    );
    
    // Handle both response formats:
    // Format 1: { success: true, data: { paymentUrl: "..." } }
    // Format 2: { paymentUrl: "..." }
    const responseData = response.data;
    console.log("Payment response:", responseData);
    
    return {
      success: true,
      data: {
        paymentUrl: responseData.paymentUrl || responseData.data?.paymentUrl || null
      }
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: ApiResponse<any> }).data;
    }
    throw error;
  }
}

export async function getOrderByCode(
  orderCode: string
): Promise<CreateOrderResponse> {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<CreateOrderResponse>(
      API.order.getByCode(orderCode),
      { headers }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: CreateOrderResponse }).data;
    }
    throw error;
  }
}
