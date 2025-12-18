import { ProductCard } from "../../../../components/ProductCard";
import { Button } from "../../../../components/ui/button";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
}

interface CategorySectionProps {
  id: string;
  title: string;
  description: string;
  products: Product[];
  onNavigateToProductDetails: (productId: string) => void;
}

export function CategorySection({ id, title, description, products, onNavigateToProductDetails }: CategorySectionProps) {
  return (
    <section id={id} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-green-900 mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" className="text-green-600 hover:text-green-700">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              unit={product.unit}
              image={product.image}
              badge={product.badge}
              onNavigateToProductDetails={onNavigateToProductDetails!}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
