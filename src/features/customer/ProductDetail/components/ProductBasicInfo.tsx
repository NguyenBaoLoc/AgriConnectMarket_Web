import { useState } from "react";
import { Leaf, Shield, ShoppingCart, Star, Truck, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { verifyCareEvents } from "../api";
import { toast } from "sonner";
import { formatVND } from "../../../../components/ui/utils";
import type { ProductDetail, CareEvent } from "../types";
import { ImageCarousel } from "./ImageCarousel";

interface ProductBasicInfoProps {
  product: ProductDetail;
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleAddToCart: () => Promise<void>;
  onNavigateToTraceability: (careEvents: CareEvent[], errorMessage?: string) => void;
  onNavigateToError: () => void;
  onNavigateToFarmDetail?: (farmId: string) => void;
  isFavorite?: boolean;
  toggleFavorite?: () => void;
  isLoading?: boolean;
}
export function ProductBasicInfo({
  product,
  quantity,
  setQuantity,
  handleAddToCart,
  onNavigateToTraceability,
  onNavigateToError,
  onNavigateToFarmDetail,
  isFavorite,
  toggleFavorite,
  isLoading,
}: ProductBasicInfoProps) {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePreOrder = () => {
    navigate(`/pre-order/${product.id}`);
  };

  const handleViewTraceability = async () => {
    setIsVerifying(true);
    try {
      const response = await verifyCareEvents(product.id);
      if (response.success && response.data && response.data.length > 0) {
        onNavigateToTraceability(response.data);
      } else {
        const errorMessage = response.message || "Failed to verify traceability information";
        toast.error(errorMessage);
        // Navigate to traceability page with empty data and error message instead of error page
        onNavigateToTraceability([], errorMessage);
      }
    } catch (error) {
      console.error("Error verifying care events:", error);
      const errorMessage = "Error verifying traceability information";
      toast.error(errorMessage);
      // Navigate to traceability page with empty data and error message instead of error page
      onNavigateToTraceability([], errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image Carousel */}
      <div>
        <ImageCarousel
          images={product.images || [product.image]}
          productName={product.name}
          
        />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <Badge className="bg-green-100 text-green-800 mb-2">
            {product.category}
          </Badge>
          <h1 className="text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>
          <p className="text-3xl text-green-600">
            {formatVND(product.price)}{" "}
            <span className="text-lg text-muted-foreground">
              / {product.unit}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Leaf className="h-5 w-5 text-green-600" />
            <div className="flex items-center gap-2">
              <span>From {product.farm}</span>
              {product.farmId && onNavigateToFarmDetail && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-green-600 hover:text-green-700"
                  onClick={() => onNavigateToFarmDetail(product.farmId)}
                >
                  View Farm
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5 text-green-600" />
            <span>Free delivery on orders over $50</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-green-600" />
            <span>100% Quality Guarantee</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4"
              >
                -
              </Button>
              <span className="px-6 py-2 border-x">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4"
              >
                +
              </Button>
            </div>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleAddToCart}
              disabled={!product.inStock || isLoading}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            onClick={handlePreOrder}
          >
            <Package className="h-5 w-5 mr-2" />
            Pre-Order
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full border-green-600 text-green-600 hover:bg-green-50"
          onClick={handleViewTraceability}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "View Traceability Information"}
        </Button>

        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm">
            <strong>In Stock:</strong> {product.stock} {product.unit} available
          </p>
        </Card>
      </div>
    </div>
  );
}
