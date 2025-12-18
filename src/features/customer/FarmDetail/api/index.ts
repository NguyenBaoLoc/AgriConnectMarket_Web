import axios from "axios";
import { API } from "../../../../api";
import type { FarmResponse, FarmBatchesResponse } from "../types";

export async function getFarmDetails(farmId: string): Promise<FarmResponse> {
  try {
    const url = API.farm.get(farmId);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<FarmResponse>(url, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as FarmResponse;
    } else {
      return {
        success: false,
        message: "Error fetching farm details",
      };
    }
  }
}

export async function getFarmProductBatches(
  farmId: string
): Promise<FarmBatchesResponse> {
  try {
    const url = `${API.productBatch.list}/farm/${farmId}`;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<FarmBatchesResponse>(url, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as FarmBatchesResponse;
    } else {
      return {
        success: false,
        message: "Error fetching farm batches",
      };
    }
  }
}
