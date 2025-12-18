import axios from "axios";
import { API } from "../../../../api";
import type {
  DeleteFarmerAccountResponse,
  FarmerProfileInfo,
  FarmerProfileResponse,
  UpdateFarmerProfileResponse,
} from "../types";

export async function getFarmerProfile(): Promise<FarmerProfileResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.me;
    const response = await api.get<FarmerProfileResponse>(url);
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

export async function updateFarmerProfile(
  request: FarmerProfileInfo
): Promise<UpdateFarmerProfileResponse> {
  try {
    const farmerId = request.id;
    const { fullname, email, phone } = request;
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.profile.update(farmerId);
    const response = await api.put<UpdateFarmerProfileResponse>(url, {
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

export async function deleteFarmerAccount(): Promise<DeleteFarmerAccountResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.auth.deactive;
    const response = await api.patch<DeleteFarmerAccountResponse>(url);
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
