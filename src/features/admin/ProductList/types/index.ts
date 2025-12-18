import type { ApiResponse } from "../../../../types";

interface Category {
  categoryName: string;
  categoryDesc: string;
  illustrativeImageUrl: string;
  isDelete: boolean;
  id: string;
}

interface Product {
  id: string;
  productName: string;
  productAttribute: string;
  productDesc: string;
  categoryId: string;
  createdAt: string;
}

interface ProductWithCategory extends Product {
  category?: Category;
}

type GetProductListResponse = ApiResponse<Product[]>;
type CreateProductResponse = ApiResponse<ProductWithCategory>;
type UpdateProductResponse = ApiResponse<ProductWithCategory>;
type DeleteProductResponse = ApiResponse<string>;
type GetCategoryListResponse = ApiResponse<Category[]>;

export type {
  Product,
  ProductWithCategory,
  Category,
  GetProductListResponse,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
  GetCategoryListResponse,
};
