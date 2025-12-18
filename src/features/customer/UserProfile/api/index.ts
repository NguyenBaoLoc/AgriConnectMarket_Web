import axios from "axios";
import { API } from "../../../../api";
import type {
  DeleteUserResponse,
  Order,
  OrderListRequest,
  OrderListResponse,
  UpdateUserInfoResponse,
  UserAddressResponse,
  UserInfo,
  UserInfoResponse,
} from "../types";

export async function getUserInfo(): Promise<UserInfoResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.me;
    const response = await api.get<UserInfoResponse>(url);
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

export async function getUserAddress(): Promise<UserAddressResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.address.me;
    const response = await api.get<UserAddressResponse>(url);
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

export async function getOrderList(
  request: OrderListRequest
): Promise<OrderListResponse> {
  try {
    return {
      success: true,
      message: "",
      data: [
        {
          orderCode: "12345",
          orderDate: "Oct 14, 2025",
          items: ["Fresh Strawberries", "Organic Tomatoes", "Spinach"],
          total: 25.47,
          status: "Delivered",
        },
        {
          orderCode: "12344",
          orderDate: "Oct 5, 2025",
          items: ["Bananas", "Carrots", "Green Lettuce", "Coffee"],
          total: 18.27,
          status: "In Transit",
        },
        {
          orderCode: "12343",
          orderDate: "Sep 28, 2025",
          items: ["Mixed Berries", "Kale", "Bell Peppers"],
          total: 32.97,
          status: "Delivered",
        },
      ],
    };
    // const url = API.customer.detail;
    // const response = await axios.post<OrderListResponse>(url, request);
    // const responseData = response.data;
    // return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function updateUserInfo(
  request: UserInfo
): Promise<UpdateUserInfoResponse> {
  try {
    const userId = request.id;
    const { fullname, email, phone } = request;
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.update(userId);
    const response = await api.put<UpdateUserInfoResponse>(url, {
      fullname,
      email,
      phone,
    });
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

export async function deleteUserInfo(
  request: UserInfo
): Promise<DeleteUserResponse> {
  try {
    return {
      success: true,
      message: "",
      data: undefined,
    };
    // const url = API.customer.delete;
    // const response = await axios.patch<DeleteUserResponse>(url, request);
    // const responseData = response.data;
    // return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
