import type { ApiResponse } from '../../../../types';

export interface PayloadField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

export interface EventType {
  id: string;
  eventTypeName: string;
  eventTypeDesc: string;
  payloadFields?: string; // JSON string array of field labels
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
