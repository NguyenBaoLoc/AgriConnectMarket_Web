import axios from "axios";
import { API } from "../../../../api";
import type { FarmDetailResponse } from "../types";

export const getFarmDetail = async (
  farmId: string
): Promise<FarmDetailResponse> => {
  try {
    const url = API.farm.get(farmId);
    const response = await axios.get<FarmDetailResponse>(url);
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

export const updateFarm = async (
  farmId: string,
  farmData: any,
  bannerFile?: File
): Promise<FarmDetailResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("farmName", farmData.farmName);
    formData.append("farmDesc", farmData.farmDesc);
    formData.append("phone", farmData.phone);
    formData.append("area", farmData.area);

    if (bannerFile) {
      formData.append("farmBanner", bannerFile);
    }

    const response = await axios.put<FarmDetailResponse>(
      API.farm.update(farmId),
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
        message: "Error updating farm",
      };
    }
  }
};

export const deleteFarm = async (farmId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.delete(API.farm.delete(farmId), {
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error deleting farm",
      };
    }
  }
};

export const uploadCertificate = async (
  farmId: string,
  certificateFile: File
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("FarmId", farmId);
    formData.append("Certificate", certificateFile);

    const response = await axios.post(
      API.farm.addCert(farmId),
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
        message: "Error uploading certificate",
      };
    }
  }
};

export const updateCertificate = async (
  farmId: string,
  certificateFile: File
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("FarmId", farmId);
    formData.append("Certificate", certificateFile);

    const response = await axios.put(
      API.farm.updateCert(farmId),
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
        message: "Error updating certificate",
      };
    }
  }
};

export const deleteCertificate = async (farmId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.delete(
      API.farm.deleteCert(farmId),
      {
        headers,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error deleting certificate",
      };
    }
  }
};
