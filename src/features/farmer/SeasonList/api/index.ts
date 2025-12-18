import axios from "axios";
import { API } from "../../../../api";
import type { FarmResponse, SeasonListResponse } from "../types";
import type { ApiResponse } from "../../../../types";

export async function getSeasons(): Promise<SeasonListResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.season.byFarm(localStorage.getItem("farmId") || "");
    const response = await api.get<SeasonListResponse>(url);
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

export async function getSeasonsByFarm(farmId: string): Promise<SeasonListResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.season.byFarm(farmId);
    const response = await api.get<SeasonListResponse>(url);
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

export async function createSeason(data: {
  seasonName: string;
  seasonDesc: string;
  startDate: string;
  endDate: string;
  farmId: string;
  productId: string;
}): Promise<ApiResponse<any>> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.season.add;
    const response = await api.post<ApiResponse<any>>(url, data);
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
