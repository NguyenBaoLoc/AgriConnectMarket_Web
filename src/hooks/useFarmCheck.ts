import { useCallback } from "react";
import axios from "axios";
import { API } from "../api";

export interface FarmData {
  id: string;
  farmName: string;
  farmDesc?: string;
  phone?: string;
  area?: string;
  [key: string]: any;
}

export const useFarmCheck = () => {
  const getFarmIdFromLocalStorage = useCallback((): string | null => {
    return localStorage.getItem("farmId");
  }, []);

  const saveFarmIdToLocalStorage = useCallback((farmId: string): void => {
    localStorage.setItem("farmId", farmId);
  }, []);

  const fetchAndSaveFarmData = useCallback(async (): Promise<FarmData | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const api = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await api.get(API.farm.me);
      if (response.data.success && response.data.data) {
        const farmData = response.data.data as FarmData;
        saveFarmIdToLocalStorage(farmData.id);
        return farmData;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch farm data:", error);
      return null;
    }
  }, [saveFarmIdToLocalStorage]);

  const hasFarmId = useCallback((): boolean => {
    const farmId = getFarmIdFromLocalStorage();
    return !!farmId;
  }, [getFarmIdFromLocalStorage]);

  const clearFarmId = useCallback((): void => {
    localStorage.removeItem("farmId");
  }, []);

  return {
    getFarmIdFromLocalStorage,
    saveFarmIdToLocalStorage,
    fetchAndSaveFarmData,
    hasFarmId,
    clearFarmId,
  };
};
