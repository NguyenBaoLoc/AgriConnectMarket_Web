import type { ApiResponse } from "../../../../types";

export interface Address {
  id: string;
  detail: string;
  createdAt: string;
  createdBy: string;
}

export interface FarmShippingFee {
  farmId: string;
  farmName: string;
  fee: number;
  isLoading: boolean;
  error: string | null;
}

export interface OrderItemRequest {
  batchId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  addressId: string;
  orderCode: string;
  orderDate: string;
  orderType: string;
  shippingFee: number;
  paymentMethod: string;
  orderItems: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface AddressResponse {
  id: string;
  profileId: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  isDelete: boolean;
  createdAt: string;
}

export interface CustomerResponse {
  id: string;
  accountId: string;
  fullname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  addressId: string;
  orderCode: string;
  orderDate: string;
  totalPrice: number;
  shippingFee: number;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  customer: CustomerResponse;
  address: AddressResponse;
  orderItems: OrderItemResponse[];
}

export type CreateOrderResponse = ApiResponse<OrderResponse>;
