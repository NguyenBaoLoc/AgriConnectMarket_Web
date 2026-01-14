import { useEffect, useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { toast } from 'sonner';
import { getCareEvents } from '../api/events';
import type { CareEvent } from '../types/event';
import { formatUtcDateTime } from '../../../../utils/timeUtils';
import {
  getAmountFieldsForEventType,
  getUnitForEventType,
} from '../../../../utils/eventUnitsUtils';

interface EventListProps {
  batchId: string;
  refreshTrigger?: number;
}

// Helper function to parse payload (handles double-encoded JSON with escaped Unicode)
const parsePayload = (payload: any): Record<string, any> | null => {
  try {
    let data: any = payload;

    // Parse once (handles escaped Unicode characters)
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Parse again if it's still a string (double-encoded)
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Ensure it's an object and not an array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }

    return null;
  } catch (e) {
    return null;
  }
};

// Helper function to extract numeric value and unit from text
const extractAmount = (
  value: string
): { amount: number; unit: string } | null => {
  const match = String(value).match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    return isNaN(num) ? null : { amount: num, unit };
  }
  return null;
};

export function EventList({ batchId, refreshTrigger }: EventListProps) {
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getCareEvents(batchId);
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.message || 'Failed to load events');
        toast.error(response.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error loading events');
      toast.error('Error loading events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [batchId, refreshTrigger]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Care Events
        </h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Care Events
        </h3>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Events</h3>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No events recorded yet</p>
        </div>
      ) : (
        <>
          {/* Calculate amounts summary */}
          {(() => {
            const amountsSummary = events.reduce((acc, event) => {
              const amountFields = getAmountFieldsForEventType(event.eventType);
              const parsedPayload = parsePayload(event.payload);
              const unit = getUnitForEventType(event.eventType);

              if (!amountFields || amountFields.length === 0 || !parsedPayload)
                return acc;

              let totalAmount = 0;

              amountFields.forEach((fieldName) => {
                const payloadValue = Object.entries(parsedPayload).find(
                  ([key]) =>
                    key.toLowerCase().replace(/\s+/g, '_') ===
                    fieldName.toLowerCase().replace(/\s+/g, '_')
                );

                if (payloadValue) {
                  const extracted = extractAmount(payloadValue[1]);
                  if (extracted) {
                    totalAmount += extracted.amount;
                  }
                }
              });

              if (totalAmount > 0) {
                if (!acc[event.eventType]) {
                  acc[event.eventType] = {
                    total: 0,
                    unit: unit,
                    eventCount: 0,
                  };
                }
                acc[event.eventType].total += totalAmount;
                acc[event.eventType].eventCount += 1;
              }

              return acc;
            }, {} as Record<string, { total: number; unit: string; eventCount: number }>);

            // Render summary if there are amounts
            if (Object.keys(amountsSummary).length > 0) {
              return (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    📊 Resource Usage Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(amountsSummary).map(([eventType, data]) => (
                      <div
                        key={eventType}
                        className="p-3 bg-white rounded border border-blue-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-700">
                            {eventType}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {data.eventCount}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-blue-600">
                            {data.total.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-600">
                            {data.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Events List */}
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                {/* Event Type and Date */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {event.eventType}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatUtcDateTime(event.occurredAt)}
                    </p>
                  </div>
                </div>

                {/* Image */}
                {event.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 max-w-xs">
                    <img
                      src={event.imageUrl}
                      alt={`Event ${event.eventType}`}
                      className="w-full h-auto object-cover max-h-64"
                    />
                  </div>
                )}

                {/* Payload / Details */}
                <div className="mb-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    📋 Event Details
                  </p>
                  {(() => {
                    try {
                      let payloadData: any = event.payload;

                      // Parse once (handles escaped Unicode characters)
                      if (typeof payloadData === 'string') {
                        payloadData = JSON.parse(payloadData);
                      }

                      // Parse again if it's still a string (double-encoded)
                      if (typeof payloadData === 'string') {
                        payloadData = JSON.parse(payloadData);
                      }

                      // Ensure it's an object and not an array
                      if (
                        payloadData &&
                        typeof payloadData === 'object' &&
                        !Array.isArray(payloadData)
                      ) {
                        return (
                          <div className="space-y-2">
                            {Object.entries(payloadData).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-start justify-between bg-white rounded p-2.5 border border-gray-100 hover:border-blue-200 transition-colors"
                              >
                                <span className="text-xs font-medium text-gray-600 flex-shrink-0 max-w-[40%]">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm text-gray-900 font-semibold flex-1 ml-3 text-right break-words">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Fallback for non-object data
                      return (
                        <div className="bg-white rounded p-2.5 text-sm text-gray-700 whitespace-pre-wrap break-words">
                          No structured data available
                        </div>
                      );
                    } catch (e) {
                      // If parsing fails, try to at least show the raw value
                      return (
                        <div className="bg-white rounded p-2.5 text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-auto">
                          {typeof event.payload === 'string'
                            ? event.payload
                            : JSON.stringify(event.payload, null, 2)}
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Hash Information */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Hash:</p>
                    <p className="font-mono break-all text-gray-600">
                      {event.hash}
                    </p>
                  </div>
                  {event.prevHash !==
                    '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Previous Hash:</p>
                      <p className="font-mono break-all text-gray-600">
                        {event.prevHash}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
