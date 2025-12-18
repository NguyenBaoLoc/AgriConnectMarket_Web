import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { toast } from "sonner";
import { getEventTypes, addCareEvent } from "../api/events";
import type { EventType } from "../types/event";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onEventAdded?: () => void;
}

export function AddEventDialog({
  open,
  onOpenChange,
  batchId,
  onEventAdded,
}: AddEventDialogProps) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState("");
  const [payload, setPayload] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEventTypes();
    }
  }, [open]);

  const fetchEventTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await getEventTypes();
      if (response.success && response.data) {
        setEventTypes(response.data);
      } else {
        toast.error(response.message || "Failed to load event types");
      }
    } catch (error) {
      console.error("Error fetching event types:", error);
      toast.error("Error loading event types");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!selectedEventTypeId) {
      toast.error("Please select an event type");
      return;
    }

    if (!payload.trim()) {
      toast.error("Please enter event details");
      return;
    }

    setIsLoading(true);
    try {
      const response = await addCareEvent(
        {
          batchId,
          eventTypeId: selectedEventTypeId,
          payload: payload.trim(),
        },
        imageFile || undefined
      );

      if (response.success) {
        toast.success("Event created successfully");
        setSelectedEventTypeId("");
        setPayload("");
        setImageFile(null);
        setImagePreview(null);
        onOpenChange(false);
        onEventAdded?.();
      } else {
        toast.error(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEventType = eventTypes.find(
    (et) => et.id === selectedEventTypeId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>
            Create a new care event for this batch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Event Type Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <Select value={selectedEventTypeId} onValueChange={setSelectedEventTypeId}>
              <SelectTrigger disabled={isLoadingTypes}>
                <SelectValue placeholder="Select an event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    <div className="flex flex-col">
                      <span>{eventType.eventTypeName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type Description */}
          {selectedEventType && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Description: </span>
                {selectedEventType.eventTypeDesc}
              </p>
            </div>
          )}

          {/* Event Details / Payload */}
          <div className="space-y-2">
            <label htmlFor="payload" className="text-sm font-medium">
              Event Details
            </label>
            <Textarea
              id="payload"
              placeholder="Enter event details or notes..."
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Event Image (Optional)
            </label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="image" className="cursor-pointer block">
                  <p className="text-sm text-gray-600 font-medium">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  {imageFile?.name}{" "}
                  ({`${((imageFile?.size || 0) / 1024 / 1024).toFixed(2)}`} MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedEventTypeId}
          >
            {isLoading ? "Creating..." : "Add Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
