import { useEffect, useState, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';
import { getEventTypes, addCareEvent } from '../api/events';
import type { EventType } from '../types/event';
import { cn } from '../../../../components/ui/utils';

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
  const [selectedEventTypeId, setSelectedEventTypeId] = useState('');
  const [payloadValues, setPayloadValues] = useState<
    Record<string, string | number>
  >({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get payload fields from selected event type (JSON string array)
  const payloadFields = useMemo(() => {
    const selectedEventType = eventTypes.find(
      (et) => et.id === selectedEventTypeId
    );
    if (!selectedEventType?.payloadFields) return [];
    try {
      const parsed = JSON.parse(selectedEventType.payloadFields);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing payloadFields:', error);
      return [];
    }
  }, [selectedEventTypeId, eventTypes]);

  console.log(payloadFields);

  useEffect(() => {
    if (open) {
      fetchEventTypes();
    }
  }, [open]);

  // Reset form when dialog opens/closes or event type changes
  useEffect(() => {
    if (!open) {
      setSelectedEventTypeId('');
      setPayloadValues({});
      setFieldErrors({});
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open]);

  useEffect(() => {
    // Reset payload values when event type changes
    setPayloadValues({});
    setFieldErrors({});
  }, [selectedEventTypeId]);

  const fetchEventTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await getEventTypes();
      if (response.success && response.data) {
        setEventTypes(response.data);
      } else {
        toast.error(response.message || 'Failed to load event types');
      }
    } catch (error) {
      console.error('Error fetching event types:', error);
      toast.error('Error loading event types');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
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

  const validateFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    for (const fieldLabel of payloadFields) {
      console.log(fieldLabel);
      const fieldKey = fieldLabel.toLowerCase().replace(/\s+/g, '_');
      const value = payloadValues[fieldKey];

      // All fields are required
      if (value === undefined || value === null || value === '') {
        errors[fieldKey] = `${fieldLabel} is required`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [payloadFields, payloadValues]);

  const serializePayload = (): string => {
    const payload: Record<string, any> = {};
    for (const fieldLabel of payloadFields) {
      const fieldKey = fieldLabel.toLowerCase().replace(/\s+/g, '_');
      const value = payloadValues[fieldKey];
      payload[fieldKey] = value || '';
    }
    return JSON.stringify(payload);
  };

  const handleSubmit = async () => {
    if (!selectedEventTypeId) {
      toast.error('Please select an event type');
      return;
    }

    // Validate dynamic fields
    if (!validateFields()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      const finalPayload = serializePayload();

      const response = await addCareEvent(
        {
          batchId,
          eventTypeId: selectedEventTypeId,
          payload: finalPayload,
        },
        imageFile || undefined
      );

      if (response.success) {
        toast.success('Event created successfully');
        setSelectedEventTypeId('');
        setPayloadValues({});
        setImageFile(null);
        setImagePreview(null);
        setFieldErrors({});
        onOpenChange(false);
        onEventAdded?.();
      } else {
        toast.error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEventType = eventTypes.find(
    (et) => et.id === selectedEventTypeId
  );

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white z-10 p-8 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <span>Add Care Event</span>
          </DialogTitle>
          <DialogDescription>
            Create a new care event for this batch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-8 py-4">
          {/* Event Type Select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Event Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedEventTypeId}
              onValueChange={setSelectedEventTypeId}
            >
              <SelectTrigger
                disabled={isLoadingTypes}
                className={cn(
                  'w-full',
                  selectedEventTypeId && 'border-blue-300 bg-blue-50'
                )}
              >
                <SelectValue placeholder="Select an event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.id} value={eventType.id}>
                    <span className="font-medium">
                      {eventType.eventTypeName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type Description */}
          {selectedEventType && (
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg animate-in fade-in-50 duration-300">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-indigo-700">
                  Description:{' '}
                </span>
                <span className="text-gray-600">
                  {selectedEventType.eventTypeDesc}
                </span>
              </p>
            </div>
          )}

          {/* Dynamic Payload Fields */}
          {selectedEventTypeId && payloadFields.length > 0 && (
            <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  Event Details
                </h3>
              </div>
              <div className="space-y-3">
                {payloadFields.map((fieldLabel) => {
                  const fieldKey = fieldLabel
                    .toLowerCase()
                    .replace(/\s+/g, '_');
                  const error = fieldErrors[fieldKey];
                  const isInvalid = !!error;

                  return (
                    <div key={fieldKey} className="space-y-1">
                      <Label
                        htmlFor={fieldKey}
                        className={cn(
                          'text-sm font-medium',
                          isInvalid ? 'text-red-600' : 'text-gray-700'
                        )}
                      >
                        {fieldLabel}
                        <span className="ml-1 text-red-500 font-bold">*</span>
                      </Label>
                      <Input
                        id={fieldKey}
                        type="text"
                        placeholder={`Input ${fieldLabel.toLowerCase()}...`}
                        value={payloadValues[fieldKey] || ''}
                        onChange={(e) => {
                          setPayloadValues((prev) => ({
                            ...prev,
                            [fieldKey]: e.target.value,
                          }));
                          // Clear error for this field when user starts editing
                          if (fieldErrors[fieldKey]) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors[fieldKey];
                              return newErrors;
                            });
                          }
                        }}
                        className={cn(
                          'w-full',
                          isInvalid && 'border-red-400 focus:ring-red-500'
                        )}
                      />
                      {isInvalid && (
                        <p className="text-xs text-red-600">{error}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <label
              htmlFor="image"
              className="text-sm font-semibold text-gray-700"
            >
              Event Image{' '}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="image" className="cursor-pointer block">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-10 h-10 text-gray-400 group-hover:text-blue-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">{imageFile?.name}</span>{' '}
                  <span className="text-gray-500">
                    ({`${((imageFile?.size || 0) / 1024 / 1024).toFixed(2)}`}{' '}
                    MB)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedEventTypeId || hasErrors}
            className={cn(
              'transition-all duration-200',
              isLoading && 'opacity-75'
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              'Add Event'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
