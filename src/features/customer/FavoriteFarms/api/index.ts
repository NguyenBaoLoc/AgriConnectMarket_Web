import axios from 'axios';
import { API } from '../../../../api';

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

export async function addFavoriteFarm(farmId: string) {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(
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

export async function removeFavoriteFarm(farmId: string) {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(
      `${API.favoriteFarms.add}/${farmId}`,
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
