import axios from "axios";
import type { GetFarmListResponse } from "../types/index.ts";
import { API } from "../../../../api";

export async function getFarmList(): Promise<GetFarmListResponse> {
  try {
    const url = API.farm.list;
    const response = await axios.get<GetFarmListResponse>(url);
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
