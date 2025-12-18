import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  Lock,
  ShoppingCart,
  Tractor,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
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
import { getUserProfile, getProfileOrders, getFarmByAccountId } from "./api";
import type { UserProfile } from "./types";

export function UserDetail() {
  const [userStatus, setUserStatus] = useState<"active" | "banned">("active");
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [farmData, setFarmData] = useState<any>(null);
  const [farmLoading, setFarmLoading] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();

  const handleViewOrders = async () => {
    if (!userProfile) return;
    try {
      setOrdersLoading(true);
      const response = await getProfileOrders(userProfile.id);
      if (response.success) {
        setOrdersData(response.data);
        setShowOrdersModal(true);
      } else {
        toast.error(`Failed to fetch orders: ${response.message}`);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleViewFarm = async () => {
    if (!userProfile) return;
    try {
      setFarmLoading(true);
      const response = await getFarmByAccountId(userProfile.accountId);
      if (response.success) {
        setFarmData(response.data);
        setShowFarmModal(true);
      } else {
        toast.error(`Failed to fetch farm: ${response.message}`);
      }
    } catch (error) {
      console.error("Error fetching farm:", error);
      toast.error("Failed to load farm details");
    } finally {
      setFarmLoading(false);
    }
  };

  const onBack = () => {
    navigate("/admin/users");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        toast.error("User ID not found");
        return;
      }
      try {
        setIsLoading(true);
        const response = await getUserProfile(userId);
        if (response.success && response.data) {
          setUserProfile(response.data);
        } else {
          toast.error(`Failed to fetch user profile: ${response.message}`);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // User data from API
  const user = {
    id: userId,
    name: userProfile?.fullname || "N/A",
    email: userProfile?.email || "N/A",
    phone: userProfile?.phone || "N/A",
    joinDate: userProfile?.createdAt
      ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A",
  };

  const handleBan = () => {
    if (!banReason.trim()) {
      return;
    }
    setUserStatus("banned");
    setShowBanModal(false);
    setBanReason("");
    toast.success("Customer has been banned");
  };

  const handleUnban = () => {
    setUserStatus("active");
    setShowUnbanModal(false);
    toast.success("Customer has been unbanned");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "banned":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Shipping":
        return "bg-cyan-100 text-cyan-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Canceled":
        return "bg-red-100 text-red-700";
      case "Returned":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <>
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Loading user profile...
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              User profile not found
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Users
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-3xl">{user.name}</CardTitle>
                        {userProfile?.account && (
                          <Badge className="mt-1">
                            {userProfile.account.role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs px-3 py-1 ${getStatusColor(userStatus)}`}
                >
                  {userStatus.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-sm font-medium">{user.joinDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userStatus === "active" ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowBanModal(true)}
                  >
                    Ban User
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowUnbanModal(true)}
                  >
                    Unban User
                  </Button>
                )}
                {userProfile?.account?.role === "Buyer" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewOrders}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                ) : userProfile?.account?.role === "Farmer" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewFarm}
                  >
                    <Tractor className="w-4 h-4 mr-2" />
                    View Farm
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info("Feature coming soon");
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ban Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban this customer? This action will
              prevent them from placing new orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason for banning (required)</Label>
              <Textarea
                id="ban-reason"
                placeholder="Enter the reason for banning this customer..."
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
              Yes, Ban Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Modal */}
      <Dialog open={showUnbanModal} onOpenChange={setShowUnbanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban this customer? This will restore
              their ability to place orders.
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
              Yes, Unban Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orders Modal */}
      <Dialog open={showOrdersModal} onOpenChange={setShowOrdersModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Orders ({ordersData.length})</DialogTitle>
          </DialogHeader>
          {ordersLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading orders...
            </div>
          ) : ordersData && ordersData.length > 0 ? (
            <div className="space-y-4">
              {selectedOrder ? (
                // Order Details View
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ← Back to Orders
                  </Button>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{selectedOrder.orderCode}</CardTitle>
                        <Badge className={getOrderStatusColor(selectedOrder.orderStatus)}>
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Order Date</p>
                          <p className="text-sm font-medium">
                            {new Date(selectedOrder.orderDate).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Price</p>
                          <p className="text-sm font-medium text-green-600">
                            ₫{selectedOrder.totalPrice?.toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Payment Status</p>
                          <Badge variant={selectedOrder.paymentStatus === "Paid" ? "default" : "secondary"}>
                            {selectedOrder.paymentStatus}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Payment Method</p>
                          <p className="text-sm font-medium">{selectedOrder.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Shipping Fee</p>
                          <p className="text-sm font-medium">₫{selectedOrder.shippingFee?.toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Order Type</p>
                          <p className="text-sm font-medium">{selectedOrder.orderType}</p>
                        </div>
                      </div>

                      {selectedOrder.address && (
                        <div className="border-t pt-4">
                          <p className="text-xs text-muted-foreground mb-2">Shipping Address</p>
                          <p className="text-sm">
                            {selectedOrder.address.detail}, {selectedOrder.address.ward || ""} {selectedOrder.address.district || ""}, {selectedOrder.address.province}
                          </p>
                        </div>
                      )}

                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-xs text-muted-foreground mb-2">Order Items</p>
                          <div className="space-y-2">
                            {selectedOrder.orderItems.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm border-l-2 border-blue-200 pl-3">
                                <span>Qty: {item.quantity}</span>
                                <span>Unit: ₫{item.unitPrice?.toLocaleString('vi-VN')}</span>
                                <span className="font-medium">Subtotal: ₫{item.subTotal?.toLocaleString('vi-VN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2">Created</p>
                        <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Orders List View
                <div className="space-y-2">
                  {ordersData.map((order: any) => (
                    <Card 
                      key={order.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{order.orderCode}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.orderDate).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm text-green-600">
                              ₫{order.totalPrice?.toLocaleString('vi-VN')}
                            </p>
                            <div className="flex gap-2 justify-end mt-1">
                              <Badge className={getOrderStatusColor(order.orderStatus)}>
                                {order.orderStatus}
                              </Badge>
                              <Badge variant={order.paymentStatus === "Paid" ? "default" : "secondary"}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No orders found
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowOrdersModal(false);
              setSelectedOrder(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Farm Modal */}
      <Dialog open={showFarmModal} onOpenChange={setShowFarmModal}>
        <DialogContent className="max-w-3xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Farm Details</DialogTitle>
          </DialogHeader>
          {farmLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading farm details...
            </div>
          ) : farmData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">Farm Name</p>
                  <p className="text-sm font-medium">{farmData.farmName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{farmData.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="text-sm font-medium">{farmData.area || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Batch Code Prefix</p>
                  <p className="text-sm font-medium">{farmData.batchCodePrefix || "N/A"}</p>
                </div>
              </div>
              {farmData.farmDesc && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{farmData.farmDesc}</p>
                </div>
              )}
              {farmData.address && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Address</p>
                  <p className="text-sm">
                    {farmData.address.detail}, {farmData.address.ward}, {farmData.address.district}, {farmData.address.province}
                  </p>
                </div>
              )}
              {farmData.seasons && farmData.seasons.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Seasons ({farmData.seasons.length})</p>
                  <div className="space-y-2">
                    {farmData.seasons.slice(0, 3).map((season: any, idx: number) => (
                      <div key={idx} className="text-sm border-l-2 border-blue-200 pl-3">
                        <p className="font-medium">{season.seasonName}</p>
                        <p className="text-xs text-muted-foreground">{season.seasonDesc}</p>
                      </div>
                    ))}
                    {farmData.seasons.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{farmData.seasons.length - 3} more seasons</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No farm data available
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFarmModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      );
      }
