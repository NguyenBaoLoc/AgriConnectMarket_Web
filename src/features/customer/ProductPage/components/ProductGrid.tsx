import { ProductBatchCard } from '../../../../components/ProductBatchCard';
import { Button } from '../../../../components/ui/button';
import type { ProductBatch } from '../types';

interface ProductGridProps {
  filteredProducts: ProductBatch[];
  allProducts: ProductBatch[];
  onNavigateToProductDetails: (productId: string) => void;
  resetSearchAndFilter: () => void;
}
export function ProductGrid({
  filteredProducts,
  allProducts,
  onNavigateToProductDetails,
  resetSearchAndFilter,
}: ProductGridProps) {
  return (
    <div className="flex-1">
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {allProducts.length} product
        batches
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredProducts.map((batch) => (
          <ProductBatchCard
            key={batch.id}
            {...batch}
            onNavigateToProductDetails={onNavigateToProductDetails}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No product batches found matching your criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              resetSearchAndFilter();
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
