import axios from 'axios';
import type { GetProductBatchResponse } from '../types';
import { API } from '../../../../api';

export async function getProductBatches(): Promise<GetProductBatchResponse> {
  try {
    const response = await axios.get<GetProductBatchResponse>(
      API.productBatch.getSelling
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
