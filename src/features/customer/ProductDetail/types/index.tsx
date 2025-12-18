import type { ApiResponse } from '../../../../types';

interface NutritionFacts {
  servingSize: string;
  calories: string;
  protein: string;
  carbs: string;
  fiber: string;
  vitaminC: string;
}

interface BatchCode {
  value: string;
}

interface Farm {
  id: string;
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
  seasons: Season[];
}

interface Product {
  id: string;
  productName: string;
  productAttribute: string;
  productDesc: string;
  categoryId: string;
  seasons: Season[];
  createdAt: string;
}

interface Season {
  id: string;
  seasonName: string;
  seasonDesc: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  farmId: string;
  farm: Farm;
  productId: string;
  product: Product;
  productBatches: ProductBatchData[];
}

interface ImageUrl {
  imageUrl: string;
  batchId: string;
  id: string;
}

interface ProductBatchData {
  batchCode: BatchCode;
  totalYield: number;
  availableQuantity: number;
  verificationQrUrl: string;
  units: string;
  price: number;
  plantingDate: string;
  harvestDate: string;
  seasonId: string;
  season: Season;
  imageUrls: (string | ImageUrl)[];
  verificationQr: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  images?: string[];
  farm: string;
  farmId: string;
  farmLocation: string;
  inStock: boolean;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  nutritionFacts: NutritionFacts;
  verificationQr: string;
}

interface CareEvent {
  id: string;
  batchId: string;
  eventType: string;
  occurredAt: string;
  payload: string;
  hash: string;
  prevHash: string;
}

type ProductDetailResponse = ApiResponse<ProductDetail>;
type ProductBatchResponse = ApiResponse<ProductBatchData>;
type CareEventResponse = ApiResponse<CareEvent[]>;

export type {
  ProductDetail,
  ProductDetailResponse,
  ProductBatchData,
  ProductBatchResponse,
  CareEvent,
  CareEventResponse,
  Season,
  Product,
  Farm,
  BatchCode,
  ImageUrl,
};
