import axios from "axios";
import { API } from "../../../../api";
import type { GetOrdersResponse } from "../types";

export async function getOrderList(): Promise<GetOrdersResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.order.me;
    const response = await api.get<GetOrdersResponse>(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
