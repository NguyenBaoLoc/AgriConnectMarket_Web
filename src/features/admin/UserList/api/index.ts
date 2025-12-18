import axios from "axios";
import type { GetUserListResponse } from "../types";
import { API } from "../../../../api";

export async function getUserList(): Promise<GetUserListResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.list;
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
