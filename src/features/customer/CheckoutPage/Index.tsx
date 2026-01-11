import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Loader,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCartItems } from '../CartPage/api';
import { Footer } from '../components';
import { formatVND } from '../../../components/ui/utils';
import {
  getAddresses,
  getShippingFee,
  createOrder,
  initiatePayment,
} from './api';
import { useVNPayment } from '../../../hooks/useVNPayment';
import type { CartData } from '../CartPage/types';
import type { Address, FarmShippingFee } from './types';
import { formatUtcDate } from '../../../utils/timeUtils';

interface CheckoutPageProps {
  onBack: () => void;
}

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openPaymentURL } = useVNPayment();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [filteredCartData, setFilteredCartData] = useState<CartData | null>(
    null
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [farmShippingFees, setFarmShippingFees] = useState<
    Map<string, FarmShippingFee>
  >(new Map());
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Get selected item IDs from location state
  const selectedItemIds = (location.state as any)?.selectedItemIds as
    | string[]
    | undefined;

  // Get Buy Now product from location state
  const isBuyNow = (location.state as any)?.isBuyNow as boolean | undefined;
  const buyNowProduct = (location.state as any)?.buyNowProduct as
    | any
    | undefined;

  // Load cart and addresses on mount
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);

        // If this is a Buy Now flow, create synthetic cart data
        if (isBuyNow && buyNowProduct) {
          // Create a synthetic CartData object from the Buy Now product
          const syntheticCartData: CartData = {
            cartId: 'buynow-' + Date.now(),
            totalPrice: buyNowProduct.price * buyNowProduct.quantity,
            fullname: '',
            email: '',
            phone: '',
            cartItems: [
              {
                farmId: 'unknown',
                farmName: 'Farm',
                items: [
                  {
                    itemId: 'buynow-' + buyNowProduct.batchId,
                    batchId: buyNowProduct.batchId,
                    batchCode: buyNowProduct.batchId,
                    batchImageUrls: [],
                    productName: buyNowProduct.productName,
                    categoryName: '',
                    seasonName: '',
                    batchPrice: buyNowProduct.price,
                    quantity: buyNowProduct.quantity,
                    units: buyNowProduct.units,
                    itemPrice: buyNowProduct.price * buyNowProduct.quantity,
                    seasonStatus: '',
                  },
                ],
              },
            ],
          };
          setCartData(syntheticCartData);
        } else {
          // Normal flow: load cart from API
          const cartResponse = await getCartItems();
          if (cartResponse.success && cartResponse.data) {
            setCartData(cartResponse.data);
          } else {
            toast.error(cartResponse.message || 'Failed to load cart');
            navigate('/cart');
            return;
          }
        }

        const addressResponse = await getAddresses();
        if (addressResponse.success && addressResponse.data) {
          setAddresses(addressResponse.data);
          if (addressResponse.data.length > 0) {
            setSelectedAddressId(addressResponse.data[0].id);
          }
        } else {
          toast.error(addressResponse.message || 'Failed to load addresses');
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        toast.error('Failed to load checkout data');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [navigate, isBuyNow, buyNowProduct]);

  // Filter cart data based on selected items from cart page
  useEffect(() => {
    if (!cartData) return;

    // If no selected items provided, show all items (backward compatibility)
    if (!selectedItemIds || selectedItemIds.length === 0) {
      setFilteredCartData(cartData);
      return;
    }

    const selectedItemSet = new Set(selectedItemIds);

    // Filter cart items to only include selected items
    const filteredItems = cartData.cartItems
      .map((farm) => ({
        ...farm,
        items: farm.items.filter((item) => selectedItemSet.has(item.itemId)),
      }))
      .filter((farm) => farm.items.length > 0);

    // Calculate filtered total price
    const filteredTotalPrice = filteredItems.reduce(
      (total, farm) =>
        total +
        farm.items.reduce((farmTotal, item) => farmTotal + item.itemPrice, 0),
      0
    );

    setFilteredCartData({
      ...cartData,
      cartItems: filteredItems,
      totalPrice: filteredTotalPrice,
    });
  }, [cartData, selectedItemIds]); // Calculate shipping fees when address changes or cart updates
  useEffect(() => {
    if (filteredCartData && selectedAddressId) {
      calculateShippingFees();
    }
  }, [selectedAddressId, filteredCartData]);

  const calculateShippingFees = async () => {
    if (!filteredCartData || !selectedAddressId) return;

    setCalculatingShipping(true);
    const newFees = new Map<string, FarmShippingFee>();

    try {
      for (const farm of filteredCartData.cartItems) {
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
              error: feeResponse.message || 'Failed to calculate shipping fee',
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
            error: 'Failed to calculate shipping fee',
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
    const subtotal = filteredCartData?.totalPrice || 0;
    const shipping = getTotalShippingFee();
    return subtotal + shipping;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setSubmittingOrder(true);

    try {
      const customerId = localStorage.getItem('userId');
      if (!customerId) {
        toast.error('User ID not found. Please login again.');
        setSubmittingOrder(false);
        return;
      }

      // Map payment method to API value
      const paymentMethodValue =
        paymentMethod === 'bank' ? 'Bank Transfer (VNPay)' : 'Cash on Delivery';

      // Create orders for each farm separately
      const createdOrders: any[] = [];
      const totalShippingFee = getTotalShippingFee();

      for (const farm of filteredCartData!.cartItems) {
        try {
          // Generate unique order code for each farm
          const orderCode = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

          // Get shipping fee for this farm
          const farmShippingFee = farmShippingFees.get(farm.farmId)?.fee || 0;

          // Prepare order items for this farm
          const orderItems = farm.items.map((item) => ({
            batchId: item.batchId,
            quantity: item.quantity,
          }));

          // Calculate total price for this farm
          const farmTotal = farm.items.reduce(
            (sum, item) => sum + item.itemPrice,
            0
          );

          // Prepare order payload for this farm
          const orderPayload = {
            customerId,
            addressId: selectedAddressId,
            orderCode,
            orderDate: new Date().toISOString(),
            orderType: 'order',
            shippingFee: farmShippingFee,
            paymentMethod: paymentMethodValue,
            orderItems,
          };

          console.log(`Creating order for farm ${farm.farmId}:`, orderPayload);

          // Call create order API for this farm
          const response = await createOrder(orderPayload);

          console.log(`Order response for farm ${farm.farmId}:`, response);

          if (response.success && response.data) {
            createdOrders.push({
              ...response.data,
              farmId: farm.farmId,
              farmName: farm.farmName,
            });
          } else {
            toast.error(
              `Failed to create order for ${farm.farmName}: ${response.message}`
            );
            setSubmittingOrder(false);
            return;
          }
        } catch (error) {
          console.error(`Error creating order for farm ${farm.farmId}:`, error);
          toast.error(`Failed to create order for ${farm.farmName}`);
          setSubmittingOrder(false);
          return;
        }
      }

      // All orders created successfully
      if (createdOrders.length > 0) {
        const firstOrder = createdOrders[0];

        // If payment method is Bank Transfer (VNPay), initiate payment for the first order
        if (paymentMethod === 'bank') {
          try {
            // Use the first order ID for payment initiation
            const orderIds = createdOrders.map((item) => item.orderId);
            console.log('Using orderId for payment:', orderIds);
            const paymentResponse = await initiatePayment(orderIds);

            console.log('Payment response:', paymentResponse);

            if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
              // Store all order codes in comma-separated string for verification
              // Each order code format: "ORD-{timestamp}-{random}"
              const orderCodesString = createdOrders
                .map((o) => o.orderCode)
                .join(',');
              sessionStorage.setItem('vnp_orderCodes', orderCodesString);

              // Open payment URL in new tab
              openPaymentURL(paymentResponse.data.paymentUrl);

              // Navigate current tab to order-payment with processing state
              navigate('/order-payment', {
                state: {
                  orderCode: orderCodesString,
                  orderCodes: createdOrders.map((o) => o.orderCode),
                  orderData: firstOrder,
                  allOrders: createdOrders,
                },
              });
            } else {
              toast.error(
                paymentResponse.message || 'Failed to initiate payment'
              );
            }
          } catch (paymentError) {
            console.error('Error initiating payment:', paymentError);
            toast.error('Failed to initiate payment. Please try again.');
          }
        } else {
          // For Cash on Delivery, navigate directly to order confirmation
          toast.success('Orders placed successfully!');
          navigate('/order-confirmation', {
            state: {
              orderId: firstOrder.id,
              orderCode: firstOrder.orderCode,
              orderDate: firstOrder.orderDate,
              totalPrice: createdOrders.reduce(
                (sum, order) => sum + order.totalPrice,
                0
              ),
              shippingFee: createdOrders.reduce(
                (sum, order) => sum + order.shippingFee,
                0
              ),
              customerName: firstOrder.customer?.fullname || 'Customer',
              customerEmail: firstOrder.customer?.email || '',
              customerPhone: firstOrder.customer?.phone || '',
              orderStatus: firstOrder.orderStatus || 'Pending',
              paymentStatus: firstOrder.paymentStatus || 'Pending',
              paymentMethod: firstOrder.paymentMethod || 'Cash on Delivery',
              shippingAddress: {
                detail: firstOrder.address?.detail || '',
                ward: firstOrder.address?.ward || '',
                district: firstOrder.address?.district || '',
                province: firstOrder.address?.province || '',
              },
              orderItems: createdOrders.flatMap((o) => o.orderItems || []),
              allOrders: createdOrders,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error placing orders:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to place orders';
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

  if (!filteredCartData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No items selected in your cart</p>
          <Button onClick={onBack}>Back to Cart</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-green-500">Checkout</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Summary</p>
              <p className="text-2xl font-bold text-green-600">
                {formatVND(getTotalPrice())}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Section */}
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Items
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredCartData?.cartItems.reduce(
                      (total, farm) => total + farm.items.length,
                      0
                    )}{' '}
                    items from {filteredCartData?.cartItems.length || 0} farm
                    {(filteredCartData?.cartItems.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Items by Farm */}
              <div className="space-y-6">
                {filteredCartData?.cartItems.map((farm) => (
                  <div key={farm.farmId}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-100">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900">
                        {farm.farmName}
                      </h3>
                    </div>
                    <div className="space-y-3 pl-4">
                      {farm.items.map((item) => (
                        <div
                          key={item.itemId}
                          className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.batchImageUrls.length > 0 ? (
                              <img
                                src={item.batchImageUrls[0]}
                                alt={item.productName}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.productName}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {item.categoryName} • {item.seasonName}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              Batch: {item.batchCode}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">
                                  {formatVND(item.batchPrice)} / {item.units}
                                </p>
                                <p className="text-xs font-medium text-green-600 mt-1">
                                  Qty: {item.quantity} {item.units}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">
                                  Subtotal
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatVND(item.itemPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Address Section */}
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-600">
                    Select where to deliver
                  </p>
                </div>
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
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                          selectedAddressId === address.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="cursor-pointer flex-1 flex items-center gap-3"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {address.detail}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added on {formatUtcDate(address.createdAt)}
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
              <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-200">
                  <div className="p-3 bg-white rounded-lg">
                    <Loader className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">
                    Shipping Information
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
                  <div className="space-y-3">
                    {filteredCartData?.cartItems.map((farm) => {
                      const feeData = farmShippingFees.get(farm.farmId);
                      return (
                        <div
                          key={farm.farmId}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100 hover:shadow-sm transition"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {farm.farmName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {farm.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}{' '}
                              items -{' '}
                              {farm.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}{' '}
                              kg
                            </p>
                          </div>
                          <div className="text-right">
                            {feeData?.isLoading ? (
                              <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            ) : feeData?.error ? (
                              <span className="text-xs text-red-600 font-medium">
                                Error
                              </span>
                            ) : (
                              <p className="font-bold text-gray-900 text-lg">
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
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-600">Choose how to pay</p>
                </div>
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <RadioGroupItem value="bank" id="bank" />
                  <Label
                    htmlFor="bank"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Bank Transfer (VNPay)
                      </p>
                      <p className="text-xs text-gray-600">
                        Pay securely online
                      </p>
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <Label
                    htmlFor="cod"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-lg">💰</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-600">
                        Pay when you receive
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Sidebar - Order Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Summary Card */}
              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  Price Summary
                </h3>

                {/* Subtotal */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatVND(filteredCartData?.totalPrice || 0)}
                    </span>
                  </div>

                  {/* Shipping Fees */}
                  {filteredCartData?.cartItems.map((farm) => {
                    const feeData = farmShippingFees.get(farm.farmId);
                    return (
                      <div
                        key={farm.farmId}
                        className="flex justify-between items-center text-sm"
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
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatVND(getTotalPrice())}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {cartData.fullname}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 text-sm break-all">
                      {cartData.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {cartData.phone}
                    </p>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-base rounded-lg"
                  onClick={handleSubmit}
                  disabled={
                    calculatingShipping || !selectedAddressId || submittingOrder
                  }
                >
                  {submittingOrder ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Creating Order...
                    </>
                  ) : calculatingShipping ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By placing your order, you agree to our{' '}
                  <a href="#" className="text-green-600 hover:underline">
                    terms and conditions
                  </a>
                </p>
              </Card>

              {/* Security Info */}
              <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      Money-back Guarantee
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
