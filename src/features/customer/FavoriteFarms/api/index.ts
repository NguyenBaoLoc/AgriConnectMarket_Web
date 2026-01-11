import axios from 'axios';
import { API } from '../../../../api';

export interface ToggleFavoriteFarmResponse {
  success: boolean;
  data: 'added' | 'removed';
}

export async function getMyFavoriteFarms() {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get<any[]>(API.favoriteFarms.me, { headers });
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      'response' in error &&
      (error as any).response &&
      typeof (error as any).response === 'object' &&
      'data' in (error as any).response
    ) {
      return (error as any).response.data;
    }
    throw error;
  }
}

/**
 * Toggle a farm as favorite.
 * If the farm is not in favorites, it will be added and return "added".
 * If the farm is already in favorites, it will be removed and return "removed".
 */
export async function toggleFavoriteFarm(
  farmId: string
): Promise<ToggleFavoriteFarmResponse> {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post<ToggleFavoriteFarmResponse>(
      API.favoriteFarms.add,
      { farmId },
      { headers }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      'response' in error &&
      (error as any).response &&
      typeof (error as any).response === 'object' &&
      'data' in (error as any).response
    ) {
      return (error as any).response.data;
    }
    throw error;
  }
}

/**
 * @deprecated Use toggleFavoriteFarm instead. This function is kept for backward compatibility.
 */
export async function addFavoriteFarm(farmId: string) {
  return toggleFavoriteFarm(farmId);
}

/**
 * @deprecated Use toggleFavoriteFarm instead. This function is kept for backward compatibility.
 */
export async function removeFavoriteFarm(farmId: string) {
  return toggleFavoriteFarm(farmId);
}
