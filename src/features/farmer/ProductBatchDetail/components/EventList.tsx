import { useEffect, useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import { getCareEvents } from "../api/events";
import type { CareEvent } from "../types/event";

interface EventListProps {
  batchId: string;
  refreshTrigger?: number;
}

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
        setError(response.message || "Failed to load events");
        toast.error(response.message || "Failed to load events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Error loading events");
      toast.error("Error loading events");
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Events</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Events</h3>
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
                    {new Date(event.occurredAt).toLocaleString("vi-VN")}
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
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  {event.payload}
                </p>
              </div>

              {/* Hash Information */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Hash:</p>
                  <p className="font-mono break-all text-gray-600">
                    {event.hash}
                  </p>
                </div>
                {event.prevHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
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
      )}
    </Card>
  );
}
