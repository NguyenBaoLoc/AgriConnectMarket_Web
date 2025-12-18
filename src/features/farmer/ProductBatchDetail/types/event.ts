import type { ApiResponse } from "../../../../types";

export interface EventType {
  id: string;
  eventTypeName: string;
  eventTypeDesc: string;
}

export interface EventTypesResponse extends ApiResponse<EventType[]> {}

export interface CareEventPayload {
  batchId: string;
  eventTypeId: string;
  payload: string;
}

export interface CareEventResponse extends ApiResponse<{ id: string }> {}

export interface CareEvent {
  id: string;
  batchId: string;
  eventType: string;
  occurredAt: string;
  payload: string;
  imageUrl?: string;
  hash: string;
  prevHash: string;
}

export interface CareEventsListResponse extends ApiResponse<CareEvent[]> {}
