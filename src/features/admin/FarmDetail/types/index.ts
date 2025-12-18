import type { ApiResponse } from "../../../../types";

interface Address {
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Farmer {
  userName: string;
  role: string;
  verifiedAt: string;
  isActive: boolean;
  isDeLeted: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Season {
  seasonName: string;
  seasonDesc: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  farmId: string;
  productId: string;
  id: string;
}

interface Farm {
  farmName: string;
  farmDesc: string;
  batchCodePrefix?: string;
  bannerUrl: string;
  phone: string;
  area: string;
  isDelete: boolean;
  isBanned: boolean;
  isValidForSelling: boolean;
  isConfirmAsMall: boolean;
  createdAt: string;
  updatedAt?: string;
  farmerId: string;
  addressId: string;
  id: string;
  farmer?: Farmer;
  address?: Address;
  seasons?: Season[];
}

type GetFarmDetailResponse = ApiResponse<Farm>;
export type { Farm, GetFarmDetailResponse, Farmer, Address, Season };
