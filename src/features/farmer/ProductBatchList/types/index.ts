import type { ApiResponse } from '../../../../types';

interface BatchCode {
  value: string;
}

interface ImageUrl {
  imageUrl: string;
  batchId: string;
  id: string;
}

interface ProductBatch {
  batchCode: BatchCode;
  totalYield: number;
  availableQuantity: number;
  units: string;
  price: number;
  plantingDate: string;
  harvestDate: string;
  seasonId: string;
  imageUrls: ImageUrl[];
  createdAt: string;
  updatedAt: string;
  id: string;
  season?: SeasonWithRelations;
}

interface ProductBatchCreate {
  batchId: string;
  batchCode: BatchCode;
  totalYield: number;
  availableQuantity: number;
  units: string;
  price: number;
  plantingDate: string;
  seasonId: string;
}

type ProductBatchListResponse = ApiResponse<ProductBatch[]>;
type ProductBatchDetailResponse = ApiResponse<ProductBatchDetail>;
type ProductBatchCreateResponse = ApiResponse<ProductBatchCreate>;

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

interface Product {
  productName: string;
  productAttribute: string;
  productDesc: string;
  categoryId: string;
  createdAt: string;
  id: string;
}

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
  updatedAt: string;
  farmerId: string;
  addressId: string;
  id: string;
}

interface SeasonWithRelations extends Season {
  farm: Farm;
  product: Product;
}

interface ProductBatchDetail extends ProductBatch {
  season: SeasonWithRelations;
}

export type {
  ProductBatch,
  ProductBatchListResponse,
  ProductBatchDetailResponse,
  ProductBatchCreateResponse,
  ProductBatchCreate,
  Season,
  Product,
  Farm,
  SeasonWithRelations,
  ProductBatchDetail,
  BatchCode,
  ImageUrl,
};
