'use client';

import {
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import type { Order as OrderType } from '../types';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatVND } from '../../../../components/ui/utils';
import { formatUtcDate } from '../../../../utils/timeUtils';

interface OrderProps {
  order: OrderType;
  getStatusColor: (status: OrderType['orderStatus']) => string;
  getPaymentStatusColor: (status: OrderType['paymentStatus']) => string;
  onNavigateToFeedback: (orderId: string) => void;
}

const isStatusReached = (
  currentStatus: string,
  checkStatus: string
): boolean => {
  const statusOrder = ['Pending', 'Processing', 'Shipping', 'Delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const checkIndex = statusOrder.indexOf(checkStatus);
  return currentIndex >= checkIndex;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return <Clock className="h-4 w-4" />;
    case 'Processing':
      return <Package className="h-4 w-4" />;
    case 'Shipping':
      return <Truck className="h-4 w-4" />;
    case 'Delivered':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const calculateLinePosition = (index: number, totalStatuses: number) => {
  // Each status takes up equal width in the flex container
  const statusWidth =
    index === 0 ? 50 : index === totalStatuses - 1 ? 150 : 100;

  // Calculate the left position: start from the center of the current circle
  const left = index === 0 ? 0 : -50;

  // Calculate width: from center of current circle to center of next circle
  const width = statusWidth;

  return { left: `${left}%`, width: `${width}%` };
};

export function Order({
  order,
  getStatusColor,
  getPaymentStatusColor,
  onNavigateToFeedback,
}: OrderProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0">
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-semibold text-lg text-foreground">
                    {order.orderCode}
                  </h3>
                  <Badge
                    className={`${getStatusColor(
                      order.orderStatus
                    )} font-medium`}
                  >
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatUtcDate(order.orderDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders/${order.id}`)}
                className="hover:bg-primary hover:text-white"
              >
                View Details
              </Button>
              {order.orderStatus === 'Delivered' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToFeedback(order.id)}
                  className="hover:bg-green-50 hover:text-green-700"
                >
                  Leave Feedback
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Items
              </span>
              <span className="text-xl font-semibold text-foreground">
                {order.orderItems.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Total Amount
              </span>
              <span className="text-xl font-semibold text-primary">
                ₫{order.totalPrice.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Shipping Fee
              </span>
              <span className="text-xl font-semibold text-foreground">
                ₫{order.shippingFee.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Payment
              </span>
              <Badge
                className={`${getPaymentStatusColor(
                  order.paymentStatus
                )} w-fit font-medium`}
              >
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Delivery Address
                  </p>
                  <p className="text-sm text-gray-700 break-words">
                    {order.address.detail}, {order.address.ward},{' '}
                    {order.address.district}, {order.address.province}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">
              Order Items
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {order.orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        Batch {item.batchId.substring(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity.toFixed(2)} @ ₫
                        {item.unitPrice.toLocaleString('vi-VN')}/unit
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary flex-shrink-0 ml-2">
                    {formatVND(item.subTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Progress Timeline */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="space-y-4 pt-2">
              <h4 className="font-semibold text-sm text-foreground">
                Delivery Status
              </h4>
              <div className="flex items-center justify-between gap-1 md:gap-2">
                {['Pending', 'Processing', 'Shipping', 'Delivered'].map(
                  (status, index, arr) => {
                    const isReached = isStatusReached(
                      order.orderStatus,
                      status
                    );
                    const isActive = order.orderStatus === status;

                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center flex-1 relative"
                      >
                        {/* Status Circle */}
                        <div
                          className={`relative z-10 mb-2 transition-all duration-300 ${
                            isActive ? 'scale-110' : ''
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isReached
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            <div
                              className={`transition-colors ${
                                isReached ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {getStatusIcon(status)}
                            </div>
                          </div>
                          {isActive && (
                            <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-pulse"></div>
                          )}
                        </div>

                        {/* Connector Line */}
                        <div
                          className={`absolute top-5 h-1 transition-colors ${
                            isReached ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={calculateLinePosition(index, arr.length)}
                        ></div>

                        {/* Status Label */}
                        <span
                          className={`text-xs font-medium text-center mt-2 transition-colors ${
                            isReached ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
