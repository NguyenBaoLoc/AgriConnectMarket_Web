import { Calendar, MapPin, Package } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import type { Order } from "../types";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../../../../components/ui/utils";

interface OrderProps {
  order: Order;
  getStatusColor: (status: Order["orderStatus"]) => string;
  getPaymentStatusColor: (status: Order["paymentStatus"]) => string;
  onNavigateToFeedback: (orderId: string) => void;
}

const isStatusReached = (
  currentStatus: string,
  checkStatus: string
): boolean => {
  const statusOrder = ["Pending", "Processing", "In Transit", "Delivered"];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const checkIndex = statusOrder.indexOf(checkStatus);
  return currentIndex >= checkIndex;
};

export function Order({
  order,
  getStatusColor,
  getPaymentStatusColor,
  onNavigateToFeedback,
}: OrderProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Package className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">{order.orderCode}</h3>
              <Badge className={getStatusColor(order.orderStatus)}>
                {order.orderStatus}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                Payment: {order.paymentStatus}
              </Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-600">
                Items: {order.orderItems.length}
              </div>
              <div className="font-semibold">
                Total: ₫{order.totalPrice.toLocaleString("vi-VN")}
              </div>
              <div className="text-gray-600">
                Shipping: ₫{order.shippingFee.toLocaleString("vi-VN")}
              </div>
            </div>

            {order.address && (
              <div className="flex items-start gap-2 mt-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {order.address.detail}, {order.address.ward},{" "}
                  {order.address.district}, {order.address.province}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              View Details
            </Button>
            {order.orderStatus === "Delivered" && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => onNavigateToFeedback(order.id)}
              >
                Leave Feedback
              </Button>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">
            Items ({order.orderItems.length})
          </h4>
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  Batch {item.batchId.substring(0, 8)}... x{" "}
                  {item.quantity.toFixed(2)}
                </span>
                <span className="font-medium">{formatVND(item.subTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Progress */}
        {order.orderStatus !== "Cancelled" && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-4">Order Status</h4>
            <div className="flex items-center justify-between">
              {["Pending", "Processing", "In Transit", "Delivered"].map(
                (status, index, arr) => (
                  <div
                    key={status}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        isStatusReached(order.orderStatus, status)
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isStatusReached(order.orderStatus, status)
                            ? "bg-green-600"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`text-xs text-center ${
                        isStatusReached(order.orderStatus, status)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {status}
                    </span>
                    {index < arr.length - 1 && (
                      <div
                        className={`absolute h-1 w-full ml-4 -mt-6 ${
                          isStatusReached(order.orderStatus, arr[index + 1])
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
