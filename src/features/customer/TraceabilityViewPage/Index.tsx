import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Footer } from '../components';
import type { CareEvent } from '../ProductDetail/types';
import { formatUtcDateTime } from '../../../utils/timeUtils';

interface TraceabilityViewProps {
  careEvents: CareEvent[];
  onBack: () => void;
  errorMessage?: string;
}

export function TraceabilityView({
  careEvents,
  onBack,
  errorMessage,
}: TraceabilityViewProps) {
  // Map event types to their amount-related fields
  const eventAmountFields: Record<string, string[]> = {
    'Soil preparation': ['Soil amendment (amount)', 'Fuel consumed'],
    Irrigation: ['Water volume'],
    Fertilization: ['Rate'],
    'Pest and disease control': ['Rate'],
    Weeding: ['Area treated', 'Labor'],
    Harvest: ['Quantity'],
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

  // Format care events for timeline display
  const timelineEvents = careEvents.map((event) => ({
    id: event.id,
    date: formatUtcDateTime(event.occurredAt),
    time: formatUtcDateTime(event.occurredAt),
    eventType: event.eventType || 'Care Event',
    description: event.payload ? `Payload: ${event.payload}` : 'No payload',
    location: 'Verified',
    verified:
      event.prevHash &&
      event.prevHash !==
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    payload: event.payload || '',
    parsedPayload: parsePayload(event.payload),
    hash: event.hash || 'N/A',
    prevHash: event.prevHash || 'N/A',
  }));

  // Calculate amounts summary from all events
  const amountsSummary = timelineEvents.reduce((acc, event) => {
    // Check if this event type has amount-related fields
    const amountFields = eventAmountFields[event.eventType];

    if (!amountFields || !event.parsedPayload) return acc;

    // Extract and sum amounts from the relevant fields
    let totalAmount = 0;
    let unit = '';

    amountFields.forEach((fieldName) => {
      // Look for the field in parsed payload (handle different case/formatting)
      const payloadValue = Object.entries(event.parsedPayload!).find(
        ([key]) =>
          key.toLowerCase().replace(/\s+/g, '_') ===
          fieldName.toLowerCase().replace(/\s+/g, '_')
      );

      if (payloadValue) {
        const extracted = extractAmount(payloadValue[1]);
        if (extracted) {
          totalAmount += extracted.amount;
          if (!unit && extracted.unit) {
            unit = extracted.unit;
          }
        }
      }
    });

    // Only add to summary if we found amounts
    if (totalAmount > 0) {
      if (!acc[event.eventType]) {
        acc[event.eventType] = { total: 0, unit: unit, eventCount: 0 };
      }
      acc[event.eventType].total += totalAmount;
      acc[event.eventType].eventCount += 1;
      if (!acc[event.eventType].unit && unit) {
        acc[event.eventType].unit = unit;
      }
    }

    return acc;
  }, {} as Record<string, { total: number; unit: string; eventCount: number }>);

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Product
        </Button>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold mb-1">
              ⚠️ Verification Error
            </p>
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="max-w-4xl">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-gray-900">Events ({careEvents.length})</h3>
              <Badge
                className={
                  errorMessage
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }
              >
                {errorMessage ? 'Verification Failed' : 'Verified Chain'}
              </Badge>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-200" />

              {/* Timeline Items */}
              <div className="space-y-6">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="relative pl-16">
                    {/* Event Content */}
                    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-gray-900 font-semibold mb-1">
                            {event.eventType}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {event.date} {event.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      {event.payload && (
                        <div className="text-sm mb-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded border border-blue-200">
                          <p className="text-xs font-semibold text-gray-800 mb-2">
                            📋 Event Details
                          </p>
                          {event.parsedPayload ? (
                            <div className="space-y-1.5">
                              {Object.entries(event.parsedPayload).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-start justify-between bg-white rounded p-2 border border-gray-100 text-xs"
                                  >
                                    <span className="text-gray-600 font-medium flex-shrink-0 max-w-[45%]">
                                      {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-gray-900 font-semibold flex-1 ml-2 text-right break-words">
                                      {String(value)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-700 text-xs">
                              {event.description}
                            </p>
                          )}
                        </div>
                      )}

                      <details className="text-sm">
                        <summary className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                          📋 View tracability details
                        </summary>
                        <div className="mt-3 space-y-2 text-xs text-muted-foreground font-mono bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="break-all">
                            <span className="font-semibold text-gray-700">
                              Event Type:
                            </span>
                            <div className="text-gray-600">
                              {event.eventType}
                            </div>
                          </div>
                          <div className="break-all">
                            <span className="font-semibold text-gray-700">
                              Hash:
                            </span>
                            <div className="text-gray-600 break-all">
                              {event.hash}
                            </div>
                          </div>
                          <div className="break-all">
                            <span className="font-semibold text-gray-700">
                              Previous Hash:
                            </span>
                            <div className="text-gray-600 break-all">
                              {event.prevHash}
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {!errorMessage && (
              <div className="mt-8 pt-6 border-t space-y-6">
                {/* Statistics Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-muted-foreground">
                        Total Events
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {careEvents.length}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-muted-foreground">
                        Chain Status
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ✓ Valid
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amounts Summary */}
                {Object.keys(amountsSummary).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      📦 Resource Usage Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(amountsSummary).map(
                        ([eventType, data]) => (
                          <div
                            key={eventType}
                            className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">
                                {eventType}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {data.eventCount} event
                                {data.eventCount > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-orange-600">
                                {data.total.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-600 font-medium">
                                {data.unit}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
