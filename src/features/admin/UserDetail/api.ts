import axios from "axios";
import { API } from "../../../api";
import type { UserProfile, GetUserProfileResponse } from "./types";

export async function getUserProfile(
  profileId: string
): Promise<GetUserProfileResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.get(profileId);
    const response = await api.get<GetUserProfileResponse>(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function getProfileOrders(profileId: string) {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = `${API.base}/profiles/${profileId}/orders`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function getFarmByAccountId(accountId: string) {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = `${API.base}/account/${accountId}/farm`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
