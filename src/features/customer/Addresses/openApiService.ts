import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://provinces.open-api.vn/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

class OpenApiService {
  async getProvinces() {
    try {
      const response = await apiClient.get('/p/');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error || 'Error fetching open api'
      );
    }
  }

  async getDistricts(code: string) {
    try {
      const response = await apiClient.get(`/p/${code}?depth=2`);
      return response.data.districts;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error || 'Error fetching open api'
      );
    }
  }

  async getWards(code: string) {
    try {
      const response = await apiClient.get(`/d/${code}?depth=2`);
      return response.data.wards;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error || 'Error fetching open api'
      );
    }
  }
}

export default new OpenApiService();
