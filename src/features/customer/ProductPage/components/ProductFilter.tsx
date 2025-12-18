import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../components/ui/accordion';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { ProductBatch } from '../types';

interface ProductFilterProps {
  productBatches: ProductBatch[];
  selectedProducts: string[];
  priceRange: [number, number];
  onProductChange: (products: string[]) => void;
  onPriceChange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

export function ProductFilter({
  productBatches,
  selectedProducts,
  priceRange,
  onProductChange,
  onPriceChange,
  onResetFilters,
}: ProductFilterProps) {
  const [minPrice, setMinPrice] = useState(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(priceRange[1].toString());

  // Get unique products from batches
  const uniqueProducts = Array.from(
    new Set(productBatches.map((batch) => batch.product))
  ).sort();

  // Calculate min and max prices from batches
  const allPrices = productBatches.map((batch) => batch.price);
  const minBatchPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxBatchPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  const handleProductToggle = (product: string) => {
    const updated = selectedProducts.includes(product)
      ? selectedProducts.filter((p) => p !== product)
      : [...selectedProducts, product];
    onProductChange(updated);
  };

  const handlePriceApply = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || maxBatchPrice;
    onPriceChange([min, max]);
  };

  const handleResetPriceInputs = () => {
    setMinPrice(priceRange[0].toString());
    setMaxPrice(priceRange[1].toString());
  };

  const isFiltersActive =
    selectedProducts.length > 0 ||
    priceRange[0] !== minBatchPrice ||
    priceRange[1] !== maxBatchPrice;

  return (
    <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit sticky top-4">
      {/* Filter Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {isFiltersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onResetFilters();
                handleResetPriceInputs();
              }}
              className="text-xs text-primary hover:text-primary/80"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Filters Accordion */}
      <Accordion type="multiple" defaultValue={['products', 'price']}>
        {/* Product Filter */}
        <AccordionItem value="products" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline hover:bg-gray-50 px-2 rounded">
            <span className="text-sm font-medium">Product</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-3">
              {uniqueProducts.length > 0 ? (
                uniqueProducts.map((product) => (
                  <div key={product} className="flex items-center gap-3">
                    <Checkbox
                      id={`product-${product}`}
                      checked={selectedProducts.includes(product)}
                      onCheckedChange={() => handleProductToggle(product)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor={`product-${product}`}
                      className="text-sm cursor-pointer flex-1 truncate"
                    >
                      {product}
                    </label>
                    <span className="text-xs text-gray-500">
                      (
                      {
                        productBatches.filter((b) => b.product === product)
                          .length
                      }
                      )
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No products available</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline hover:bg-gray-50 px-2 rounded">
            <span className="text-sm font-medium">Price</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Min Price (
                  {new Intl.NumberFormat('en-US').format(minBatchPrice)})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Max Price (
                  {new Intl.NumberFormat('en-US').format(maxBatchPrice)})
                </label>
                <Input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="mt-1 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handlePriceApply}
                  className="flex-1 text-xs"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetPriceInputs}
                  className="flex-1 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
