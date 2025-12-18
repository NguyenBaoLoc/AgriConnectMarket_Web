import axios from 'axios';
import { API } from '../../../../api';
import type {
  ProductDetail,
  ProductDetailResponse,
  ProductBatchData,
  ProductBatchResponse,
  CareEventResponse,
} from '../types';

export async function getProductBatchDetails(
  productId: string
): Promise<ProductBatchResponse> {
  try {
    const url = API.productBatch.get(productId);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<ProductBatchResponse>(url, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as ProductBatchResponse;
    } else {
      throw error;
    }
  }
}

function transformBatchToDetail(batch: ProductBatchData): ProductDetail {
  const defaultImage =
    'https://images.unsplash.com/photo-1565032156168-0a22e5b8374f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllc3xlbnwxfHx8fDE3NTk5NTE4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

  // Handle both string[] and object[] with imageUrl property
  const imageUrls = batch.imageUrls?.map((img) =>
    typeof img === 'string' ? img : (img as any)?.imageUrl
  ) || [defaultImage];

  return {
    id: batch.id,
    name: batch.batchCode.value,
    price: batch.price,
    unit: batch.units,
    verificationQr: batch.verificationQr,
    category: batch.season?.product?.productAttribute || 'Product',
    image: imageUrls[0] || defaultImage,
    images: imageUrls.length > 0 ? imageUrls : [defaultImage],
    farm: batch.season?.farm?.farmName || 'Unknown Farm',
    farmId: batch.season?.farm?.id || '',
    farmLocation: batch.season?.farm?.farmDesc || 'Unknown Location',
    inStock: batch.availableQuantity > 0,
    stock: batch.availableQuantity,
    rating: 4.5,
    reviews: 0,
    description: batch.season?.product?.productDesc || 'Fresh farm produce',
    features: [
      'Batch Code: ' + batch.batchCode.value,
      'Total Yield: ' + batch.totalYield + ' ' + batch.units,
      'Planting Date: ' + new Date(batch.plantingDate).toLocaleDateString(),
      'Harvest Date: ' + new Date(batch.harvestDate).toLocaleDateString(),
    ],
    nutritionFacts: {
      servingSize: batch.units,
      calories: '-',
      protein: '-',
      carbs: '-',
      fiber: '-',
      vitaminC: '-',
    },
  };
}

export async function getProductDetails(
  batchId: string
): Promise<ProductDetailResponse> {
  try {
    console.log('Fetching product details for batchId:', batchId);
    const batchResponse = await getProductBatchDetails(batchId);
    console.log('Batch response:', batchResponse);
    if (batchResponse.success && batchResponse.data) {
      const productDetail = transformBatchToDetail(batchResponse.data);
      return {
        success: true,
        message: 'Product details fetched successfully',
        data: productDetail,
      };
    } else {
      return {
        success: false,
        message: batchResponse.message || 'Failed to fetch product details',
      };
    }
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as ProductDetailResponse;
    } else {
      return {
        success: false,
        message: 'Error fetching product details',
      };
    }
  }
}

export async function verifyCareEvents(
  batchId: string
): Promise<CareEventResponse> {
  try {
    const url = API.productBatch.verifyCareEvents(batchId);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<CareEventResponse>(url, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { data?: unknown } };
    if (axiosError.response?.data) {
      return axiosError.response.data as CareEventResponse;
    } else {
      return {
        success: false,
        message: 'Error verifying care events',
      };
    }
  }
}
