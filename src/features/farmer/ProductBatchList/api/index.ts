import axios from "axios";
import { API } from "../../../../api";
import type {
  ProductBatchListResponse,
  ProductBatchDetailResponse,
  ProductBatchCreateResponse,
  ProductBatch,
} from "../types";

export const getProductDetails = async (
  productId: string
): Promise<any> => {
  try {
    const url = API.product.get(productId);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<any>(url, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching product details:", error);
    return null;
  }
};

export const getSeasonDetails = async (
  seasonId: string
): Promise<any> => {
  try {
    const url = API.season.get(seasonId);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<any>(url, {
      headers,
    });
    
    // If product is not included, fetch it separately
    if (response.data?.data && response.data.data.productId && !response.data.data.product) {
      const productData = await getProductDetails(response.data.data.productId);
      if (productData?.success && productData.data) {
        response.data.data.product = productData.data;
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching season details:", error);
    return null;
  }
};

export const getFarmerProductBatches = async (
  farmId: string
): Promise<ProductBatchListResponse> => {
  try {
    const url = `${API.productBatch.list}/farm/${farmId}`;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<ProductBatchListResponse>(url, {
      headers,
    });

    // Enrich batches with season data
    if (response.data.success && response.data.data) {
      const uniqueSeasonIds = [
        ...new Set(response.data.data.map((batch) => batch.seasonId)),
      ];

      const seasonCache: Record<string, any> = {};
      await Promise.all(
        uniqueSeasonIds.map(async (seasonId) => {
          const seasonData = await getSeasonDetails(seasonId);
          console.log(`Season ${seasonId}:`, seasonData);
          if (seasonData?.success && seasonData.data) {
            seasonCache[seasonId] = seasonData.data;
          }
        })
      );

      // Attach season data to batches
      response.data.data = response.data.data.map((batch) => ({
        ...batch,
        season: seasonCache[batch.seasonId],
      }));
      console.log("Enriched batches with season data:", response.data.data);
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error fetching product batches",
      };
    }
  }
};

export const getProductBatchDetail = async (
  batchId: string
): Promise<ProductBatchDetailResponse> => {
  try {
    const url = API.productBatch.get(batchId);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<ProductBatchDetailResponse>(url, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error fetching product batch details",
      };
    }
  }
};

export const createProductBatch = async (
  data: {
    seasonId: string;
    totalYield: number;
    units: string;
    plantingDate: string;
  },
  images?: File[]
): Promise<ProductBatchCreateResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("seasonId", data.seasonId);
    formData.append("totalYield", data.totalYield.toString());
    formData.append("units", data.units);
    formData.append("plantingDate", data.plantingDate);

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await axios.post<ProductBatchCreateResponse>(
      API.productBatch.add,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error creating product batch",
      };
    }
  }
};

export const harvestProductBatch = async (
  batchId: string,
  totalYield: number
): Promise<ProductBatchDetailResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.patch<ProductBatchDetailResponse>(
      API.productBatch.harvest(batchId),
      { totalYield },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error updating harvest",
      };
    }
  }
};

export const sellProductBatch = async (
  batchId: string,
  availableQuantity: number,
  price: number
): Promise<ProductBatchDetailResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.patch<ProductBatchDetailResponse>(
      API.productBatch.sell(batchId),
      { availableQuantity, price },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error selling product batch",
      };
    }
  }
};
