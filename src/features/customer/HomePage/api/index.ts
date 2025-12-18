import { API } from "../../../../api";
import type { Farm } from "../../../../types";

interface FarmsApiResponse {
  success: boolean;
  message: string;
  data: Farm[];
}

export async function fetchFarms(): Promise<Farm[]> {
  try {
    const response = await fetch(API.farm.list, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FarmsApiResponse = await response.json();

    if (result.success && result.data) {
      // Sort by createdAt descending and return top 5
      return result.data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error("Error fetching farms:", error);
    return [];
  }
}
