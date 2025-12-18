import type { ApiResponse } from "../../../../types";

interface Category {
  categoryName: string;
  categoryDesc: string;
  illustrativeImageUrl: string;
  isDelete: boolean;
  id: string;
}

type GetCategoryListResponse = ApiResponse<Category[]>;
type CreateCategoryResponse = ApiResponse<Omit<Category, "isDelete" | "id">>;
type UpdateCategoryResponse = ApiResponse<Omit<Category, "isDelete" | "id">>;
type DeleteCategoryResponse = ApiResponse<string>;

export type {
  Category,
  GetCategoryListResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
};
