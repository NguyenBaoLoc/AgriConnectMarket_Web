import type { ApiResponse } from "../../../../types";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
  category: string;
}
type GetProductListResponse = ApiResponse<Product[]>;

interface ProductBatch {
  id: string;
  batchCode: string | { value: string };
  product: string;
  season: string;
  category: string;
  farm: string;
  createdAt: string;
  plantingDate: string;
  harvestDate?: string;
  totalYield: number;
  avaibleQuantity: number;
  price: number;
  units: string;
  imageUrls: string[];
}

type GetProductBatchResponse = ApiResponse<ProductBatch[]>;

export type {
  Product,
  GetProductListResponse,
  ProductBatch,
  GetProductBatchResponse,
};
