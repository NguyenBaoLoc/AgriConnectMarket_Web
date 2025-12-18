import axios from "axios";
import { API } from "../../../../api";
import type { FarmResponse, CreateFarmApiResponse, Province, District, Ward } from "../types";

// Axios instance for location API
const openApiClient = axios.create({
  baseURL: "https://provinces.open-api.vn/api/",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Location API Service
class LocationApiService {
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await openApiClient.get("/p/");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching provinces:", error);
      throw new Error(error.response?.data?.error || "Error fetching provinces");
    }
  }

  async getDistricts(provinceCode: string): Promise<District[]> {
    try {
      const response = await openApiClient.get(`/p/${provinceCode}?depth=2`);
      return response.data.districts || [];
    } catch (error: any) {
      console.error("Error fetching districts:", error);
      throw new Error(error.response?.data?.error || "Error fetching districts");
    }
  }

  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      const response = await openApiClient.get(`/d/${districtCode}?depth=2`);
      return response.data.wards || [];
    } catch (error: any) {
      console.error("Error fetching wards:", error);
      throw new Error(error.response?.data?.error || "Error fetching wards");
    }
  }
}

const locationService = new LocationApiService();

// Farm API Functions
export const getFarms = async (): Promise<FarmResponse> => {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.farm.me;
    const response = await api.get<FarmResponse>(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

export const createFarm = async (
  farmData: any,
  bannerFile?: File
): Promise<CreateFarmApiResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("farmName", farmData.farmName);
    formData.append("farmDesc", farmData.farmDesc);
    formData.append("batchCodePrefix", farmData.batchCodePrefix);
    formData.append("phone", farmData.phone);
    formData.append("area", farmData.area);
    formData.append("farmerId", farmData.farmerId);
    formData.append("province", farmData.province);
    formData.append("district", farmData.district);
    formData.append("ward", farmData.ward);
    formData.append("detail", farmData.detail);

    if (bannerFile) {
      formData.append("farmBanner", bannerFile);
    }

    const response = await axios.post<CreateFarmApiResponse>(
      API.farm.add,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error creating farm",
      };
    }
  }
};

// Location API exports
export const getProvinces = async (): Promise<Province[]> => {
  return locationService.getProvinces();
};

export const getDistricts = async (provinceCode: string): Promise<District[]> => {
  return locationService.getDistricts(provinceCode);
};

export const getWards = async (districtCode: string): Promise<Ward[]> => {
  return locationService.getWards(districtCode);
};
