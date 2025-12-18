import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Calendar,
  Home,
  Sprout,
  Info,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import type { Farm } from "./types";
import { getFarmDetail } from "./api";

const defaultFarm: Farm = {
  id: "",
  farmName: "",
  farmDesc: "",
  batchCodePrefix: "",
  bannerUrl: "",
  phone: "",
  area: "",
  isDelete: false,
  isBanned: false,
  isValidForSelling: false,
  isConfirmAsMall: false,
  createdAt: "",
  farmerId: "",
  addressId: "",
};
export function FarmDetail() {
  const [farm, setFarm] = useState<Farm>(defaultFarm);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { farmId } = useParams();
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/admin/farms");
  };

  const getStatusBadges = (farm: Farm) => {
    const badges: {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }[] = [];
    if (farm.isBanned) badges.push({ label: "Banned", variant: "destructive" });
    if (!farm.isValidForSelling)
      badges.push({ label: "Not Verified", variant: "secondary" });
    if (farm.isConfirmAsMall)
      badges.push({ label: "Confirmed as Mall", variant: "default" });
    if (farm.isDelete) badges.push({ label: "Deleted", variant: "outline" });
    return badges;
  };

  const formatAddress = (address: Farm["address"]) => {
    if (!address) return "No address provided";
    return `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`;
  };

  const handleBan = () => {
    if (!banReason.trim()) {
      return;
    }
    toast.success("Farm has been banned");
    setShowBanModal(false);
    setBanReason("");
  };

  const handleUnban = () => {
    toast.success("Farm has been unbanned");
    setShowUnbanModal(false);
  };

  useEffect(() => {
    const fetchFarmDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getFarmDetail(farmId || "");
        if (response.success && response.data) {
          setFarm(response.data);
        } else {
          toast.error(`Get Farm Detail failed: ${response.message}`);
        }
      } catch (error) {
        console.error("Error fetching farm details:", error);
        toast.error("Error loading farm details");
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
            {/* Banner Image */}
            {farm.bannerUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
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
                        <Badge key={idx} variant={badge.variant as any}>
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
                          {farm.farmer?.userName || "—"}
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
                          {farm.batchCodePrefix || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(farm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                              season.status === "Pending"
                                ? "secondary"
                                : season.status === "Active"
                                ? "default"
                                : "outline"
                            }
                          >
                            {season.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              season.startDate
                            ).toLocaleDateString()} to{" "}
                            {new Date(season.endDate).toLocaleDateString()}
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
                      variant={farm.farmer.isActive ? "default" : "destructive"}
                    >
                      {farm.farmer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Verified At</p>
                    <p className="text-sm font-medium">
                      {farm.farmer.verifiedAt
                        ? new Date(farm.farmer.verifiedAt).toLocaleDateString()
                        : "Not verified"}
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

            {/* Farm Status & Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  <CardTitle>Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Contact Farmer
                </Button>
                {!farm.isBanned ? (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => setShowBanModal(true)}
                  >
                    Ban Farm
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-green-600 hover:text-green-700"
                    onClick={() => setShowUnbanModal(true)}
                  >
                    Unban Farm
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Farm</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban this farm? This action will prevent
              them from listing products and receiving orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason for banning (required)</Label>
              <Textarea
                id="ban-reason"
                placeholder="Enter the reason for banning this farm..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBanModal(false);
                setBanReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBan}
              disabled={!banReason.trim()}
            >
              Yes, Ban Farm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Modal */}
      <Dialog open={showUnbanModal} onOpenChange={setShowUnbanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban Farm</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban this farm? This will restore their
              ability to list products and receive orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUnban}
            >
              Yes, Unban Farm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
