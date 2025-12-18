import axios from "axios";
import { API } from "../../../../api";
import type {
  GetCategoryListResponse,
  ProductListResponse,
  UpdateProductResponse,
} from "../types";

export async function getProductList(): Promise<ProductListResponse> {
  try {
    const token = localStorage.getItem("token");
    const url = API.product.list;
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await api.get<ProductListResponse>(url);
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

export async function deleteProduct(
  productId: string
): Promise<ProductListResponse> {
  try {
    const token = localStorage.getItem("token");
    const url = API.product.delete(productId);
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await api.delete<ProductListResponse>(url);
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
    const url = API.product.update(productId);
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await api.put<UpdateProductResponse>(url, data);
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

export async function getCategoryList(): Promise<GetCategoryListResponse> {
  try {
    const token = localStorage.getItem("token");
    const url = API.category.list;
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await api.get<GetCategoryListResponse>(url);
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
