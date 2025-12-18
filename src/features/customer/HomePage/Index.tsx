import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { FeaturedFarms } from "./components/FeaturedFarms";
import { CategorySection } from "./components/CategorySection";
import { fetchFarms } from "./api";
import { Footer } from "../components";
import type { Farm } from "../../../types";

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
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);

  useEffect(() => {
    const loadFarms = async () => {
      setIsLoadingFarms(true);
      const farms = await fetchFarms();
      setFeaturedFarms(farms);
      setIsLoadingFarms(false);
    };
    loadFarms();
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
