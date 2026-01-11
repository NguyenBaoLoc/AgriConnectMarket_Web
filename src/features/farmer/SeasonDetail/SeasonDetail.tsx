import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  QrCode,
  Leaf,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { formatUtcDate, formatUtcDateTime } from '../../../utils/timeUtils';
import { type Season, type Status, type ProductBatch } from './types';
import {
  getSeason,
  getProductBatchesBySeason,
  updateSeasonStatus,
} from './api';

const defaultSeason = {
  seasonName: '',
  seasonDesc: '',
  status: 'Pending' as Status,
  startDate: '',
  endDate: '',
  createdAt: '',
  updatedAt: '',
  farmId: '',
  productId: '',
  id: '',
};

export function SeasonDetail() {
  const [season, setSeason] = useState<Season>(defaultSeason);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>('Pending');
  const { seasonId } = useParams();

  // Form states
  const [logDate, setLogDate] = useState('');
  const [activity, setActivity] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const navigate = useNavigate();

  function onNavigateBack() {
    navigate(-1);
  }

  // Mock data
  // const season = {
  //   id: seasonId,
  //   name: "Spring Tomatoes 2025",
  //   product: "Tomatoes",
  //   startDate: "2025-03-01",
  //   endDate: "2025-06-30",
  //   status: "Active",
  //   description: "Organic tomato production for spring season",
  //   farm: "Green Valley Farm",
  //   area: "Section A, 2.5 hectares",
  // };

  const handleAddLog = () => {
    if (!logDate || !activity) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Production log added successfully');
    setShowLogDialog(false);
    setLogDate('');
    setActivity('');
    setLogNotes('');
  };

  const handleUploadEvidence = () => {
    toast.success('Evidence uploaded successfully');
    setShowEvidenceDialog(false);
  };

  const handleGenerateQR = () => {
    toast.success('QR code generated successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Harvested':
        return 'bg-blue-100 text-blue-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      try {
        const response = await getSeason(seasonId || '');
        if (response.success && response.data) {
          setSeason(response.data);
          setSelectedStatus(response.data.status);
        } else {
          toast.error(`Failed to fetch season details: ${response.message}`);
        }
      } catch (error) {
        console.error('Failed to fetch season details:', error);
      }
    };
    fetchSeasonDetails();
  }, [seasonId]);

  useEffect(() => {
    const fetchProductBatches = async () => {
      if (!seasonId) return;
      try {
        setIsLoadingBatches(true);
        const response = await getProductBatchesBySeason(seasonId);
        if (response.success && response.data) {
          setBatches(response.data);
        } else {
          toast.error(`Failed to fetch product batches: ${response.message}`);
        }
      } catch (error) {
        console.error('Failed to fetch product batches:', error);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    fetchProductBatches();
  }, [seasonId]);

  const handleStatusChange = async (value: Status) => {
    if (!seasonId) return;
    if (value === season.status) {
      setSelectedStatus(value);
      return;
    }

    setIsUpdatingStatus(true);
    setSelectedStatus(value);
    try {
      const response = await updateSeasonStatus(seasonId, value);
      if (response.success && response.data) {
        setSeason(response.data);
        setSelectedStatus(response.data.status);
        toast.success(response.message || 'Season status updated successfully');
      } else {
        toast.error(response.message || 'Failed to update season status');
        setSelectedStatus(season.status);
      }
    } catch (error) {
      console.error('Failed to update season status:', error);
      toast.error('Failed to update season status');
      setSelectedStatus(season.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 px-4 py-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Enhanced Header with Back Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigateBack()}
              className="hover:bg-green-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                {season.seasonName || 'Season Details'}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor your growing season
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Season Information */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Season Information
                  </h3>
                  <Badge
                    className={`${getStatusColor(
                      season.status
                    )} px-3 py-1 border-2 font-semibold`}
                  >
                    {season.status === 'Active' && (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {season.status === 'Pending' && (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {season.status === 'Harvested' && (
                      <Zap className="h-3 w-3 mr-1" />
                    )}
                    {season.status}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                {/* Status Change Selector */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                    Change Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => handleStatusChange(val as Status)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-full h-11 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-2 border-green-200">
                      <SelectItem value="Pending">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="Active">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="Harvested">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          Harvested
                        </div>
                      </SelectItem>
                      <SelectItem value="Closed">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          Closed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Information Grid */}
                <div className="space-y-5">
                  {/* Season Name */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                      Season Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {season.seasonName}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {season.seasonDesc || 'No description provided'}
                    </p>
                  </div>

                  {/* Start Date */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Start Date
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatUtcDate(season.startDate)}
                    </p>
                  </div>

                  {/* End Date */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> End Date
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatUtcDate(season.endDate)}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                      Created Date
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatUtcDateTime(season.createdAt)}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatUtcDateTime(season.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Product Batches */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Product Batches
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {isLoadingBatches ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Clock className="h-12 w-12 text-gray-300 mb-3 animate-spin" />
                    <p className="text-gray-600 font-medium">
                      Loading product batches...
                    </p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Leaf className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-700 font-medium">
                      No product batches found
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Start by creating your first product batch
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="group border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-linear-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                              {batch.batchCode.value}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Planting Date: {formatUtcDate(batch.plantingDate)}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              batch.availableQuantity > 0
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : 'bg-red-100 text-red-700 border-red-300'
                            } border-2 font-semibold px-3 py-1`}
                          >
                            {batch.availableQuantity > 0
                              ? 'Available'
                              : 'Sold Out'}
                          </Badge>
                        </div>

                        {/* Batch Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                              Total Yield
                            </p>
                            <p className="font-bold text-gray-900">
                              {batch.totalYield}{' '}
                              <span className="text-sm font-normal text-gray-600">
                                {batch.units}
                              </span>
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                              Available
                            </p>
                            <p className="font-bold text-gray-900">
                              {batch.availableQuantity}{' '}
                              <span className="text-sm font-normal text-gray-600">
                                {batch.units}
                              </span>
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                              Price
                            </p>
                            <p className="font-bold text-green-700">
                              ₫{batch.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                              Harvest Date
                            </p>
                            <p className="font-bold text-gray-900">
                              {formatUtcDate(batch.harvestDate)}
                            </p>
                          </div>
                        </div>

                        {/* QR Code Badge */}
                        {batch.verificationQr && (
                          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-2 px-3 w-fit">
                            <QrCode className="h-4 w-4" />
                            <span className="font-semibold">
                              Verification QR available
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Production Log Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">
                Add Production Log
              </DialogTitle>
              <DialogDescription className="text-green-100 mt-1">
                Record farming activities and observations
              </DialogDescription>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-800">Date *</Label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-800">
                Activity *
              </Label>
              <Input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g., Planting, Watering, Harvesting"
                className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-800">Notes</Label>
              <Textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Enter activity details and observations"
                rows={4}
                className="border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLogDialog(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
              onClick={handleAddLog}
            >
              Add Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">
                Upload Evidence
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Upload images and documents for traceability
              </DialogDescription>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-linear-to-br from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              <Input
                type="file"
                className="hidden"
                multiple
                accept="image/*,application/pdf"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEvidenceDialog(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
              onClick={handleUploadEvidence}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-linear-to-r from-purple-500 to-purple-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">
                Generate QR Code
              </DialogTitle>
              <DialogDescription className="text-purple-100 mt-1">
                Create a QR code for product traceability
              </DialogDescription>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <QrCode className="h-32 w-32 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 text-center">
                QR code for: {season.seasonName}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                Season ID: {season.id}
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowQRDialog(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
              onClick={handleGenerateQR}
            >
              Download QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
