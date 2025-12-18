import axios from "axios";
import { API } from "../../../../api";
import type { EventTypesResponse, CareEventResponse, CareEventPayload, CareEventsListResponse } from "../types/event";

export const getEventTypes = async (): Promise<EventTypesResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<EventTypesResponse>(API.eventType.list, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error fetching event types",
      };
    }
  }
};

export const addCareEvent = async (
  payload: CareEventPayload,
  imageFile?: File
): Promise<CareEventResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("batchId", payload.batchId);
    formData.append("eventTypeId", payload.eventTypeId);
    formData.append("payload", payload.payload);
    
    if (imageFile) {
      formData.append("imageUrl", imageFile);
    }

    const response = await axios.post<CareEventResponse>(
      API.careEvent.add,
      formData,
      { 
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error creating care event",
      };
    }
  }
};

export const getCareEvents = async (
  batchId: string
): Promise<CareEventsListResponse> => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<CareEventsListResponse>(
      API.productBatch.verifyCareEvents(batchId),
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "Error fetching care events",
      };
    }
  }
};
