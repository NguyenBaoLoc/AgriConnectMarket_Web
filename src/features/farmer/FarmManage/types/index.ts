import type { ApiResponse } from "../../../../types";

interface Farm {
  farmName: string;
  bannerUrl: string;
  phone: string;
  area: string;
  isDeleted: boolean;
  isBanned: boolean;
  isValidForSelling: boolean;
  isConfirmAsMall: boolean;
  farmerId: string;
  addressId: string;
  id: string;
}

interface Province {
  code: number;
  name: string;
  codename: string;
}

interface District {
  code: number;
  name: string;
  codename: string;
  province_code: number;
}

interface Ward {
  code: number;
  name: string;
  codename: string;
  district_code: number;
}

interface CreateFarmRequest {
  farmName: string;
  farmDesc: string;
  batchCodePrefix: string;
  phone: string;
  area: string;
  farmerId: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

interface CreateFarmResponse {
  farmId: string;
  farmName: string;
  farmDesc: string;
  bannerUrl: string;
  phone: string;
  area: string;
}

type FarmResponse = ApiResponse<Farm>;
type CreateFarmApiResponse = ApiResponse<CreateFarmResponse>;

export type {
  Farm,
  FarmResponse,
  Province,
  District,
  Ward,
  CreateFarmRequest,
  CreateFarmApiResponse,
};
