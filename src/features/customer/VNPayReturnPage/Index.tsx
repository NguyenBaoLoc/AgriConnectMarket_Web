import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function VNPayReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      // Extract VNPay query parameters
      const responseCode = searchParams.get("vnp_ResponseCode");
      const orderInfo = searchParams.get("vnp_OrderInfo"); // This is the orderCode

      console.log("VNPay Return - ResponseCode:", responseCode);
      console.log("VNPay Return - OrderInfo (orderCode):", orderInfo);
      console.log("VNPay Return - All params:", {
        responseCode,
        orderInfo,
        amount: searchParams.get("vnp_Amount"),
        payDate: searchParams.get("vnp_PayDate"),
        txnRef: searchParams.get("vnp_TxnRef"),
      });

      if (!responseCode || !orderInfo) {
        navigate("/payment-result", {
          state: {
            responseCode: "99",
            orderInfo: "",
          },
        });
        return;
      }

      // Redirect to payment result page
      navigate("/payment-result", {
        state: {
          responseCode,
          orderInfo,
          queryParams: Object.fromEntries(searchParams),
        },
      });
    } catch (error) {
      console.error("VNPay return processing error:", error);
      navigate("/payment-result", {
        state: {
          responseCode: "99",
          orderInfo: "",
        },
      });
    }
  }, [searchParams, navigate]);

  // This page is a redirect page, so nothing is displayed
  // User is immediately redirected to /payment-result
  return null;
}
