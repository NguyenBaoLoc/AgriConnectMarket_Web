import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { getOrderDetail, updateOrderStatus } from './api';
import { Footer } from '../components';
import { ArrowLeft, MapPin, Truck, CheckCircle } from 'lucide-react';
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
  avatarUrl?: string;
}

interface OrderItemData {
  orderId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  batch?: {
    batchCode?: {
      value: string;
    };
    price: number;
    units: string;
    imageUrls?: string[];
    season?: {
      seasonName: string;
    };
  };
  id: string;
}

interface OrderData {
  id: string;
  customer: Customer;
  address?: ShippingAddress;
  orderCode: string;
  totalPrice: number;
  orderDate: string;
  shippingFee: number;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: OrderItemData[];
  customerId: string;
  addressId: string;
}

const isStatusReached = (
  currentStatus: string,
  checkStatus: string
): boolean => {
  const statusOrder = ['Pending', 'Processing', 'In Transit', 'Delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const checkIndex = statusOrder.indexOf(checkStatus);
  return currentIndex >= checkIndex;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700';
    case 'In Transit':
      return 'bg-blue-100 text-blue-700';
    case 'Processing':
      return 'bg-yellow-100 text-yellow-700';
    case 'Pending':
      return 'bg-gray-100 text-gray-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Failed':
      return 'bg-red-100 text-red-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        toast.error('Order ID not found');
        navigate('/orders');
        return;
      }

      try {
        setIsLoading(true);
        const response = await getOrderDetail(orderId);
        console.log('Order detail response:', response);
        if (response.success && response.data) {
          setOrderData(response.data);
        } else {
          toast.error(`Failed to load order: ${response.message}`);
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        toast.error('Failed to load order details. Please try again.');
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='p-8'>
          <p className='text-center text-gray-500'>Loading order details...</p>
        </Card>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='p-8'>
          <p className='text-center text-gray-500'>Order not found</p>
        </Card>
      </div>
    );
  }

  const estimatedDelivery = new Date(
    new Date(orderData.orderDate).getTime() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('vi-VN');

  return (
    <div className='container mx-auto px-4 py-8 mb-8'>
      {/* Back Button */}
      <Button
        variant='ghost'
        className='mb-6'
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Orders
      </Button>

      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Order Details</h1>
        <p className='text-gray-600'>Order: {orderData.orderCode}</p>
      </div>

      {/* Order Status Overview */}
      <Card className='p-6 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Order Number</p>
            <p className='font-mono font-semibold'>{orderData.orderCode}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Order Date</p>
            <p className='font-semibold'>
              {new Date(orderData.orderDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Order Status</p>
            <p
              className={`px-3 py-1 rounded inline-block text-sm font-medium ${getStatusColor(
                orderData.orderStatus
              )}`}
            >
              {orderData.orderStatus}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Payment Status</p>
            <p
              className={`px-3 py-1 rounded inline-block text-sm font-medium ${getPaymentStatusColor(
                orderData.paymentStatus
              )}`}
            >
              {orderData.paymentStatus}
            </p>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className='p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Order Items</h3>
        <div className='space-y-4'>
          {orderData.orderItems.map((item) => (
            <div
              key={item.id}
              className='flex justify-between items-center p-4 bg-gray-50 rounded-lg border'
            >
              <div className='flex-1'>
                <p className='font-medium'>
                  Batch Code: {item.batch?.batchCode?.value || 'N/A'}
                </p>
                <p className='text-sm text-gray-600 mt-1'>
                  Season: {item.batch?.season?.seasonName || 'N/A'}
                </p>
                <p className='text-sm text-gray-600'>
                  Unit: {item.batch?.units || 'N/A'}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600 mb-1'>
                  Quantity: {item.quantity} {item.batch?.units || ''}
                </p>
                <p className='text-sm text-gray-600 mb-1'>
                  Unit Price: {formatVND(item.unitPrice)}
                </p>
                <p className='font-semibold'>
                  {formatVND(item.subTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Summary */}
      <Card className='p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Price Summary</h3>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>Subtotal:</span>
            <span>
              {formatVND(orderData.totalPrice - orderData.shippingFee)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>Shipping Fee:</span>
            <span>{formatVND(orderData.shippingFee)}</span>
          </div>
          <div className='border-t pt-2 flex justify-between font-semibold text-lg'>
            <span>Total:</span>
            <span className='text-green-600'>
              {formatVND(orderData.totalPrice)}
            </span>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card className='p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Customer Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Full Name</p>
            <p className='font-medium'>{orderData.customer.fullname}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Email</p>
            <p className='font-medium break-all'>{orderData.customer.email}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Phone</p>
            <p className='font-medium'>{orderData.customer.phone}</p>
          </div>
        </div>
      </Card>

      {/* Shipping Address */}
      <Card className='p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Shipping Address</h3>
        <div className='flex items-start gap-3'>
          <MapPin className='h-5 w-5 text-green-600 mt-1 flex-shrink-0' />
          <div>
            <p className='font-medium'>{orderData.customer.fullname}</p>
            <p className='text-gray-600'>
              {orderData.address?.detail || 'N/A'}
            </p>
            <p className='text-gray-600'>
              {orderData.address?.ward || 'N/A'},{' '}
              {orderData.address?.district || 'N/A'},{' '}
              {orderData.address?.province || 'N/A'}
            </p>
            <p className='text-gray-600 mt-2'>
              Phone: {orderData.customer.phone}
            </p>
          </div>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className='p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Payment Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Payment Method</p>
            <p className='font-medium'>{orderData.paymentMethod}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Payment Status</p>
            <p
              className={`px-3 py-1 rounded inline-block text-sm font-medium ${getPaymentStatusColor(
                orderData.paymentStatus
              )}`}
            >
              {orderData.paymentStatus}
            </p>
          </div>
        </div>
      </Card>

      {/* Order Status Timeline */}
      {orderData.orderStatus !== 'Cancelled' && (
        <Card className='p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-6'>Order Status Timeline</h3>
          <div className='flex items-center justify-between'>
            {['Pending', 'Processing', 'In Transit', 'Delivered'].map(
              (status, index, arr) => (
                <div key={status} className='flex flex-col items-center flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isStatusReached(orderData.orderStatus, status)
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {isStatusReached(orderData.orderStatus, status) ? (
                      <CheckCircle className='h-6 w-6 text-green-600' />
                    ) : (
                      <div className='w-3 h-3 rounded-full bg-gray-400'></div>
                    )}
                  </div>
                  <span
                    className={`text-xs text-center font-medium ${
                      isStatusReached(orderData.orderStatus, status)
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {status}
                  </span>
                  {index < arr.length - 1 && (
                    <div
                      className={`h-0.5 w-full mt-6 ${
                        isStatusReached(orderData.orderStatus, arr[index + 1])
                          ? 'bg-green-600'
                          : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Expected Delivery */}
      <Card className='p-6 mb-6 bg-blue-50 border-blue-200'>
        <div className='flex items-center gap-3'>
          <Truck className='h-6 w-6 text-blue-600' />
          <div>
            <p className='font-semibold text-blue-900'>Expected Delivery</p>
            <p className='text-blue-700'>{estimatedDelivery}</p>
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className='flex gap-4'>
        {orderData.orderStatus === 'Pending' && (
          <Button
            variant='destructive'
            className='flex-1'
            disabled={isCancelling}
            onClick={async () => {
              const confirmed = window.confirm(
                'Are you sure you want to cancel this order?'
              );
              if (!confirmed) return;
              setIsCancelling(true);
              try {
                const resp = await updateOrderStatus(orderData.id, 'Canceled');
                if (resp.success) {
                  toast.success(resp.message || 'Order cancelled');
                  setOrderData((prev) =>
                    prev
                      ? {
                          ...prev,
                          orderStatus: resp.data?.orderStatus || 'Canceled',
                        }
                      : prev
                  );
                } else {
                  toast.error(resp.message || 'Failed to cancel order');
                }
              } catch (err) {
                console.error('Error cancelling order:', err);
                toast.error('Failed to cancel order');
              } finally {
                setIsCancelling(false);
              }
            }}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}

        <Button
          variant='outline'
          className='flex-1'
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </div>
      <Footer />
    </div>
  );
}
