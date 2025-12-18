import { useEffect, useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Pagination } from '../../../components/Pagination';
import { ProductGrid } from './components/ProductGrid';
import { ProductFilter } from './components/ProductFilter';
import { getProductBatches } from './api/productBatch';
import { API } from '../../../api';
import { Footer } from '../components';
import type { ProductBatch } from './types';

interface ProductPageProps {
  onNavigateToProductDetails: (productId: string) => void;
}

export function ProductPage({ onNavigateToProductDetails }: ProductPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchProductBatches = async () => {
      try {
        const response = await getProductBatches();
        if (response.success) {
          if (response.data) {
            setProductBatches(response.data);
            // Initialize price range
            const prices = response.data.map((batch) => batch.price);
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              setPriceRange([minPrice, maxPrice]);
            }
          }
        } else {
          console.error(`Failed to fetch product batches: ${response.message}`);
        }
      } catch (error) {
        console.error('Error fetching product batches:', error);
      }
    };
    fetchProductBatches();

    const fetchCategories = async () => {
      try {
        const res = await fetch(API.category.list);
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productBatches.filter((batch) => {
      const batchCodeValue =
        typeof batch.batchCode === 'string'
          ? batch.batchCode
          : batch.batchCode.value;

      const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      const matchesCategory = selectedCategoryId
        ? batch.category.toLowerCase() ===
          selectedCategory?.categoryName?.toLowerCase()
        : true;
      const matchesSearch = searchQuery
        ? batchCodeValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          batch.product.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesProduct =
        selectedProducts.length > 0
          ? selectedProducts.includes(batch.product)
          : true;
      const matchesPrice =
        batch.price >= priceRange[0] && batch.price <= priceRange[1];

      return matchesCategory && matchesSearch && matchesProduct && matchesPrice;
    });
  }, [
    productBatches,
    selectedCategoryId,
    searchQuery,
    categories,
    selectedProducts,
    priceRange,
  ]);

  // Pagination logic
  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">All Products</h1>
          <p className="text-muted-foreground">
            Browse our complete selection of fresh organic produce
          </p>
        </div>

        {/* Categories (new) */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                role="button"
                aria-pressed={selectedCategoryId === cat.id}
                tabIndex={0}
                onClick={() =>
                  setSelectedCategoryId((prev) =>
                    prev === cat.id ? null : cat.id
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    setSelectedCategoryId((prev) =>
                      prev === cat.id ? null : cat.id
                    );
                }}
                className={`relative flex-shrink-0 flex items-center justify-center gap-4 p-3 rounded-lg border cursor-pointer transition-all transform ${
                  selectedCategoryId === cat.id
                    ? 'scale-105 shadow-lg border-2 border-primary-600 ring-4 ring-primary/20'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: randomPastel(cat.id),
                  minWidth: '13rem',
                }}
              >
                {selectedCategoryId === cat.id && (
                  <div className="absolute top-1 right-2 bg-white rounded-full p-1 shadow">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <img
                  src={cat.illustrativeImageUrl}
                  alt={cat.categoryName}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="font-semibold">{cat.categoryName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {cat.categoryDesc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content with Filters */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <ProductFilter
            productBatches={productBatches}
            selectedProducts={selectedProducts}
            priceRange={priceRange}
            onProductChange={setSelectedProducts}
            onPriceChange={setPriceRange}
            onResetFilters={() => {
              setSelectedProducts([]);
              const prices = productBatches.map((batch) => batch.price);
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                setPriceRange([minPrice, maxPrice]);
              }
              setCurrentPage(1);
            }}
          />

          {/* Products Grid */}
          <ProductGrid
            filteredProducts={paginatedProducts}
            allProducts={productBatches}
            onNavigateToProductDetails={onNavigateToProductDetails}
            resetSearchAndFilter={() => {
              setSearchQuery('');
              setSelectedCategoryId(null);
              setSelectedProducts([]);
              const prices = productBatches.map((batch) => batch.price);
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                setPriceRange([minPrice, maxPrice]);
              }
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Pagination */}
        {totalProducts > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={totalProducts}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function randomPastel(seed: string) {
  // deterministic-ish pastel HSL based on string hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  const s = 70; // saturation
  const l = 90; // very light pastel
  return `hsl(${h} ${s}% ${l}%)`;
}
