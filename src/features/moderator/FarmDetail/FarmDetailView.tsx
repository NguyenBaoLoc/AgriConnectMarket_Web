import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Calendar,
  Home,
  Sprout,
  ZoomIn,
  CheckCircle,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { formatUtcDate } from '../../../utils/timeUtils';
import { Separator } from '../../../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import type { Farm } from './types';
import {
  getFarmDetail,
  allowFarmForSelling,
  certificateVerifiedFarm,
} from './api';
import { FarmActionsDialog } from './FarmActionsDialog';

const defaultFarm: Farm = {
  id: '',
  farmName: '',
  farmDesc: '',
  batchCodePrefix: '',
  bannerUrl: '',
  certificateUrl: '',
  phone: '',
  area: '',
  isDelete: false,
  isBanned: false,
  isValidForSelling: false,
  isConfirmAsMall: false,
  createdAt: '',
  farmerId: '',
  addressId: '',
};

export function ModeratorFarmDetailView() {
  const [farm, setFarm] = useState<Farm>(defaultFarm);
  const [isLoading, setIsLoading] = useState(true);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);
  const [isLoadingAllowSell, setIsLoadingAllowSell] = useState(false);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);
  const { farmId } = useParams();
  const navigate = useNavigate();

  const onBack = () => {
    navigate('/moderator/farms');
  };

  const getStatusBadges = (farm: Farm) => {
    const badges: {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }[] = [];

    if (!farm.isBanned) badges.push({ label: 'Active', variant: 'default' });
    else badges.push({ label: 'Banned', variant: 'secondary' });
    if (farm.isValidForSelling)
      badges.push({ label: 'Accepted for selling', variant: 'default' });
    else badges.push({ label: 'Selling not accepted', variant: 'secondary' });
    if (farm.isConfirmAsMall)
      badges.push({ label: 'Certificate Verified', variant: 'default' });
    else
      badges.push({ label: 'Certificate Not Verified', variant: 'secondary' });
    return badges;
  };

  const formatAddress = (address: Farm['address']) => {
    if (!address) return 'No address provided';
    return `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`;
  };

  const handleAllowForSell = async () => {
    try {
      setIsLoadingAllowSell(true);
      const response = await allowFarmForSelling(farmId || '');
      if (response.success) {
        toast.success('Farm has been allowed for selling');
        setIsActionsDialogOpen(false);
        // Refresh farm data
        const detailResponse = await getFarmDetail(farmId || '');
        if (detailResponse.success && detailResponse.data) {
          setFarm(detailResponse.data);
        }
      } else {
        toast.error(`Failed to allow farm for selling: ${response.message}`);
      }
    } catch (error) {
      console.error('Error allowing farm for selling:', error);
      toast.error((error as any).response.data.message);
    } finally {
      setIsLoadingAllowSell(false);
    }
  };

  const handleCertificateVerified = async () => {
    try {
      setIsLoadingCertificate(true);
      const response = await certificateVerifiedFarm(farmId || '');

      if (response.success) {
        toast.success('Farm certificate has been verified');
        setIsActionsDialogOpen(false);
        // Refresh farm data
        const detailResponse = await getFarmDetail(farmId || '');
        if (detailResponse.success && detailResponse.data) {
          setFarm(detailResponse.data);
        }
      } else {
        toast.error(`Failed to verify farm certificate: ${response.message}`);
      }
    } catch (error) {
      console.error('Error verifying farm certificate:', error);
      toast.error((error as any).response.data.message);
    } finally {
      setIsLoadingCertificate(false);
    }
  };

  useEffect(() => {
    const fetchFarmDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getFarmDetail(farmId || '');
        if (response.success && response.data) {
          setFarm(response.data);
        } else {
          toast.error(`Get Farm Detail failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Error fetching farm details:', error);
        toast.error('Error loading farm details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFarmDetail();
  }, [farmId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading farm details...</p>
        </div>
      </div>
    );
  }

  const statusBadges = getStatusBadges(farm);

  return (
    <>
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Farms
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Image - Small Section */}
            {farm.bannerUrl && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                <img
                  src={farm.bannerUrl}
                  alt={farm.farmName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Farm Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{farm.farmName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Farm ID: {farm.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {statusBadges.length === 0 ? (
                      <Badge variant="outline">Active</Badge>
                    ) : (
                      statusBadges.map((badge, idx) => (
                        <Badge
                          key={idx}
                          variant={badge.variant as any}
                          className={`${
                            badge.variant === 'secondary'
                              ? 'bg-red-500 text-white'
                              : badge.variant === 'default'
                              ? 'bg-green-500 text-white'
                              : ''
                          }`}
                        >
                          {badge.label}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{farm.farmDesc}</p>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {farm.farmer?.userName || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{farm.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">
                          {formatAddress(farm.address)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Farm Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="text-sm font-medium">
                          {farm.area} hectares
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Batch Code Prefix
                        </p>
                        <p className="text-sm font-medium">
                          {farm.batchCodePrefix || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {formatUtcDate(farm.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <CardTitle>Certificate</CardTitle>
                  </div>
                  {farm.certificateUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageZoomOpen(true)}
                      title="View Full Size"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {farm.certificateUrl ? (
                  <div
                    className="relative w-full h-64 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setImageZoomOpen(true)}
                  >
                    <img
                      src={farm.certificateUrl}
                      alt="Farm Certificate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        No certificate has been uploaded for this farm yet.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please contact the farmer to request certificate
                        submission.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seasons */}
            {farm.seasons && farm.seasons.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5" />
                    <CardTitle>Seasons ({farm.seasons.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {farm.seasons.map((season) => (
                      <div
                        key={season.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">
                              {season.seasonName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {season.seasonDesc}
                            </p>
                          </div>
                          <Badge
                            variant={
                              season.status === 'Pending'
                                ? 'secondary'
                                : season.status === 'Active'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {season.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatUtcDate(season.startDate)} to{' '}
                            {formatUtcDate(season.endDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Moderator Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  variant="default"
                  onClick={handleAllowForSell}
                  disabled={isLoadingAllowSell}
                >
                  {isLoadingAllowSell && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Allow for Sell
                </Button>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                  variant="outline"
                  onClick={handleCertificateVerified}
                  disabled={isLoadingCertificate}
                >
                  {isLoadingCertificate && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mr-2"></div>
                  )}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Certificate Verified
                </Button>
              </CardContent>
            </Card>

            {/* Farmer Info */}
            {farm.farmer && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <CardTitle>Farmer Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="text-sm font-medium">
                      {farm.farmer.userName}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-sm font-medium">{farm.farmer.role}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={farm.farmer.isActive ? 'default' : 'destructive'}
                    >
                      {farm.farmer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Verified At</p>
                    <p className="text-sm font-medium">
                      {farm.farmer.verifiedAt
                        ? formatUtcDate(farm.farmer.verifiedAt)
                        : 'Account not verified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address Info */}
            {farm.address && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <CardTitle>Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Province</p>
                    <p className="text-sm font-medium">
                      {farm.address.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="text-sm font-medium">
                      {farm.address.district}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ward</p>
                    <p className="text-sm font-medium">{farm.address.ward}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Detail</p>
                    <p className="text-sm font-medium">{farm.address.detail}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen} modal={true}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Farm Certificate</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg overflow-auto">
            {farm.certificateUrl && (
              <img
                src={farm.certificateUrl}
                alt="Farm Certificate - Full Size"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Farm Actions Dialog */}
      <FarmActionsDialog
        isOpen={isActionsDialogOpen}
        onOpenChange={setIsActionsDialogOpen}
        farmName={farm.farmName}
        onAllowForSell={handleAllowForSell}
        onCertificateVerified={handleCertificateVerified}
        isLoadingAllowSell={isLoadingAllowSell}
        isLoadingCertificate={isLoadingCertificate}
      />
    </>
  );
}
