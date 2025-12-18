import type { ApiResponse } from "../../../../types";

interface Farm {
  farmName: string;
  farmDesc: string;
  batchCodePrefix: string;
  bannerUrl: string;
  phone: string;
  area: string;
  isDelete: boolean;
  isBanned: boolean;
  isValidForSelling: boolean;
  isConfirmAsMall: boolean;
  createdAt: string;
  farmerId: string;
  addressId: string;
  id: string;
}

type GetFarmListResponse = ApiResponse<Farm[]>;
export type { Farm, GetFarmListResponse };
