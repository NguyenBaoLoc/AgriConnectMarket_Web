import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { ProductBatchCard } from '../../../../components/ProductBatchCard';
import type { ProductBatch } from '../../ProductPage/types';

interface RecommendedBatchesProps {
  batches: ProductBatch[];
  onNavigateToProductDetails: (productId: string) => void;
  onNavigateToAllBatches?: () => void;
}

export function RecommendedBatches({
  batches,
  onNavigateToProductDetails,
  onNavigateToAllBatches,
}: RecommendedBatchesProps) {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Picked For You</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Recommended Active Batches for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our freshly harvested batches selected just for you. Get
            premium quality produce directly from trusted farms
          </p>
        </div>

        {/* Batches Grid */}
        {batches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {batches.map((batch, index) => (
                <div
                  key={batch.id}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  <ProductBatchCard
                    {...batch}
                    onNavigateToProductDetails={onNavigateToProductDetails}
                  />
                </div>
              ))}
            </div>

            {/* View All Button */}
            {onNavigateToAllBatches && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={onNavigateToAllBatches}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span>Browse All Batches</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No active batches available at the moment
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
