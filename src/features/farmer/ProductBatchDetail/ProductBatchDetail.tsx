import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Leaf,
  ShoppingCart,
  ZoomIn,
  MapPin,
  Ban,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatUtcDate } from '../../../utils/timeUtils';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';
import type { ProductBatchDetail } from './types';
import { getProductBatchDetail, stopSellingProductBatch } from './api';
import { AddEventDialog } from './components/AddEventDialog';
import { EventList } from './components/EventList';
import { HarvestDialog } from './components/HarvestDialog';
import { SellDialog } from './components/SellDialog';
import { ImageCarousel } from './components/ImageCarousel';

export function ProductBatchDetail() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<ProductBatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [eventRefreshTrigger, setEventRefreshTrigger] = useState(0);
  const [harvestDialogOpen, setHarvestDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);
  const [stopSellingDialogOpen, setStopSellingDialogOpen] = useState(false);
  const [isStoppingBatch, setIsStoppingBatch] = useState(false);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      if (!batchId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await getProductBatchDetail(batchId);
        if (response.success && response.data) {
          setBatch(response.data);
        } else {
          setError(response.message || 'Failed to load batch details');
          toast.error(response.message || 'Failed to load batch details');
        }
      } catch (err) {
        console.error('Error fetching batch details:', err);
        setError('Error loading batch details');
        toast.error('Error loading batch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchDetail();
  }, [batchId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEventAdded = () => {
    setEventRefreshTrigger((prev) => prev + 1);
  };

  const handleBatchUpdated = () => {
    if (batchId) {
      const fetchBatchDetail = async () => {
        const response = await getProductBatchDetail(batchId);
        if (response.success && response.data) {
          setBatch(response.data);
        }
      };
      fetchBatchDetail();
    }
  };

  const handleStopSelling = async () => {
    if (!batchId) {
      toast.error('Batch ID not found');
      return;
    }

    try {
      setIsStoppingBatch(true);
      const response = await stopSellingProductBatch(batchId);
      if (response.success && response.data) {
        setBatch(response.data);
        setStopSellingDialogOpen(false);
        toast.success('Batch selling stopped successfully');
      } else {
        toast.error(response.message || 'Failed to stop batch selling');
      }
    } catch (error) {
      console.error('Error stopping batch selling:', error);
      toast.error('Error stopping batch selling');
    } finally {
      setIsStoppingBatch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error || 'Batch not found'}</p>
        </div>
      </div>
    );
  }

  const isInStock = batch.harvestDate !== null && batch.availableQuantity > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Back Button and Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setHarvestDialogOpen(true)}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
          >
            <Leaf className="h-4 w-4 mr-2" />
            Update Yield
          </Button>
          <Button
            variant="outline"
            onClick={() => setSellDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Sell Batch
          </Button>
          <Button
            variant="outline"
            onClick={() => setStopSellingDialogOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Ban className="h-4 w-4 mr-2" />
            Stop Selling
          </Button>
          <Button onClick={() => setIsAddEventDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image & Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image Carousel */}
          <Card className="overflow-hidden p-4">
            <ImageCarousel
              images={batch.imageUrls || []}
              batchCode={batch.batchCode.value}
              isOutOfStock={!isInStock}
            />
          </Card>

          {/* Batch Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {batch.season?.product?.productName}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Product batch: {batch.batchCode.value}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Yield
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {batch.totalYield} {batch.units}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Available Quantity
                </p>
                <p className="text-lg font-semibold">
                  <Badge
                    variant="secondary"
                    className={
                      isInStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {batch.availableQuantity} {batch.units}
                  </Badge>
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-xl font-bold text-green-600">
                  {Number(batch.price).toLocaleString('vi-VN')}₫
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Planting Date
                </p>
                <p className="text-gray-900">
                  {formatUtcDate(batch.plantingDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Harvest Date
                </p>
                <p className="text-gray-900">
                  {formatUtcDate(batch.harvestDate)}
                </p>
              </div>
            </div>
          </Card>

          {/* Verification QR Code */}
          {batch.verificationQr && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Verification QR Code
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQrZoomOpen(true)}
                  title="View Full Size"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={batch.verificationQr}
                  alt="Verification QR Code"
                  className="w-64 h-64 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setQrZoomOpen(true)}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Right: Related Information */}
        <div className="space-y-6">
          {/* Season Information */}
          {batch.season && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Season Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Season Name</p>
                  <p className="font-semibold">{batch.season.seasonName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="secondary"
                    className={
                      batch.season.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : batch.season.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {batch.season.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{formatUtcDate(batch.season.startDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p>{formatUtcDate(batch.season.endDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm text-gray-700">
                    {batch.season.seasonDesc || 'No description'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Farm Information */}
          {batch.season?.farm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Farm Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Farm Name</p>
                  <p className="font-semibold">{batch.season.farm.farmName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p>
                    {batch.season.farm.area} m<sup>2</sup>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm">{batch.season.farm.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="secondary"
                    className={
                      !batch.season.farm.isDelete && !batch.season.farm.isBanned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {!batch.season.farm.isDelete && !batch.season.farm.isBanned
                      ? 'Active'
                      : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Farm Address */}
          {batch.season?.farm?.address && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-900" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Farm Location
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Province</p>
                  <p className="font-semibold">
                    {batch.season.farm.address.province}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="text-sm">
                    {batch.season.farm.address.district}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ward</p>
                  <p className="text-sm">{batch.season.farm.address.ward}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Address Details
                  </p>
                  <p className="text-sm text-gray-700">
                    {batch.season.farm.address.detail}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Full Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {batch.season.farm.address.detail},{' '}
                    {batch.season.farm.address.ward},{' '}
                    {batch.season.farm.address.district},{' '}
                    {batch.season.farm.address.province}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Product Information */}
          {batch.season?.product && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-semibold">
                    {batch.season.product.productName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Attribute</p>
                  <p className="text-sm">
                    {batch.season.product.productAttribute || 'No attribute'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm text-gray-700">
                    {batch.season.product.productDesc || 'No description'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Care Events Section */}
      <div className="mt-8">
        <EventList
          batchId={batchId || ''}
          refreshTrigger={eventRefreshTrigger}
        />
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
        batchId={batchId || ''}
        onEventAdded={handleEventAdded}
      />

      {/* Harvest Dialog */}
      {batch && (
        <HarvestDialog
          open={harvestDialogOpen}
          onOpenChange={setHarvestDialogOpen}
          batchId={batch.id}
          batchCode={batch.batchCode.value}
          currentYield={batch.totalYield}
          onSuccess={handleBatchUpdated}
        />
      )}

      {/* Sell Dialog */}
      {batch && (
        <SellDialog
          open={sellDialogOpen}
          onOpenChange={setSellDialogOpen}
          batchId={batch.id}
          batchCode={batch.batchCode.value}
          availableQuantity={batch.availableQuantity}
          currentPrice={batch.price}
          onSuccess={handleBatchUpdated}
        />
      )}

      {/* QR Code Zoom Dialog */}
      {batch?.verificationQr && (
        <Dialog open={qrZoomOpen} onOpenChange={setQrZoomOpen} modal={true}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Verification QR Code</DialogTitle>
            </DialogHeader>
            <div className="bg-gray-50 rounded-lg overflow-auto p-6 flex justify-center">
              <img
                src={batch.verificationQr}
                alt="Verification QR Code - Full Size"
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stop Selling Dialog */}
      <Dialog
        open={stopSellingDialogOpen}
        onOpenChange={setStopSellingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Selling Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop selling this batch? This action will
              make the batch unavailable for purchase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStopSellingDialogOpen(false)}
              disabled={isStoppingBatch}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleStopSelling}
              disabled={isStoppingBatch}
            >
              {isStoppingBatch ? 'Stopping...' : 'Yes, Stop Selling'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
