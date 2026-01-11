import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Pagination } from '../../../components/Pagination';
import { getFarms, type FarmItem } from './api';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Footer } from '../components';
import { Search, MapPin, Phone, Maximize2, Filter } from 'lucide-react';

export function FarmsPage() {
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMallOnly, setIsMallOnly] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'newest'>(
    'newest'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMallOnly]);

  const navigate = useNavigate();

  const handleOpenFarm = (id: string) => {
    navigate(`/farm/${id}`);
  };

  const fetchFarms = async (term?: string) => {
    try {
      setLoading(true);
      const resp = await getFarms(term, isMallOnly);
      if (resp.success) {
        setFarms(resp.data || []);
      } else {
        toast.error(resp.message || 'Failed to fetch farms');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async () => {
    await fetchFarms(searchTerm || undefined);
  };

  // Front-end filtering and sorting
  const filteredFarms = useMemo(() => {
    let list = [...farms];
    if (areaFilter) {
      list = list.filter((f) =>
        (f.area || '').toLowerCase().includes(areaFilter.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'nameAsc':
        list.sort((a, b) => a.farmName.localeCompare(b.farmName));
        break;
      case 'nameDesc':
        list.sort((a, b) => b.farmName.localeCompare(a.farmName));
        break;
      case 'newest':
      default:
        list.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        break;
    }

    return list;
  }, [farms, areaFilter, sortBy]);

  // Pagination logic
  const totalFarms = filteredFarms.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleFarms = filteredFarms.slice(startIndex, endIndex);

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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Browse Farms</h1>
            <p className="text-gray-600">
              Discover and connect with local farms in our community
            </p>
          </div>

          {/* Search Section */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search farms by name..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={onSearch} disabled={loading} className="px-6">
              Search
            </Button>
          </div>
        </div>

        {/* Filter and Sort Section */}
        <Card className="mb-8 border-0 hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Filters & Sort
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mall Filter */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="mallFilter"
                    checked={isMallOnly}
                    onChange={(e) => setIsMallOnly(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="mallFilter"
                    className="cursor-pointer flex-1 text-sm font-medium"
                  >
                    Show mall farms only
                  </label>
                </div>

                {/* Area Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Filter by Area
                  </label>
                  <Input
                    placeholder="e.g., Ha Noi, Ho Chi Minh..."
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Sort */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-9 border border-gray-200 px-3 py-1.5 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="newest">Newest First</option>
                    <option value="nameAsc">Name A → Z</option>
                    <option value="nameDesc">Name Z → A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-foreground">
              {visibleFarms.length > 0 ? startIndex + 1 : 0}
            </span>
            –
            <span className="font-semibold text-foreground">
              {Math.min(endIndex, totalFarms)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-foreground">{totalFarms}</span>{' '}
            farms
          </p>
        </div>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading && (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-gray-600">Loading farms...</p>
              </div>
            </div>
          )}
          {!loading && visibleFarms.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No farms found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          )}
          {!loading &&
            visibleFarms.map((farm) => (
              <Card
                key={farm.id}
                className="p-0 overflow-hidden border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleOpenFarm(farm.id)}
              >
                {/* Image Section */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                  {farm.bannerUrl ? (
                    <img
                      src={farm.bannerUrl}
                      alt={farm.farmName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">No image</span>
                      </div>
                    </div>
                  )}

                  {/* Mall Badge */}
                  {farm.isConfirmAsMall && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-100 text-amber-700 font-semibold">
                        ⭐ Mall
                      </Badge>
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col gap-4">
                  {/* Farm Name */}
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {farm.farmName}
                    </h3>
                  </div>

                  {/* Farm Description */}
                  {farm.farmDesc && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {farm.farmDesc}
                    </p>
                  )}

                  {/* Farm Info Grid */}
                  <div className="space-y-2.5 py-3 border-t border-gray-100">
                    {/* Area */}
                    {farm.area && (
                      <div className="flex items-center gap-2 text-sm">
                        <Maximize2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          {farm.area} m<sup>2</sup>
                        </span>
                      </div>
                    )}

                    {/* Phone */}
                    {farm.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{farm.phone}</span>
                      </div>
                    )}

                    {/* No Info Message */}
                    {!farm.area && !farm.phone && (
                      <p className="text-xs text-gray-400 italic">
                        No additional info available
                      </p>
                    )}
                  </div>

                  {/* View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    View Farm
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        {/* Pagination */}
        {totalFarms > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={totalFarms}
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

export default FarmsPage;
