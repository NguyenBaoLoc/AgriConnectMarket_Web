import { useState, useEffect } from 'react';
import { Heart, MapPin, Trash2, Loader } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Pagination } from '../../../components/Pagination';
import { toast } from 'sonner';
import { getMyFavoriteFarms, removeFavoriteFarm } from '../FavoriteFarms/api';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components';

interface FavoriteFarmsPageProps {
  onNavigateToProducts?: () => void;
}

interface FavoriteFarm {
  farm: {
    id: string;
    farmName: string;
    farmDesc: string;
    bannerUrl?: string;
    area?: string;
    phone?: string;
    isConfirmAsMall?: boolean;
  };
}

export function FavoriteListPage({
  onNavigateToProducts,
}: FavoriteFarmsPageProps) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteFarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Load favorite farms on component mount
  useEffect(() => {
    const loadFavoriteFarms = async () => {
      try {
        setIsLoading(true);
        const response = await getMyFavoriteFarms();
        if (Array.isArray(response)) {
          setFavorites(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setFavorites(response.data);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorite farms:', error);
        toast.error('Failed to load favorite farms');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteFarms();
  }, []);

  const handleRemoveFromFavorites = async (farmId: string) => {
    try {
      setIsRemoving(farmId);
      await removeFavoriteFarm(farmId);
      setFavorites((prev) => prev.filter((item) => item.farm.id !== farmId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite farm:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleViewFarmDetail = (farmId: string) => {
    navigate(`/farm/${farmId}`);
  };

  const handleBrowseProducts = () => {
    if (onNavigateToProducts) {
      onNavigateToProducts();
    } else {
      navigate('/products');
    }
  };

  // Pagination logic
  const totalFavorites = favorites.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFavorites = favorites.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-3 text-green-600" />
            <p className="text-muted-foreground">
              Loading your favorite farms...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Favorite Farms
          </h1>
          <p className="text-muted-foreground">
            {favorites.length > 0
              ? `You have ${favorites.length} favorite farm${
                  favorites.length !== 1 ? 's' : ''
                }`
              : 'Your favorites list is empty'}
          </p>
        </div>

        {favorites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFavorites.map((item) => {
                const farm = item.farm;
                return (
                  <Card
                    key={farm.id}
                    className="overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    {/* Farm Banner */}
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      {farm.bannerUrl ? (
                        <img
                          src={farm.bannerUrl}
                          alt={farm.farmName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{
                            maxHeight: '30vh',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            No Banner
                          </span>
                        </div>
                      )}
                      {farm.isConfirmAsMall && (
                        <Badge
                          variant="destructive"
                          className="absolute top-3 right-3"
                        >
                          Mall Farm
                        </Badge>
                      )}
                      <button
                        onClick={() => handleRemoveFromFavorites(farm.id)}
                        disabled={isRemoving === farm.id}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isRemoving === farm.id ? (
                          <Loader className="h-5 w-5 animate-spin text-red-600" />
                        ) : (
                          <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                        )}
                      </button>
                    </div>

                    {/* Farm Info */}
                    <div className="p-4">
                      <button
                        onClick={() => handleViewFarmDetail(farm.id)}
                        className="w-full text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2">
                          {farm.farmName}
                        </h3>
                      </button>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {farm.farmDesc || 'No description available'}
                      </p>

                      {/* Location and Area */}
                      <div className="space-y-2 mb-4 text-sm">
                        {farm.area && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{farm.area}</span>
                          </div>
                        )}
                        {farm.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">📞</span>
                            <span className="text-gray-700 font-mono">
                              {farm.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleViewFarmDetail(farm.id)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveFromFavorites(farm.id)}
                          disabled={isRemoving === farm.id}
                        >
                          {isRemoving === farm.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalItems={totalFavorites}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No favorite farms yet</p>
            <p className="text-muted-foreground mb-6">
              Start adding farms to your favorites to see them here
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleBrowseProducts}
            >
              Browse Farms
            </Button>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
