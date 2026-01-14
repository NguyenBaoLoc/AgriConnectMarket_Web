import {
  ArrowLeft,
  MapPin,
  Calendar,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Footer } from '../components';
import type { CareEvent } from '../ProductDetail/types';
import { formatUtcDateTime } from '../../../utils/timeUtils';
import {
  getAmountFieldsForEventType,
  getUnitForEventType,
} from '../../../utils/eventUnitsUtils';
import { useState, useEffect } from 'react';
import { getProductBatchDetail } from '../../farmer/ProductBatchDetail/api';
import type { Farm } from '../../farmer/ProductBatchList/types';

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
  const [farmData, setFarmData] = useState<Farm | null>(null);
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load farm data when component mounts
  useEffect(() => {
    const loadFarmData = async () => {
      if (careEvents.length === 0) return;

      // Get batchId from first care event
      const batchId = careEvents[0]?.batchId;
      if (!batchId) return;

      try {
        setIsLoadingFarm(true);
        const response = await getProductBatchDetail(batchId);
        if (response.success && response.data?.season?.farm) {
          setFarmData(response.data.season.farm);
        }
      } catch (error) {
        console.error('Error loading farm data:', error);
      } finally {
        setIsLoadingFarm(false);
      }
    };

    loadFarmData();
  }, [careEvents]);
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
  const parsePayload = (payload: unknown): Record<string, unknown> | null => {
    try {
      let data: unknown = payload;

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
        return data as Record<string, unknown>;
      }

      return null;
    } catch {
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
    verified:
      event.prevHash &&
      event.prevHash !==
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    payload: event.payload || '',
    parsedPayload: parsePayload(event.payload),
    hash: event.hash || 'N/A',
    prevHash: event.prevHash || 'N/A',
    batchId: event.batchId || 'N/A',
    imageUrl: event.imageUrl || null,
  }));

  // Calculate amounts summary from all events
  const amountsSummary = timelineEvents.reduce((acc, event) => {
    // Check if this event type has amount-related fields
    const amountFields = getAmountFieldsForEventType(event.eventType);
    const unit = getUnitForEventType(event.eventType);

    if (!amountFields || amountFields.length === 0 || !event.parsedPayload)
      return acc;

    // Extract and sum amounts from the relevant fields
    let totalAmount = 0;

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

        {/* Main Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline (2 columns on lg) */}
          <div className="lg:col-span-2">
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
                      <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              {event.eventType}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>
                                  {event.date} {event.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Image Display */}
                        {event.imageUrl && (
                          <div className="mb-4">
                            <div className="relative rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                              <img
                                src={event.imageUrl}
                                alt={`${event.eventType} evidence`}
                                className="w-full h-auto object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setSelectedImage(event.imageUrl)}
                              />
                              <div
                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors cursor-pointer shadow-md"
                                onClick={() => setSelectedImage(event.imageUrl)}
                              >
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Event Details */}
                        {event.payload && (
                          <div className="text-sm mb-4">
                            <div className="p-4 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200 shadow-sm">
                              <p className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-lg">📋</span>
                                Event Details
                              </p>
                              {event.parsedPayload ? (
                                <div className="space-y-2">
                                  {Object.entries(event.parsedPayload).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-start justify-between bg-white rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                                      >
                                        <span className="text-xs font-semibold text-blue-700 shrink-0 max-w-[45%]">
                                          {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm text-gray-900 font-semibold flex-1 ml-3 text-right wrap-break-word">
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
                          </div>
                        )}

                        {/* Traceability Details */}
                        <details className="text-sm group">
                          <summary className="cursor-pointer text-green-600 hover:text-green-700 font-semibold py-2 px-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
                            <span>🔐</span>
                            View Details
                          </summary>
                          <div className="mt-3 space-y-2 text-xs text-muted-foreground font-mono bg-gray-900 text-green-400 p-4 rounded-lg border border-gray-700 overflow-x-auto">
                            <div className="break-all">
                              <span className="font-semibold text-green-300">
                                Event Type:
                              </span>
                              <div className="text-gray-300 mt-1 ml-4">
                                {event.eventType}
                              </div>
                            </div>
                            <div className="break-all mt-3">
                              <span className="font-semibold text-green-300">
                                Hash:
                              </span>
                              <div className="text-gray-300 break-all mt-1 ml-4 bg-gray-800 p-2 rounded border border-gray-700">
                                {event.hash}
                              </div>
                            </div>
                            <div className="break-all mt-3">
                              <span className="font-semibold text-green-300">
                                Previous Hash:
                              </span>
                              <div className="text-gray-300 break-all mt-1 ml-4 bg-gray-800 p-2 rounded border border-gray-700">
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
                              className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
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
                                <span className="text-3xl font-bold text-green-500">
                                  {data.total.toFixed(2)}
                                </span>
                                <span className="text-xl text-green-800 font-medium">
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

          {/* Right Column - Farm Information */}
          <div className="lg:col-span-1">
            {isLoadingFarm ? (
              <Card className="p-6 flex items-center justify-center min-h-96">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-muted-foreground">
                    Loading farm details...
                  </p>
                </div>
              </Card>
            ) : farmData ? (
              <Card className="p-6 sticky top-8 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🏡 Farm Information
                </h3>

                <div className="space-y-4">
                  {/* Farm Name */}
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      Farm Name
                    </p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {farmData.farmName}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">
                        📞 Phone
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {farmData.phone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Area */}
                  {farmData.area && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">
                        📏 Farm Area
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {farmData.area} m<sup>2</sup>
                      </p>
                    </div>
                  )}

                  {/* Batch Code Prefix */}
                  {farmData.batchCodePrefix && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">
                        Batch Code Prefix
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {farmData.batchCodePrefix}
                      </Badge>
                    </div>
                  )}

                  {/* Farm Status */}
                  <div className="flex gap-2 flex-wrap">
                    {farmData.isBanned && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                    {farmData.isValidForSelling && (
                      <Badge className="bg-green-100 text-green-800">
                        Valid for Selling
                      </Badge>
                    )}
                    {farmData.isConfirmAsMall && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Confirmed as Mall
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {farmData.farmDesc && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {farmData.farmDesc}
                      </p>
                    </div>
                  )}

                  {/* Address */}
                  {farmData.address && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">
                            Location
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {farmData.address.detail}
                          </p>
                          <p className="text-sm text-gray-600">
                            {farmData.address.ward}, {farmData.address.district}
                          </p>
                          <p className="text-sm text-gray-600">
                            {farmData.address.province}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="pt-3 border-t space-y-2 text-xs text-muted-foreground">
                    <p>
                      Created:{' '}
                      {new Date(farmData.createdAt).toLocaleDateString()}
                    </p>
                    {farmData.updatedAt && (
                      <p>
                        Updated:{' '}
                        {new Date(farmData.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  No farm data available
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size event"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
