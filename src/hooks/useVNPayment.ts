import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOrderByCode } from "../features/customer/CheckoutPage/api";

interface VNPayQueryParams {
  vnp_ResponseCode?: string;
  vnp_OrderInfo?: string;
  vnp_TxnRef?: string;
  [key: string]: string | undefined;
}

export function useVNPayment() {
  const navigate = useNavigate();

  // Extract VNPay query parameters from URL
  const getVNPayQueryParams = useCallback((): VNPayQueryParams => {
    const params = new URLSearchParams(window.location.search);
    const queryParams: VNPayQueryParams = {};

    params.forEach((value, key) => {
      queryParams[key] = value;
    });

    return queryParams;
  }, []);

  // Handle VNPay payment callback
  const handlePaymentCallback = useCallback(
    async (
      onSuccess?: (orderData: any) => void,
      onFailure?: (error: string) => void
    ) => {
      const queryParams = getVNPayQueryParams();
      const responseCode = queryParams.vnp_ResponseCode;
      const orderInfo = queryParams.vnp_OrderInfo;

      if (!responseCode || !orderInfo) {
        return null;
      }

      try {
        // Check if payment was successful (ResponseCode === "00")
        if (responseCode === "00") {
          // Fetch order details using orderCode from vnp_OrderInfo
          const orderResponse = await getOrderByCode(orderInfo);

          if (orderResponse.success && orderResponse.data) {
            // Update order payment status to Completed
            toast.success("Payment successful! Order confirmed.");

            if (onSuccess) {
              onSuccess(orderResponse.data);
            }

            return {
              success: true,
              data: orderResponse.data,
            };
          } else {
            throw new Error(
              orderResponse.message || "Failed to fetch order details"
            );
          }
        } else {
          // Payment failed
          const errorMessage =
            responseCode === "24"
              ? "Transaction was cancelled"
              : "Payment failed. Please try again.";

          toast.error(errorMessage);

          if (onFailure) {
            onFailure(errorMessage);
          }

          return {
            success: false,
            message: errorMessage,
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Payment processing failed";
        console.error("VNPay callback error:", error);
        toast.error(errorMessage);

        if (onFailure) {
          onFailure(errorMessage);
        }

        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [getVNPayQueryParams]
  );

  // Open payment URL in new tab
  const openPaymentURL = useCallback((paymentUrl: string) => {
    if (!paymentUrl) {
      toast.error("Payment URL not found");
      return;
    }

    // Open payment URL in new tab
    const paymentWindow = window.open(paymentUrl, "_blank");

    if (!paymentWindow) {
      toast.error(
        "Unable to open payment gateway. Please check your popup blocker settings."
      );
    } else {
      // Return URL reference for monitoring
      return paymentWindow;
    }
  }, []);

  return {
    getVNPayQueryParams,
    handlePaymentCallback,
    openPaymentURL,
  };
}
