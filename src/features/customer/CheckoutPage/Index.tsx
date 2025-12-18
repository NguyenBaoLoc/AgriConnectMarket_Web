import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { ArrowLeft, Building2, MapPin, Loader } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../CartPage/api";
import { Footer } from "../components";
import { formatVND } from "../../../components/ui/utils";
import {
  getAddresses,
  getShippingFee,
  createOrder,
  initiatePayment,
} from "./api";
import { useVNPayment } from "../../../hooks/useVNPayment";
import type { CartData } from "../CartPage/types";
import type { Address, FarmShippingFee } from "./types";

interface CheckoutPageProps {
  onBack: () => void;
}

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { openPaymentURL } = useVNPayment();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [farmShippingFees, setFarmShippingFees] = useState<
    Map<string, FarmShippingFee>
  >(new Map());
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Load cart and addresses on mount
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        const cartResponse = await getCartItems();
        if (cartResponse.success && cartResponse.data) {
          setCartData(cartResponse.data);
        } else {
          toast.error(cartResponse.message || "Failed to load cart");
          navigate("/cart");
          return;
        }

        const addressResponse = await getAddresses();
        if (addressResponse.success && addressResponse.data) {
          setAddresses(addressResponse.data);
          if (addressResponse.data.length > 0) {
            setSelectedAddressId(addressResponse.data[0].id);
          }
        } else {
          toast.error(addressResponse.message || "Failed to load addresses");
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Failed to load checkout data");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [navigate]);

  // Calculate shipping fees when address changes or cart updates
  useEffect(() => {
    if (cartData && selectedAddressId) {
      calculateShippingFees();
    }
  }, [selectedAddressId, cartData]);

  const calculateShippingFees = async () => {
    if (!cartData || !selectedAddressId) return;

    setCalculatingShipping(true);
    const newFees = new Map<string, FarmShippingFee>();

    try {
      for (const farm of cartData.cartItems) {
        // Calculate total weight (quantity) for this farm
        const totalWeight = farm.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        newFees.set(farm.farmId, {
          farmId: farm.farmId,
          farmName: farm.farmName,
          fee: 0,
          isLoading: true,
          error: null,
        });

        try {
          const feeResponse = await getShippingFee(
            farm.farmId,
            selectedAddressId,
            totalWeight
          );

          if (feeResponse.success && feeResponse.data !== undefined) {
            newFees.set(farm.farmId, {
              farmId: farm.farmId,
              farmName: farm.farmName,
              fee: feeResponse.data,
              isLoading: false,
              error: null,
            });
          } else {
            newFees.set(farm.farmId, {
              farmId: farm.farmId,
              farmName: farm.farmName,
              fee: 0,
              isLoading: false,
              error: feeResponse.message || "Failed to calculate shipping fee",
            });
          }
        } catch (error) {
          console.error(
            `Error calculating shipping fee for farm ${farm.farmId}:`,
            error
          );
          newFees.set(farm.farmId, {
            farmId: farm.farmId,
            farmName: farm.farmName,
            fee: 0,
            isLoading: false,
            error: "Failed to calculate shipping fee",
          });
        }
      }

      setFarmShippingFees(newFees);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const getTotalShippingFee = () => {
    let total = 0;
    farmShippingFees.forEach((farm) => {
      total += farm.fee;
    });
    return total;
  };

  const getTotalPrice = () => {
    const subtotal = cartData?.totalPrice || 0;
    const shipping = getTotalShippingFee();
    return subtotal + shipping;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setSubmittingOrder(true);

    try {
      const customerId = localStorage.getItem("userId");
      if (!customerId) {
        toast.error("User ID not found. Please login again.");
        setSubmittingOrder(false);
        return;
      }

      // Generate order code
      const orderCode = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      // Calculate total shipping fee
      const totalShippingFee = getTotalShippingFee();

      // Map payment method to API value
      const paymentMethodValue =
        paymentMethod === "bank" ? "Bank Transfer (VNPay)" : "Cash on Delivery";

      // Prepare order items
      const orderItems = cartData!.cartItems.flatMap((farm) =>
        farm.items.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
        }))
      );

      // Prepare order payload
      const orderPayload = {
        customerId,
        addressId: selectedAddressId,
        orderCode,
        orderDate: new Date().toISOString(),
        orderType: "order",
        shippingFee: totalShippingFee,
        paymentMethod: paymentMethodValue,
        orderItems,
      };

      console.log("Creating order with payload:", orderPayload);

      // Call create order API
      const response = await createOrder(orderPayload);

      console.log("Create order response:", response);

      if (response.success && response.data) {
        const orderData = response.data as any;

        // If payment method is Bank Transfer (VNPay), initiate payment
        if (paymentMethod === "bank") {
          try {
            // Try different possible field names for order ID
            const orderId = orderData.orderId;
            console.log("Using orderId:", orderId);
            const paymentResponse = await initiatePayment(orderId);

            console.log("Payment response:", paymentResponse);

            if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
              // Store order code in session storage for verification
              sessionStorage.setItem("vnp_orderCode", orderData.orderCode);

              // Open payment URL in new tab
              openPaymentURL(paymentResponse.data.paymentUrl);

              // Navigate current tab to order-payment with processing state
              navigate("/order-payment", {
                state: {
                  orderCode: orderData.orderCode,
                  orderData: orderData,
                },
              });
            } else {
              toast.error(
                paymentResponse.message || "Failed to initiate payment"
              );
            }
          } catch (paymentError) {
            console.error("Error initiating payment:", paymentError);
            toast.error("Failed to initiate payment. Please try again.");
          }
        } else {
          // For Cash on Delivery, navigate directly to order confirmation
          toast.success("Order placed successfully!");
          navigate("/order-confirmation", {
            state: {
              orderId: orderData.orderId,
              orderCode: orderData.orderCode,
              orderDate: orderData.orderDate,
              totalPrice: orderData.totalPrice,
              shippingFee: orderData.shippingFee,
              customerName: orderData.customer?.fullname || "Customer",
              customerEmail: orderData.customer?.email || "",
              customerPhone: orderData.customer?.phone || "",
              orderStatus: orderData.orderStatus || "Pending",
              paymentStatus: orderData.paymentStatus || "Pending",
              paymentMethod: orderData.paymentMethod || "Cash on Delivery",
              shippingAddress: {
                detail: orderData.address?.detail || "",
                ward: orderData.address?.ward || "",
                district: orderData.address?.district || "",
                province: orderData.address?.province || "",
              },
              orderItems: orderData.orderItems || [],
            },
          });
        }
      } else {
        toast.error(response.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Cart data not found</p>
          <Button onClick={onBack}>Back to Cart</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h2>Delivery Address</h2>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No delivery addresses found
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Add New Address
                  </Button>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                >
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="cursor-pointer flex-1 flex items-center gap-3"
                        >
                          <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {address.detail}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added on{" "}
                              {new Date(address.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </Card>

            {/* Shipping Fees Overview */}
            {selectedAddressId && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Loader className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Shipping Fees by Farm
                  </h3>
                </div>

                {calculatingShipping ? (
                  <div className="text-center py-4">
                    <Loader className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-700">
                      Calculating shipping fees...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartData.cartItems.map((farm) => {
                      const feeData = farmShippingFees.get(farm.farmId);
                      console.log("Rendering shipping fee for farm:", feeData);
                      return (
                        <div
                          key={farm.farmId}
                          className="flex justify-between items-center p-2 bg-white rounded border border-blue-100"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {farm.farmName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {farm.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}{" "}
                              items
                            </p>
                          </div>
                          <div className="text-right">
                            {feeData?.isLoading ? (
                              <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            ) : feeData?.error ? (
                              <span className="text-xs text-red-600">
                                Error
                              </span>
                            ) : (
                              <p className="font-semibold text-gray-900">
                                {formatVND(feeData?.fee || 0)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="mb-4">Payment Method</h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label
                    htmlFor="bank"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <span>Bank Transfer (VNPay)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-600 cursor-pointer">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label
                    htmlFor="cod"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span>Cash on Delivery</span>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="mb-4 font-semibold">Order Summary</h3>

              {/* Items by Farm */}
              <div className="space-y-4 mb-4 pb-4 border-b border-gray-200">
                {cartData.cartItems.map((farm) => (
                  <div key={farm.farmId}>
                    <p className="text-sm font-medium text-green-600 mb-2">
                      {farm.farmName}
                    </p>
                    <div className="space-y-1 ml-2">
                      {farm.items.map((item) => (
                        <div
                          key={item.itemId}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-600">
                            {item.productName} x {item.quantity}
                          </span>
                          <span className="text-gray-900">
                            {formatVND(item.itemPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatVND(cartData?.totalPrice || 0)}
                  </span>
                </div>

                {/* Shipping Fees */}
                {cartData.cartItems.map((farm) => {
                  const feeData = farmShippingFees.get(farm.farmId);
                  return (
                    <div
                      key={farm.farmId}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-gray-600">
                        Shipping ({farm.farmName})
                      </span>
                      <span className="text-gray-900">
                        {feeData?.isLoading ? (
                          <Loader className="h-3 w-3 animate-spin inline" />
                        ) : (
                          formatVND(feeData?.fee || 0)
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatVND(getTotalPrice())}
                </span>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={
                  calculatingShipping || !selectedAddressId || submittingOrder
                }
              >
                {submittingOrder ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Creating Order...
                  </>
                ) : calculatingShipping ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to our terms and conditions
              </p>

              {/* Customer Info Display */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="text-xs">
                  <p className="text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">
                    {cartData.fullname}
                  </p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {cartData.email}
                  </p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{cartData.phone}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
