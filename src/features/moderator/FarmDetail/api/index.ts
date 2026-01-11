import axios from 'axios';
import type {
  GetFarmListResponse,
  GetFarmDetailResponse,
} from '../types/index.ts';
import { API } from '../../../../api/index.ts';

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

export async function allowFarmForSelling(
  farmId: string
): Promise<GetFarmDetailResponse> {
  try {
    const url = `${API.farm.get(farmId)}/allow-selling`;
    const response = await axios.patch<GetFarmDetailResponse>(url);
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

export async function certificateVerifiedFarm(
  farmId: string
): Promise<GetFarmDetailResponse> {
  try {
    const url = `${API.farm.get(farmId)}/mark-as-mall`;
    const response = await axios.patch<GetFarmDetailResponse>(url);
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
