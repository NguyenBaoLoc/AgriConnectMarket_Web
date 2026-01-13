import { API } from '../../../../api';
import type { Farm } from '../../../../types';
import type { ProductBatch } from '../../ProductPage/types';
import axios from 'axios';

interface FarmsApiResponse {
  success: boolean;
  message: string;
  data: Farm[];
}

interface ProductBatchesApiResponse {
  success: boolean;
  message: string;
  data: ProductBatch[];
}

export async function fetchFarms(): Promise<Farm[]> {
  try {
    const response = await fetch(API.farm.list, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FarmsApiResponse = await response.json();

    if (result.success && result.data) {
      // Sort by createdAt descending and return top 5
      return result.data
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Error fetching farms:', error);
    return [];
  }
}

export async function fetchRecommendedBatches(): Promise<ProductBatch[]> {
  try {
    const response = await axios.get<ProductBatchesApiResponse>(
      API.productBatch.getSelling
    );

    if (response.data.success && response.data.data) {
      // Sort by createdAt descending and return top 3
      return response.data.data
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
    }

    return [];
  } catch (error) {
    console.error('Error fetching recommended batches:', error);
    return [];
  }
}
