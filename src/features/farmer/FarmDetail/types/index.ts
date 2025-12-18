import type { ApiResponse } from "../../../../types";

interface FarmAddress {
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

interface FarmerProfile {
  fullname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accountId: string;
  createdAt: string;
  id: string;
}

interface Farmer {
  userName: string;
  password: string;
  role: string;
  verifiedAt: string;
  isActive: boolean;
  isDeLeted: boolean;
  createdAt: string;
  updatedAt: string;
  profile: FarmerProfile;
  id: string;
}

interface Season {
  seasonName: string;
  seasonDesc: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  farmId: string;
  productId: string;
  id: string;
}

interface FarmDetail {
  farmName: string;
  farmDesc: string;
  batchCodePrefix: string;
  bannerUrl: string;
  certificateUrl?: string;
  phone: string;
  area: string;
  isDelete: boolean;
  isBanned: boolean;
  isValidForSelling: boolean;
  isConfirmAsMall: boolean;
  createdAt: string;
  updatedAt: string;
  farmerId: string;
  farmer: Farmer;
  addressId: string;
  address: FarmAddress;
  seasons: Season[];
  id: string;
}

type FarmDetailResponse = ApiResponse<FarmDetail>;
export type { FarmDetail, FarmDetailResponse };
