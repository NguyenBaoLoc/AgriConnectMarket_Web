import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { getOrderByCode } from '../CheckoutPage/api';

interface PaymentResultState {
  responseCode: string;
  orderInfo: string;
  queryParams?: any;
}

export function PaymentResultPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<
    'processing' | 'success' | 'failed'
  >('processing');
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const errorMessage = search.get('errorMessage');

        if (errorMessage) {
          setPaymentStatus('failed');
          setErrorMessage(errorMessage);
          return;
        }

        const responseCode = search.get('responseCode');
        const orderInfo = search.get('orderCode');

        if (responseCode === '00') {
          // Payment successful - fetch order details for all orders
          try {
            // Parse multiple order codes from plain string
            // Order codes format: "ORD-{timestamp}-{random}ORD-{timestamp}-{random}..."
            // Split by "ORD-" to identify each order code
            const orderCodeParts = orderInfo
              .split('ORD-')
              .filter((part: string) => part.length > 0);
            const orderCodeList = orderCodeParts.map(
              (part: string) => `ORD-${part}`
            );

            console.log('Processing order codes:', orderCodeList);

            if (orderCodeList.length === 0) {
              setPaymentStatus('failed');
              setErrorMessage('No valid order codes found');
              return;
            }

            // Fetch order details for each order code
            const allOrderDetails: any[] = [];
            for (const orderCode of orderCodeList) {
              try {
                console.log(`Fetching order details for: ${orderCode}`);
                const orderResponse = await getOrderByCode(orderCode);
                console.log(`Order response for ${orderCode}:`, orderResponse);

                const orderData = orderResponse?.data || orderResponse;

                if (orderData && (orderData.orderCode || orderData.id)) {
                  allOrderDetails.push(orderData);
                } else {
                  console.warn(
                    `Invalid or missing order data for code: ${orderCode}`
                  );
                }
              } catch (error) {
                console.error(
                  `Error fetching order details for ${orderCode}:`,
                  error
                );
              }
            }

            if (allOrderDetails.length > 0) {
              setPaymentStatus('success');
              setOrderDetails(allOrderDetails);
            } else {
              setPaymentStatus('failed');
              setErrorMessage('Could not fetch order details');
            }
          } catch (error) {
            setPaymentStatus('failed');
            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'Failed to fetch order details'
            );
          }
        } else {
          // Payment failed
          setPaymentStatus('failed');
          const errorMessages: { [key: string]: string } = {
            '01': 'Bank account / card invalid',
            '02': 'Bank account / card is locked',
            '03': 'Bank account / card is closed',
            '04': 'Transaction declined',
            '24': 'Transaction cancelled',
            '99': 'Other errors',
          };
          setErrorMessage(
            errorMessages[responseCode] ||
              `Payment failed with code: ${responseCode}`
          );
        }
      } catch (error) {
        console.error('Payment result processing error:', error);
        setPaymentStatus('failed');
        setErrorMessage(
          error instanceof Error ? error.message : 'Payment processing failed'
        );
      }
    };

    processPaymentResult();
  }, [search]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/checkout');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        {paymentStatus === 'processing' && (
          <div className="text-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600 text-sm">
                Please wait while we verify your payment...
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 text-sm">
                Your payment has been processed successfully.
                {orderDetails.length > 1 &&
                  ` ${orderDetails.length} orders have been created.`}
              </p>
            </div>

            {orderDetails.length > 0 && (
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                {orderDetails.map((order, index) => (
                  <div
                    key={order.id || index}
                    className="p-3 bg-green-50 rounded text-sm space-y-2 border border-green-200"
                  >
                    <div className="font-semibold text-green-700 mb-2">
                      Order {index + 1}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Order Code:</span>
                      <span className="font-mono font-semibold">
                        {order.orderCode}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-green-600">
                        ₫{order.totalPrice?.toLocaleString('vi-VN') || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-blue-600">
                        {order.orderStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackToHome}
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 text-sm">
                {errorMessage || 'Your payment could not be processed.'}
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleTryAgain}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBackToHome}
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
