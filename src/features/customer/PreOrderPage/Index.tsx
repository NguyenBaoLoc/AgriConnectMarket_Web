import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, ShoppingCart, FileText, Leaf, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { getProductBatchDetail } from '../../farmer/ProductBatchDetail/api';
import { getAddressesMe, type AddressItem } from '../Addresses/api';
import { createPreOrder } from './api';
import type { ProductBatchDetail } from '../../farmer/ProductBatchDetail/types';

export function PreOrderPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<ProductBatchDetail | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);

        // Fetch batch details
        const batchResponse = await getProductBatchDetail(batchId);
        if (batchResponse.success && batchResponse.data) {
          setBatch(batchResponse.data);
        } else {
          toast.error(batchResponse.message || 'Failed to load batch details');
          navigate(-1);
          return;
        }

        // Fetch addresses
        const addressResponse = await getAddressesMe();
        if (addressResponse.success && addressResponse.data) {
          setAddresses(addressResponse.data);
          // Set default address
          const defaultAddress = addressResponse.data.find(
            (addr) => addr.isDefault
          );
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (addressResponse.data.length > 0) {
            setSelectedAddressId(addressResponse.data[0].id);
          }
        } else {
          toast.error('Failed to load addresses');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading page');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [batchId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!batch) {
      toast.error('Batch information not loaded');
      return;
    }

    if (quantity > batch.availableQuantity) {
      toast.error(
        `Quantity cannot exceed available stock (${batch.availableQuantity})`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const customerId = localStorage.getItem('userId');

      if (!customerId) {
        toast.error('User not authenticated');
        navigate('/auth');
        return;
      }

      const response = await createPreOrder({
        customerId,
        addressId: selectedAddressId,
        batchId,
        quantity,
        note,
      });

      if (response.success) {
        toast.success('Pre-order created successfully');
        navigate(`/pre-order-confirmation/${response.data.orderCode}`);
      } else {
        toast.error(response.message || 'Failed to create pre-order');
      }
    } catch (error) {
      console.error('Error creating pre-order:', error);
      toast.error('Error creating pre-order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="mb-6 hover:bg-white/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground text-lg">Loading batch details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="mb-6 hover:bg-white/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center h-64">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 text-xl font-semibold">Batch not found</p>
              <p className="text-muted-foreground mt-2">The requested batch could not be loaded</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = quantity * Number(batch.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="mb-4 hover:bg-white/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Pre-Order</h1>
              <p className="text-muted-foreground">Secure your fresh produce in advance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Batch Card */}
            <Card className="overflow-hidden border-2 border-green-100 shadow-xl">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="h-5 w-5" />
                      <span className="text-green-100 text-sm font-medium">Fresh & Organic</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">
                      {batch.season?.product?.productName}
                    </h2>
                    <p className="text-green-100 text-sm">
                      Batch Code: <span className="font-semibold">{batch.batchCode.value}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{Number(batch.price).toLocaleString('vi-VN')}₫</div>
                    <div className="text-green-100 text-sm">per {batch.units}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <Package className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Available</p>
                    <p className="text-lg font-bold text-gray-900">
                      {batch.availableQuantity}
                    </p>
                    <p className="text-xs text-green-600">{batch.units}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Harvest Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(batch.harvestDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Quality</p>
                    <p className="text-sm font-bold text-gray-900">Premium</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <Leaf className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Organic</p>
                    <p className="text-sm font-bold text-gray-900">Certified</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Form Card */}
            <Card className="p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <Label htmlFor="address" className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Delivery Address *
                    </Label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                    >
                      <SelectTrigger id="address" className="h-12 text-base border-2 focus:border-green-500">
                        <SelectValue placeholder="Select a delivery address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id} className="text-base py-3">
                            {address.province}, {address.district}, {address.ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addresses.length === 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ No addresses found. Please add an address first.
                        </p>
                      </div>
                    )}
                    {selectedAddressId && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-100">
                        {addresses.find((a) => a.id === selectedAddressId) && (
                          <div className="space-y-1">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-gray-900">
                                  {addresses.find((a) => a.id === selectedAddressId)?.province}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {addresses.find((a) => a.id === selectedAddressId)?.ward},{' '}
                                  {addresses.find((a) => a.id === selectedAddressId)?.district}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {addresses.find((a) => a.id === selectedAddressId)?.detail}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="quantity"
                      className="flex items-center gap-2 text-base font-semibold text-gray-900"
                    >
                      <Package className="h-4 w-4 text-green-600" />
                      Quantity ({batch.units}) *
                    </Label>
                    <div className="relative">
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={batch.availableQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder="Enter quantity"
                        className="h-14 text-lg font-semibold border-2 focus:border-green-500 pr-24"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {batch.units}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">
                        Max available: <span className="font-semibold text-gray-900">{batch.availableQuantity}</span> {batch.units}
                      </p>
                      {quantity > 0 && (
                        <p className="text-green-600 font-semibold">
                          Subtotal: {totalAmount.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="space-y-3">
                    <Label htmlFor="note" className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <FileText className="h-4 w-4 text-green-600" />
                      Special Notes (Optional)
                    </Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add any special requests or notes for the farmer..."
                      rows={4}
                      className="border-2 focus:border-green-500 resize-none"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1 h-14 text-base border-2 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedAddressId || quantity <= 0}
                      className="flex-1 h-14 text-base bg-green-600 hover:bg-green-400 shadow-lg hover:shadow-xl "
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Pre-Order...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Create Pre-Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* Right side - Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card className="p-6 shadow-xl border-2 border-green-100 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span className="font-semibold text-gray-900">
                      {quantity > 0 ? quantity : 0} {batch.units}
                    </span>
                  </div>
                  <div className="h-px bg-gray-300" />
                </div>

                {/* Info Alert */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">ℹ</div>
                    Pre-Order Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Your order will be confirmed by the farmer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Payment upon delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Fresh from the farm to your door</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Farm Information Card */}
            {batch.season?.farm && (
              <Card className="p-6 shadow-xl border-2 border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-green-600" />
                  </div>
                  Farm Information
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Farm Name</p>
                        <p className="font-bold text-lg text-gray-900">{batch.season.farm.farmName}</p>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Area</p>
                        <p className="font-semibold text-gray-900">{batch.season.farm.area}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Contact</p>
                        <p className="font-semibold text-gray-900">{batch.season.farm.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
