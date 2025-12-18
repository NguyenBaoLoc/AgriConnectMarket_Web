import { useEffect, useState } from 'react';
import { Calendar, Plus, RefreshCw, Trash2, Eye, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import axios from 'axios';
import { API } from '../../../api';
import { toast } from 'sonner';

interface CareEventType {
  id: string;
  eventTypeName: string;
  eventTypeDesc?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function CareEventTypeList() {
  const [eventTypes, setEventTypes] = useState<CareEventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<CareEventType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form state
  const [newEventType, setNewEventType] = useState({
    eventTypeName: '',
    eventTypeDesc: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEventTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(API.eventTypes.list, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setEventTypes(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load care event types');
      }
    } catch (err) {
      console.error('Error fetching care event types:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Failed to load care event types';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleAddEventType = async () => {
    if (!newEventType?.eventTypeName.trim()) {
      toast.error('Please enter a name for the care event type');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        API.eventTypes.create,
        {
          eventTypeName: newEventType?.eventTypeName,
          eventTypeDesc: newEventType.eventTypeDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Care event type created successfully!');
        setIsAddDialogOpen(false);
        setNewEventType({ eventTypeName: '', eventTypeDesc: '' });
        fetchEventTypes();
      } else {
        throw new Error(response.data.message || 'Failed to create care event type');
      }
    } catch (err) {
      console.error('Error creating care event type:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Failed to create care event type';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEventType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this care event type? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(API.eventTypes.delete(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success('Care event type deleted successfully!');
        fetchEventTypes();
      } else {
        throw new Error(response.data.message || 'Failed to delete care event type');
      }
    } catch (err) {
      console.error('Error deleting care event type:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Failed to delete care event type';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewDetail = (eventType: CareEventType) => {
    setSelectedEventType(eventType);
    setIsDetailDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            <Calendar className="text-white" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h2 className="text-gray-900" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
              Care Event Types
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              Manage care event type categories
            </p>
          </div>
        </div>

        {/* Loading State */}
        <Card className="p-12 text-center border-2">
          <div 
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <RefreshCw className="text-white animate-spin" style={{ width: '40px', height: '40px' }} />
          </div>
          <p className="text-gray-600" style={{ fontSize: '18px', fontWeight: '600' }}>
            Loading care event types...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            <Calendar className="text-white" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h2 className="text-gray-900" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
              Care Event Types
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              Manage care event type categories
            </p>
          </div>
        </div>

        {/* Error State */}
        <Card 
          className="p-12 text-center border-2"
          style={{ borderColor: '#fecaca' }}
        >
          <div 
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fee2e2',
            }}
          >
            <AlertCircle className="text-red-600" style={{ width: '40px', height: '40px' }} />
          </div>
          <p className="text-red-600 mb-4" style={{ fontSize: '20px', fontWeight: '700' }}>
            {error}
          </p>
          <Button 
            onClick={fetchEventTypes}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            <RefreshCw className="mr-2" style={{ width: '18px', height: '18px' }} />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            }}
          >
            <Calendar className="text-white" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h2 className="text-gray-900" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
              Care Event Types
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              {eventTypes.length} {eventTypes.length === 1 ? 'type' : 'types'} available
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={fetchEventTypes}
            variant="outline"
            className="border-2 hover:bg-gray-50"
            style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600' }}
          >
            <RefreshCw className="mr-2" style={{ width: '18px', height: '18px' }} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            <Plus className="mr-2" style={{ width: '18px', height: '18px' }} />
            Add New Type
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card 
        className="p-6 border-2 shadow-lg hover:shadow-xl transition-all my-8"
        style={{
          background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
          borderColor: '#c4b5fd',
          margin: '32px 0',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-800 mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
              Total Care Event Types
            </p>
            <p className="text-purple-900" style={{ fontSize: '36px', fontWeight: '800' }}>
              {eventTypes.length}
            </p>
          </div>
          <div 
            className="rounded-full flex items-center justify-center"
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#f3e8ff',
            }}
          >
            <Sparkles className="text-purple-600" style={{ width: '30px', height: '30px' }} />
          </div>
        </div>
      </Card>

      {/* Event Types List */}
      {eventTypes.length === 0 ? (
        <Card 
          className="p-12 text-center border-2"
          style={{ borderColor: '#d1d5db', borderStyle: 'dashed' }}
        >
          <div 
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f3f4f6',
            }}
          >
            <Calendar className="text-gray-400" style={{ width: '40px', height: '40px' }} />
          </div>
          <p className="text-gray-900 mb-2" style={{ fontSize: '20px', fontWeight: '700' }}>
            No Care Event Types
          </p>
          <p className="text-gray-600 mb-6" style={{ fontSize: '16px' }}>
            Get started by creating your first care event type
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            <Plus className="mr-2" style={{ width: '18px', height: '18px' }} />
            Add First Type
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((eventType) => (
            <Card 
              key={eventType.id}
              className="overflow-hidden border-2 hover:shadow-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
              }}
            >
              {/* Card Header */}
              <div 
                className="p-6"
                style={{
                  background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
                  borderBottom: '2px solid #c4b5fd',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      }}
                    >
                      <Calendar className="text-white" style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-purple-900 truncate line-clamp-1" 
                        style={{ fontSize: '18px', fontWeight: '700', lineClamp: 1 }}
                        title={eventType?.eventTypeName}
                      >
                        {eventType?.eventTypeName}
                      </h3>
                      <Badge 
                        className="mt-1"
                        style={{ 
                          backgroundColor: '#f3e8ff', 
                          color: '#7c3aed',
                          fontSize: '11px', 
                          fontWeight: '600' 
                        }}
                      >
                        ID: {eventType.id.slice(0, 8)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-gray-900 mb-2" style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Description
                  </h4>
                  <p 
                    className="text-gray-700" 
                    style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.6',
                      minHeight: '60px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {eventType.eventTypeDesc || 'No description provided'}
                  </p>
                </div>

                {eventType.createdAt && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Calendar style={{ width: '14px', height: '14px' }} />
                    <span style={{ fontSize: '12px' }}>Created: {formatDate(eventType.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div 
                className="p-4 flex items-center justify-between gap-2"
                style={{
                  backgroundColor: '#faf5ff',
                  borderTop: '2px solid #e9d5ff',
                }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 flex-1"
                  style={{ fontSize: '14px', fontWeight: '600' }}
                  onClick={() => handleViewDetail(eventType)}
                >
                  <Eye className="mr-1" style={{ width: '16px', height: '16px' }} />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2"
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    borderColor: '#fca5a5',
                    color: '#dc2626'
                  }}
                  onClick={() => handleDeleteEventType(eventType.id)}
                  disabled={isDeleting === eventType.id}
                >
                  {isDeleting === eventType.id ? (
                    <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Event Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent 
          className="sm:max-w-[600px] border-2"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            borderColor: '#c4b5fd',
            overflowY: 'auto',
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                }}
              >
                <Plus className="text-white" style={{ width: '24px', height: '24px' }} />
              </div>
              <DialogTitle style={{ fontSize: '24px', fontWeight: '800' }}>
                Add New Care Event Type
              </DialogTitle>
            </div>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              Create a new category for care events
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ fontSize: '14px', fontWeight: '700' }}>
                Type Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Watering, Fertilizing, Pruning"
                value={newEventType?.eventTypeName}
                onChange={(e) => setNewEventType({ ...newEventType, eventTypeName: e.target.value })}
                className="border-2"
                style={{ fontSize: '15px', padding: '12px' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" style={{ fontSize: '14px', fontWeight: '700' }}>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe this care event type..."
                value={newEventType.eventTypeDesc}
                onChange={(e) => setNewEventType({ ...newEventType, eventTypeDesc: e.target.value })}
                className="border-2 min-h-[120px]"
                style={{ fontSize: '15px', padding: '12px' }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewEventType({ eventTypeName: '', eventTypeDesc: '' });
              }}
              disabled={isSubmitting}
              className="border-2"
              style={{ fontSize: '15px', fontWeight: '600', padding: '12px 24px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEventType}
              disabled={isSubmitting || !newEventType?.eventTypeName.trim()}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                padding: '12px 32px',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" style={{ width: '16px', height: '16px' }} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2" style={{ width: '16px', height: '16px' }} />
                  Create Type
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent 
          className="sm:max-w-[600px] border-2"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            borderColor: '#c4b5fd',
            overflowY: 'auto',
          }}
        >
          {selectedEventType && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="rounded-lg flex items-center justify-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    }}
                  >
                    <Calendar className="text-white" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <DialogTitle style={{ fontSize: '24px', fontWeight: '800' }}>
                    Care Event Type Details
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* ID */}
                <div>
                  <p className="text-gray-600 mb-2" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Type ID
                  </p>
                  <div 
                    className="p-3 rounded-lg border-2"
                    style={{ 
                      backgroundColor: '#f3e8ff',
                      borderColor: '#e9d5ff',
                    }}
                  >
                    <code className="text-purple-700" style={{ fontSize: '14px', fontWeight: '600' }}>
                      {selectedEventType.id}
                    </code>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="text-gray-600 mb-2" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Type Name
                  </p>
                  <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: '700' }}>
                    {selectedEventType?.eventTypeName}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-600 mb-2" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Description
                  </p>
                  <p className="text-gray-700" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                    {selectedEventType.eventTypeDesc || 'No description provided'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-2" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Created At
                    </p>
                    <p className="text-gray-700" style={{ fontSize: '14px' }}>
                      {formatDate(selectedEventType.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Updated At
                    </p>
                    <p className="text-gray-700" style={{ fontSize: '14px' }}>
                      {formatDate(selectedEventType.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="border-2"
                  style={{ fontSize: '15px', fontWeight: '600', padding: '12px 24px' }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleDeleteEventType(selectedEventType.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    padding: '12px 32px',
                  }}
                >
                  <Trash2 className="mr-2" style={{ width: '16px', height: '16px' }} />
                  Delete Type
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
