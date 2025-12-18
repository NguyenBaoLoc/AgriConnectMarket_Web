import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  Home,
  Package,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { getOrderByCode } from '../CheckoutPage/api';

interface OrderConfirmationData {
  orderCode: string;
  quantity: number;
  orderDate: string;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  note: string;
  totalPrice: number;
  order?: {
    customerId: string;
    addressId: string;
    orderCode: string;
    totalPrice: number;
    orderDate: string;
    shippingFee: number;
    orderStatus: string;
    orderType: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    customer?: {
      fullname: string;
      email: string;
      phone: string;
    };
    preOrder?: {
      orderId: string;
      batchId: string;
      quantity: number;
      note: string;
      batch?: {
        batchCode: {
          value: string;
        };
        price: number;
        units: string;
        harvestDate: string;
      };
    };
  };
}

export function PreOrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderCode } = useParams<{ orderCode: string }>();
  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderCode) {
        setError('No order code provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getOrderByCode(orderCode);
        if (response.success && response.data) {
          setOrderData(response.data);
        } else {
          setError(response.message || 'Failed to load order details');
          toast.error(response.message || 'Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Error loading order confirmation');
        toast.error('Error loading order confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderCode]);

  const handleBackHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-lg">
            {error || 'Order confirmation not found'}
          </p>
          <Button
            onClick={handleBackHome}
            className="bg-green-600 hover:bg-green-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const batchCode = orderData.order?.preOrder?.batch?.batchCode?.value || 'N/A';
  const quantity = orderData.order?.preOrder?.quantity || orderData.quantity;
  const price = orderData.order?.preOrder?.batch?.price || 0;
  const units = orderData.order?.preOrder?.batch?.units || '';
  const harvestDate = orderData.order?.preOrder?.batch?.harvestDate || '';
  const totalPrice = orderData.order?.totalPrice || orderData.totalPrice;
  const customerName = orderData.order?.customer?.fullname || 'Customer';
  const customerEmail = orderData.order?.customer?.email || '';
  const customerPhone = orderData.order?.customer?.phone || '';

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Pre-Order Successfully!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your pre-order has been successfully created
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Main Confirmation Card */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            {/* Order Code */}
            <div className="mb-8 pb-8 border-b">
              <h2 className="text-sm text-muted-foreground mb-2">ORDER CODE</h2>
              <p className="text-3xl font-bold text-gray-900">
                {orderData.orderCode}
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b">
              {/* Order Date */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">
                    Order Date
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(orderData.orderDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Order Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {orderData.orderStatus}
                </Badge>
              </div>

              {/* Harvest Date */}
              {harvestDate && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Harvest Date
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(harvestDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Payment Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">
                    Payment Status
                  </span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {orderData.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleBackHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={handleViewOrders}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </div>
          </Card>
        </div>

        {/* Customer Info Card */}
        <div>
          <Card className="p-6">
            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>Your pre-order is created and waiting for approving</li>
                <li>You'll receive an email from the system</li>
                <li>Payment will be collected upon delivery</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
