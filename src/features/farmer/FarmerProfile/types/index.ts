import type { ApiResponse } from "../../../../types";

interface FarmerProfileInfo {
  fullname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accountId: string;
  createdAt: string;
  id: string;
  updatedAt?: string;
  updatedBy?: string;
}

type FarmerProfileResponse = ApiResponse<FarmerProfileInfo>;
type UpdateFarmerProfileResponse = ApiResponse;
type DeleteFarmerAccountResponse = ApiResponse;

export type {
  FarmerProfileInfo,
  FarmerProfileResponse,
  UpdateFarmerProfileResponse,
  DeleteFarmerAccountResponse,
};
