import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { FeaturedFarms } from './components/FeaturedFarms';
import { RecommendedBatches } from './components/RecommendedBatches';
import { CategorySection } from './components/CategorySection';
import { fetchFarms, fetchRecommendedBatches } from './api';
import { Footer } from '../components';
import type { Farm } from '../../../types';
import type { ProductBatch } from '../ProductPage/types';

interface HomePageProps {
  onNavigateToProducts: () => void;
  onNavigateToProductDetails: (productId: string) => void;
  onNavigateToFarmDetails: (farmId: string) => void;
}

export function HomePage({
  onNavigateToProducts,
  onNavigateToProductDetails,
  onNavigateToFarmDetails,
}: HomePageProps) {
  const navigate = useNavigate();
  const [featuredFarms, setFeaturedFarms] = useState<Farm[]>([]);
  const [recommendedBatches, setRecommendedBatches] = useState<ProductBatch[]>(
    []
  );
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  useEffect(() => {
    const loadFarms = async () => {
      setIsLoadingFarms(true);
      const farms = await fetchFarms();
      setFeaturedFarms(farms);
      setIsLoadingFarms(false);
    };
    loadFarms();
  }, []);

  useEffect(() => {
    const loadRecommendedBatches = async () => {
      setIsLoadingBatches(true);
      const batches = await fetchRecommendedBatches();
      const newBatches = batches.map((batch, index) => ({ ...batch, index }));
      const randomNumber = Math.floor(Math.random() * 2) + 1;
      const filterdBatches = newBatches.filter(
        (b) => b.index % randomNumber === 0
      );
      setRecommendedBatches(filterdBatches);
      setIsLoadingBatches(false);
    };
    loadRecommendedBatches();
  }, []);

  return (
    <div>
      <Hero onNavigateToProducts={onNavigateToProducts} />
      <Features />

      {/* Featured Farms Section */}
      {!isLoadingFarms && featuredFarms.length > 0 && (
        <FeaturedFarms
          farms={featuredFarms}
          onNavigateToFarmDetails={onNavigateToFarmDetails}
          onNavigateToAllFarms={() => navigate('/farms')}
        />
      )}

      {/* Recommended Active Batches Section */}
      {!isLoadingBatches && recommendedBatches.length > 0 && (
        <RecommendedBatches
          batches={recommendedBatches}
          onNavigateToProductDetails={onNavigateToProductDetails}
          onNavigateToAllBatches={() => navigate('/products')}
        />
      )}

      {/* <CategorySection
        id="fruits"
        title="Fresh Fruits"
        description="Handpicked ripe fruits bursting with natural sweetness and vitamins"
        products={fruitsProducts}
        onNavigateToProductDetails={onNavigateToProductDetails}
      />

      <div className="bg-gray-50">
        <CategorySection
          id="vegetables"
          title="Garden Vegetables"
          description="Farm-fresh vegetables harvested at peak ripeness"
          products={vegetablesProducts}
          onNavigateToProductDetails={onNavigateToProductDetails}
        />
      </div>

      <CategorySection
        id="leafy-greens"
        title="Leafy Greens"
        description="Nutrient-rich greens for your healthy lifestyle"
        products={leafyGreensProducts}
        onNavigateToProductDetails={onNavigateToProductDetails}
      /> */}

      <Footer />
    </div>
  );
}
