import { MapPin, Phone, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import type { Farm } from "../../../../types";

interface FeaturedFarmsProps {
  farms: Farm[];
  onNavigateToFarmDetails: (farmId: string) => void;
  onNavigateToAllFarms?: () => void;
}

export function FeaturedFarms({ farms, onNavigateToFarmDetails, onNavigateToAllFarms }: FeaturedFarmsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Featured Partners</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Our Top Featured Farms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover premium organic farms committed to sustainable agriculture and delivering 
            the freshest produce directly to your doorstep
          </p>
        </div>

        {/* Farms Grid */}
        <div className="mt-8 mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        style={{
            marginBottom: '64px'
        }}>
          {farms.map((farm, index) => (
            <div
              key={farm.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Farm Image with Overlay */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={farm.bannerUrl}
                  alt={farm.farmName}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
                  }}
                  style={{
                    maxHeight: '30vh'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {farm.isValidForSelling && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                      Active
                    </Badge>
                  )}
                  {farm.isConfirmAsMall && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Batch Code */}
                <div className="absolute top-3 left-3">
                  <div className="bg-white backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-700">
                    {farm.batchCodePrefix}
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div className="p-5 space-y-3" style={{
                padding: '10px'
              }}>
                {/* Farm Name */}
                <h3 className="text-xl font-bold text-green-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                  {farm.farmName}
                </h3>

                {/* Farm Description */}
                <p className="text-sm text-gray-600 line-clamp-1">
                  {farm.farmDesc}
                </p>

                {/* Farm Info */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Area:</span>
                    <span className="text-gray-700">{farm.area}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Phone:</span>
                    <span className="text-gray-700">{farm.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Since:</span>
                    <span className="text-gray-700">{formatDate(farm.createdAt)}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  onClick={() => onNavigateToFarmDetails(farm.id)}
                  className="w-full bg-green-600 to-emerald-600 hover:bg-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn"
                  style={{
                    marginTop: 'auto'
                  }}
                >
                  <span>View Farm Details</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* View All Farms Button */}
        <div className="text-center mt-12">
          <Button
            onClick={onNavigateToAllFarms}
            size="lg"
            variant="outline"
            className="border-2 border-green-600 text-green-700 hover:bg-green-500 hover:text-white transition-all duration-300 px-8 py-6 text-lg font-semibold shadow-md hover:shadow-xl"
          >
            Explore All Farms
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
