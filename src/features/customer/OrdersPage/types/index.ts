import type { ApiResponse } from "../../../../types";

type OrderStatus = "Pending" | "Processing" | "In Transit" | "Delivered" | "Cancelled";
type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled";

interface OrderItem {
  orderId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  id: string;
}

interface Order {
  customerId: string;
  addressId: string;
  orderCode: string;
  totalPrice: number;
  orderDate: string;
  shippingFee: number;
  orderStatus: OrderStatus;
  orderType: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  orderItems: OrderItem[];
  id: string;
  customer?: {
    fullname: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  address?: {
    province: string;
    district: string;
    ward: string;
    detail: string;
  };
}

type GetOrdersResponse = ApiResponse<Order[]>;
export type { Order, OrderStatus, PaymentStatus, OrderItem, GetOrdersResponse };
