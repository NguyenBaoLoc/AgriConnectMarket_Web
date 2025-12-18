import type { ApiResponse } from "../../../../types";

interface Product {
  productName: string;
  productAttribute: string;
  productDesc: string;
  categoryId: string;
  createdAt: string;
  id: string;
}

interface Category {
  categoryName: string;
  categoryDesc: string;
  illustrativeImageUrl: string;
  isDelete: boolean;
  id: string;
}
type ProductListResponse = ApiResponse<Product[]>;
type DeleteProductResponse = ApiResponse<null>;
type UpdateProductResponse = ApiResponse<any>;
type GetCategoryListResponse = ApiResponse<Category[]>;

export type {
  Product,
  Category,
  ProductListResponse,
  DeleteProductResponse,
  UpdateProductResponse,
  GetCategoryListResponse,
};
