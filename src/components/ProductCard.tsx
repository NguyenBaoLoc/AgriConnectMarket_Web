import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useCart } from "../hooks/useCart";
import { formatVND } from "./ui/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
  onNavigateToProductDetails: (productId: string) => void;
}

export function ProductCard({ id, name, price, unit, image, badge, onNavigateToProductDetails }: ProductCardProps) {
  const { handleAddToCart: addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(id, 1);
  };

  const defaultImage = "https://images.unsplash.com/photo-1565032156168-0a22e5b8374f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllc3xlbnwxfHx8fDE3NTk5NTE4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  const imageUrl = typeof image === "string" && image.trim() ? image : defaultImage;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
            onClick={() => onNavigateToProductDetails(id)}
          />
          {badge && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white">
              {badge}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{unit}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-700">{formatVND(price)}</span>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
