import type { ApiResponse } from "../../../../types";

type Status = "Pending" | "Upcoming" | "Active" | "Completed";

interface Season {
  seasonName: string;
  seasonDesc: string;
  status: Status;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  farmId: string;
  productId: string;
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
  verificationQr?: string;
  plantingDate: string;
  harvestDate: string;
  seasonId: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
  id: string;
}

type SeasonDetailResponse = ApiResponse<Season>;
type ProductBatchListBySeason = ApiResponse<ProductBatch[]>;

export type { Season, SeasonDetailResponse, Status, ProductBatch, BatchCode, ProductBatchListBySeason };
