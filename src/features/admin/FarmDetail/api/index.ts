import axios from "axios";
import { API } from "../../../../api";
import type { GetFarmDetailResponse } from "../types";

export async function getFarmDetail(
  farmId: string
): Promise<GetFarmDetailResponse> {
  try {
    const url = API.farm.get(farmId);
    const response = await axios.get<GetFarmDetailResponse>(url);
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
