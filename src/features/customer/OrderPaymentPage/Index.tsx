import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { useVNPayment } from "../../../hooks/useVNPayment";

interface PaymentPageState {
  orderCode?: string;
  orderData?: any;
}

export function OrderPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getVNPayQueryParams } = useVNPayment();

  const state = (location.state as PaymentPageState) || {};

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Check if there are VNPay query parameters (callback from payment gateway)
        const queryParams = getVNPayQueryParams();
        const responseCode = queryParams.vnp_ResponseCode;
        const orderInfo = queryParams.vnp_OrderInfo; // orderCode from VNPay

        console.log("VNPay query params:", queryParams);
        console.log("ResponseCode:", responseCode);
        console.log("OrderInfo (orderCode):", orderInfo);

        if (responseCode) {
          // Payment callback received from VNPay
          // Navigate to payment result page with the response
          navigate("/payment-result", {
            state: {
              responseCode,
              orderInfo,
              queryParams,
            },
          });
        }
        // If no callback yet, just show the processing message
      } catch (error) {
        console.error("Payment processing error:", error);
      }
    };

    processPayment();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-4">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600 text-sm">
              Please wait while we process your payment. Do not close this
              window.
            </p>
          </div>
          {state.orderCode && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              Order Code: <span className="font-mono">{state.orderCode}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
