import { ShoppingCart, Heart, Leaf, Calendar, Droplet } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { BuyNowModal } from './BuyNowModal';
import { formatUtcDate } from '../utils/timeUtils';
import { useCart } from '../hooks/useCart';
import { formatVND } from './ui/utils';
import { getAddresses } from '../features/customer/CheckoutPage/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ProductBatch } from '../features/customer/ProductPage/types';

interface ProductBatchCardProps extends ProductBatch {
  onNavigateToProductDetails: (productId: string) => void;
}

export function ProductBatchCard({
  id,
  batchCode,
  product,
  season,
  category,
  farm,
  plantingDate,
  harvestDate,
  totalYield,
  avaibleQuantity,
  price,
  units,
  imageUrls,
  onNavigateToProductDetails,
}: ProductBatchCardProps) {
  const navigate = useNavigate();
  const { handleAddToCart: addToCart } = useCart();
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);

  const handleAddToCart = () => {
    addToCart(id, 1);
  };

  const handleBuyNowClick = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to buy products');
      return;
    }
    setShowBuyNowModal(true);
  };

  const handleBuyNowModalConfirm = async (quantity: number) => {
    try {
      setIsProcessingBuyNow(true);

      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('userId');

      if (!token || !customerId) {
        toast.error('Please login to buy products');
        setShowBuyNowModal(false);
        return;
      }

      // Get user's addresses
      const addressResponse = await getAddresses();
      if (
        !addressResponse.success ||
        !addressResponse.data ||
        addressResponse.data.length === 0
      ) {
        toast.error('Please add a delivery address before purchasing');
        setShowBuyNowModal(false);
        return;
      }

      // Navigate to checkout with the Buy Now product
      // We'll pass the product details via state
      navigate('/checkout', {
        state: {
          isBuyNow: true,
          buyNowProduct: {
            batchId: id,
            quantity: quantity,
            productName: product,
            price: price,
            units: units,
          },
        },
      });

      setShowBuyNowModal(false);
    } catch (error) {
      console.error('Error in Buy Now:', error);
      toast.error('Failed to process Buy Now');
    } finally {
      setIsProcessingBuyNow(false);
    }
  };

  const handleBuyNowModalCancel = () => {
    setShowBuyNowModal(false);
  };

  const defaultImage =
    'https://cms.groupeditors.com/img/ghnw20150817-112916-561.jpg?w=&scale=both&quality=100';
  const imageUrl =
    imageUrls && imageUrls.length > 0 && imageUrls[0]
      ? imageUrls[0]
      : defaultImage;

  const formatDate = (dateString: string) => formatUtcDate(dateString);

  const batchCodeValue =
    typeof batchCode === 'string' ? batchCode : batchCode.value;
  const isOutOfStock = harvestDate !== null && avaibleQuantity === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={batchCodeValue}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
            onClick={() => onNavigateToProductDetails(id)}
          />

          {/* Batch Code Badge */}
          <Badge className="absolute top-3 left-3 bg-blue-600 text-white font-semibold">
            {batchCodeValue}
          </Badge>

          {/* Stock Status */}
          {isOutOfStock ? (
            <Badge className="absolute top-3 right-3 bg-red-600 text-white">
              Out of Stock
            </Badge>
          ) : (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white">
              {avaibleQuantity} {units}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Container */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Header: Product Name & Farm */}
          <div>
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              {product}
            </h3>
            <p className="text-xs text-muted-foreground">📍 {farm}</p>
          </div>

          {/* Season & Dates */}
          <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-md">
            {category && (
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 text-xs font-medium">
                  {category}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Leaf className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Season:</span>
              <span className="text-foreground font-semibold">{season}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">Planted:</span>
              <span className="text-foreground">
                {formatDate(plantingDate)}
              </span>
            </div>
            {harvestDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplet className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium">Harvest:</span>
                <span className="text-foreground">
                  {formatDate(harvestDate)}
                </span>
              </div>
            )}
          </div>

          {/* Yield Info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Yield:</span>
              <span className="font-semibold text-foreground">
                {totalYield.toFixed(1)} {units}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full transition-all"
                style={{
                  width: `${
                    totalYield > 0 ? (avaibleQuantity / totalYield) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Price & Action - Spacer to bottom */}
          <div className="mt-auto pt-3 border-t">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Price per unit</p>
                <span className="text-xl font-bold text-green-700">
                  {formatVND(price)}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 font-medium border-green-600 text-green-600 hover:bg-green-50"
              onClick={handleBuyNowClick}
              disabled={isOutOfStock || isProcessingBuyNow}
            >
              {isProcessingBuyNow ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </CardContent>

      <BuyNowModal
        isOpen={showBuyNowModal}
        productName={product}
        units={units}
        availableQuantity={avaibleQuantity}
        price={price}
        onConfirm={handleBuyNowModalConfirm}
        onCancel={handleBuyNowModalCancel}
      />
    </Card>
  );
}
