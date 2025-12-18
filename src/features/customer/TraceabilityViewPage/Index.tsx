import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Footer } from "../components";
import type { CareEvent } from "../ProductDetail/types";

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
  // Format care events for timeline display
  const timelineEvents = careEvents.map((event) => ({
    id: event.id,
    date: new Date(event.occurredAt).toLocaleDateString(),
    time: new Date(event.occurredAt).toLocaleTimeString(),
    eventType: event.eventType || "Care Event",
    description: event.payload ? `Payload: ${event.payload}` : "No payload",
    location: "Blockchain Verified",
    verified:
      event.prevHash &&
      event.prevHash !==
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    payload: event.payload || "",
    hash: event.hash || "N/A",
    prevHash: event.prevHash || "N/A",
  }));

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
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {errorMessage ? "Verification Failed" : "Verified Chain"}
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
                        <p className="text-sm text-muted-foreground mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                          {event.description}
                        </p>
                      )}

                      <details className="text-sm">
                        <summary className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                          📋 View blockchain details
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
              <div className="mt-8 pt-6 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {careEvents.length}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Chain Status
                    </p>
                    <p className="text-2xl font-bold text-green-600">✓ Valid</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
