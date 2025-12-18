import type { ApiResponse } from "../../../../types";

interface FarmData {
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
  addressId: string;
  id: string;
}

interface BatchCode {
  value: string;
}

interface ProductBatch {
  batchCode: BatchCode;
  totalYield: number;
  availableQuantity: number;
  units: string;
  price: number;
  plantingDate: string;
  harvestDate?: string;
  seasonId: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
  id: string;
  verificationQr?: string;
  season?: any;
}

type FarmResponse = ApiResponse<FarmData>;
type FarmBatchesResponse = ApiResponse<ProductBatch[]>;

export type { FarmData, ProductBatch, FarmResponse, FarmBatchesResponse, BatchCode };
