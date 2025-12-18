import axios from "axios";
import type {
  GetCategoryListResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from "../types";
import { API } from "../../../../api";

export async function getCategoryList(): Promise<GetCategoryListResponse> {
  try {
    const url = API.category.list;
    const response = await axios.get<GetCategoryListResponse>(url);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function createCategory(
  data: FormData
): Promise<CreateCategoryResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    const url = API.category.add;
    const response = await api.post<CreateCategoryResponse>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function updateCategory(
  categoryId: string,
  data: FormData
): Promise<UpdateCategoryResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    const url = API.category.update(categoryId);
    const response = await api.put<UpdateCategoryResponse>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<DeleteCategoryResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.category.delete(categoryId);
    const response = await api.delete<DeleteCategoryResponse>(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
