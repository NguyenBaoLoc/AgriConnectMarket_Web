import axios from "axios";
import type {
  GetProductListResponse,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
  GetCategoryListResponse,
} from "../types";
import { API } from "../../../../api";

export async function getProductList(): Promise<GetProductListResponse> {
  try {
    const url = API.product.list;
    const response = await axios.get<GetProductListResponse>(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function getCategoryList(): Promise<GetCategoryListResponse> {
  try {
    const url = API.category.list;
    const response = await axios.get<GetCategoryListResponse>(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function createProduct(data: {
  productName: string;
  productAttribute: string;
  productDesc: string;
  categoryId: string;
}): Promise<CreateProductResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const url = API.product.add;
    const response = await api.post<CreateProductResponse>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function updateProduct(
  productId: string,
  data: {
    productName: string;
    productAttribute: string;
    productDesc: string;
    categoryId: string;
  }
): Promise<UpdateProductResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const url = API.product.update(productId);
    const response = await api.put<UpdateProductResponse>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function deleteProduct(
  productId: string
): Promise<DeleteProductResponse> {
  try {
    const token = localStorage.getItem("token");
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const url = API.product.delete(productId);
    const response = await api.delete<DeleteProductResponse>(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
