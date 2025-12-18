import { CheckCircle, Package, Truck, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatVND } from '../../../components/ui/utils';

interface ShippingAddress {
  detail: string;
  ward: string;
  district: string;
  province: string;
}

interface Customer {
  fullname: string;
  email: string;
  phone: string;
}

interface OrderItemDetail {
  itemId: string;
  batchId: string;
  batchCode: string;
  batchImageUrls?: string[];
  productName: string;
  categoryName: string;
  seasonName: string;
  batchPrice: number;
  quantity: number;
  units: string;
  itemPrice: number;
  seasonStatus?: string;
}

interface FarmItems {
  farmId: string;
  farmName: string;
  items: OrderItemDetail[];
}

interface OrderData {
  id?: string;
  customer: Customer;
  address: ShippingAddress;
  orderCode: string;
  totalPrice: number;
  orderDate: string;
  shippingFee: number;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: FarmItems[];
}

interface OrderConfirmationResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

interface OrderConfirmationProps {
  orderId?: string;
  orderCode?: string;
  orderDate?: string;
  totalPrice?: number;
  shippingFee?: number;
  shippingAddress?: ShippingAddress;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  orderItems?: FarmItems[];
  orderData?: OrderData;
  responseData?: OrderConfirmationResponse;
  onViewOrders?: ((orderId?: string) => void) | null;
  onContinueShopping?: () => void;
}

export function OrderConfirmation({
  orderId,
  orderCode,
  orderDate,
  totalPrice,
  shippingFee,
  shippingAddress,
  customerName,
  customerEmail,
  customerPhone,
  orderStatus,
  paymentStatus,
  paymentMethod,
  orderItems,
  orderData,
  responseData,
  onViewOrders,
  onContinueShopping,
}: OrderConfirmationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  // Determine the data source with priority: responseData -> state.orderData -> orderData -> props -> constructed state
  const effectiveOrderData = responseData?.data ||
    state.orderData ||
    orderData || {
      id: orderId || state.orderId,
      customer: {
        fullname: customerName || state.customerName || 'Customer',
        email: customerEmail || state.customerEmail || 'N/A',
        phone: customerPhone || state.customerPhone || 'N/A',
      },
      address: shippingAddress ||
        state.shippingAddress || {
          detail: 'N/A',
          ward: 'N/A',
          district: 'N/A',
          province: 'N/A',
        },
      orderCode: orderCode || state.orderCode || 'N/A',
      orderDate: orderDate || state.orderDate || new Date().toISOString(),
      totalPrice:
        totalPrice !== undefined
          ? totalPrice
          : state.totalPrice || state.subtotal || 0,
      shippingFee:
        shippingFee !== undefined ? shippingFee : state.shippingFee || 0,
      orderStatus: orderStatus || state.orderStatus || 'Pending',
      paymentStatus: paymentStatus || state.paymentStatus || 'Pending',
      paymentMethod: paymentMethod || state.paymentMethod || 'Cash on Delivery',
      orderItems: orderItems || state.orderItems || [],
      orderType: state.orderType || 'Order',
      createdAt: state.createdAt || new Date().toISOString(),
    };

  // Extract final values from effectiveOrderData
  const finalOrderId = effectiveOrderData.id;
  const finalOrderCode = effectiveOrderData.orderCode;
  const finalOrderDate = effectiveOrderData.orderDate;
  const finalTotalPrice = effectiveOrderData.totalPrice;
  const finalShippingFee = effectiveOrderData.shippingFee;
  const finalCustomerName = effectiveOrderData.customer.fullname;
  const finalCustomerEmail = effectiveOrderData.customer.email;
  const finalCustomerPhone = effectiveOrderData.customer.phone;
  const finalOrderStatus = effectiveOrderData.orderStatus;
  const finalPaymentStatus = effectiveOrderData.paymentStatus;
  const finalPaymentMethod = effectiveOrderData.paymentMethod;
  const finalShippingAddress = effectiveOrderData.address;
  const finalOrderItems = effectiveOrderData.orderItems;

  console.log('EffectiveOrderData:', effectiveOrderData);
  console.log('FinalOrderItems:', finalOrderItems);

  const estimatedDelivery = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('vi-VN');

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="font-mono">{finalOrderCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p>{new Date(finalOrderDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-green-600">{formatVND(finalTotalPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Estimated Delivery
              </p>
              <p>{estimatedDelivery}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Status</p>
              <p className="font-medium">{finalOrderStatus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Payment Status
              </p>
              <p className="font-medium">{finalPaymentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Payment Method
              </p>
              <p className="font-medium">{finalPaymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Shipping Fee</p>
              <p className="font-medium">
                ₫{finalShippingFee.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{finalCustomerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{finalCustomerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{finalCustomerPhone}</p>
              </div>
            </div>
          </div>

          {/* Order Items by Farm */}
          {finalOrderItems.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-6">
                {finalOrderItems.map((farm: FarmItems) => (
                  <div key={farm.farmId}>
                    <p className="text-sm font-semibold text-green-600 mb-3">
                      {farm.farmName}
                    </p>
                    <div className="space-y-2 ml-2">
                      {farm.items?.map((item: OrderItemDetail) => (
                        <div
                          key={item.itemId}
                          className="flex justify-between text-sm text-gray-700 p-2 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              Batch: {item.batchCode} | {item.categoryName} |{' '}
                              {item.seasonName}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs">
                              {item.quantity} {item.units}
                            </p>
                            <p className="font-medium">
                              ₫
                              {(item.itemPrice * item.quantity).toLocaleString(
                                'vi-VN'
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-3">Shipping Address</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">{finalCustomerName}</p>
                <p className="text-muted-foreground">
                  {finalShippingAddress?.detail || 'N/A'}
                </p>
                <p className="text-muted-foreground">
                  {finalShippingAddress?.ward || 'N/A'},{' '}
                  {finalShippingAddress?.district || 'N/A'},{' '}
                  {finalShippingAddress?.province || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* What's Next */}
        <Card className="p-6 mb-6">
          <h3 className="text-gray-900 mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p>Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  We're preparing your items for shipment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p>Shipping</p>
                <p className="text-sm text-muted-foreground">
                  Your order will be shipped within 4-5 business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p>Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Expected delivery by {estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => {
              if (finalOrderId) {
                navigate(`/orders/${orderId}`);
              } else {
                console.warn('Order ID not found');
              }
            }}
          >
            View Order Details
          </Button>
          {onContinueShopping && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onContinueShopping}
            >
              Continue Shopping
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
