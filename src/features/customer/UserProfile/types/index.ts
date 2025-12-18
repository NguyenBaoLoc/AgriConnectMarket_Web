import type { ApiResponse } from "../../../../types";

type Status = "Processing" | "In Transit" | "Delivered" | "Cancelled";
interface UserInfo {
  accountId: string;
  avartarUrl: string;
  createdAt: string;
  createdBy: string;
  email: string;
  fullname: string;
  id: string;
  phone: string;
  updatedAt?: string;
  updatedBy?: string;
}
interface Order {
  orderCode: string;
  orderDate: string;
  status: Status;
  items: string[];
  total: number;
}
interface Address {
  createdAt: string;
  detail: string;
  district: string;
  id: string;
  isDefault: boolean;
  profileId: string;
  province: string;
  ward: string;
  updatedAt?: string;
}
type UserInfoResponse = ApiResponse<UserInfo>;
type UserAddressResponse = ApiResponse<Address[]>;
interface OrderListRequest {
  userId: string;
}
type OrderListResponse = ApiResponse<Order[]>;
type UpdateUserInfoResponse = ApiResponse;
type DeleteUserResponse = ApiResponse;
export type {
  Status,
  UserInfo,
  Order,
  Address,
  UserInfoResponse,
  OrderListRequest,
  OrderListResponse,
  UpdateUserInfoResponse,
  DeleteUserResponse,
  UserAddressResponse,
};
