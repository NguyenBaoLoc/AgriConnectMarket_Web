import { useState, useEffect } from "react";
import { ArrowLeft, Package, Truck } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatVND } from "../../../components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "sonner";
import { API } from "../../../api";

interface OrderDetailProps {
  orderId?: string;
  onBack?: () => void;
}

export function OrderDetail({
  orderId: propOrderId,
  onBack: propOnBack,
}: OrderDetailProps = {}) {
  const params = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const actualOrderId = propOrderId || params.orderId || "";
  const actualOnBack = propOnBack || (() => navigate("/farmer/orders"));
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showShipmentDialog, setShowShipmentDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const detailApi = axios.create({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetching order with ID:", actualOrderId);
        const response = await detailApi.get(
          `${API.order.base}/${actualOrderId}`
        );

        if (response.data.success && response.data.data) {
          setOrder(response.data.data);
          setNewStatus(response.data.data.orderStatus);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch order details"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Failed to fetch order details:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [actualOrderId]);

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const statusApi = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await statusApi.patch(
        `${API.order.base}/${actualOrderId}/order-status`,
        { orderStatus: newStatus }
      );

      if (response.data.success) {
        setOrder((prev: any) => ({
          ...prev,
          orderStatus: newStatus,
        }));
        toast.success("Order status updated successfully");
        setShowStatusDialog(false);
      } else {
        throw new Error(
          response.data.message || "Failed to update order status"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast.error(`Error: ${errorMessage}`);
      console.error("Failed to update order status:", errorMessage);
    }
  };

  const handleAddShipment = () => {
    if (!trackingNumber || !carrier) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Shipment information added successfully");
    setShowShipmentDialog(false);
    setTrackingNumber("");
    setCarrier("");
    setEstimatedDelivery("");
    setNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipping":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={actualOnBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-gray-900">Order Details</h2>
          </div>
        </div>
        <Card className="p-6 bg-red-50 border border-red-200">
          <p className="text-red-800">
            Error: {error || "Failed to load order details"}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={actualOnBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-gray-900">Order Details</h2>
            <p className="text-muted-foreground">{order.orderCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Order Information</h3>
              <Badge
                className={getStatusColor(order.orderStatus)}
                variant="secondary"
              >
                {order.orderStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Code:</span>
                <span>{order.orderCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <span>{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems &&
                order.orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p>
                        {item.batch?.season?.product?.productName || "Product"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} {item.batch?.units || "units"}
                      </p>
                    </div>
                    <p>{formatVND(item.quantity * item.unitPrice)}</p>
                  </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <span>{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total:</span>
                <span>{formatVND(order.totalPrice)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{order.customer?.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{order.customer?.phone}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipping">Shipping</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUpdateStatus}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipment Dialog */}
      <Dialog open={showShipmentDialog} onOpenChange={setShowShipmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shipment Information</DialogTitle>
            <DialogDescription>
              Enter tracking and delivery details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Carrier *</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="USPS">USPS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tracking Number *</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Delivery Date</Label>
              <Input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowShipmentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddShipment}
            >
              Add Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
