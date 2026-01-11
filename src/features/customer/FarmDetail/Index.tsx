import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CertificateViewer } from '../../../components/CertificateViewer';
import { getFarmDetails, getFarmProductBatches } from './api';
import { Footer } from '../components';
import type { FarmData, ProductBatch } from './types';
import { toggleFavoriteFarm, getMyFavoriteFarms } from '../FavoriteFarms/api';
import { ProductBatchCard } from './components/ProductBatchCard';
import { ReportFarmDialog } from './components/ReportFarmDialog';
import { toast } from 'sonner';
import { hasValidCredentials } from '../../../utils/credentialsSettings';
import { formatUtcDate } from '../../../utils/timeUtils';

export function FarmDetail() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<FarmData | null>(null);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      if (!farmId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch farm details
        const farmResponse = await getFarmDetails(farmId);
        if (farmResponse.success && farmResponse.data) {
          setFarm(farmResponse.data);
        } else {
          setError('Failed to load farm details');
        }

        // Fetch product batches
        setBatchesLoading(true);
        const batchesResponse = await getFarmProductBatches(farmId);
        if (batchesResponse.success && Array.isArray(batchesResponse.data)) {
          setBatches(batchesResponse.data);
        } else {
          console.warn('Failed to load product batches');
        }
      } catch (err) {
        console.error('Error fetching farm details:', err);
        setError('Error loading farm details');
      } finally {
        setIsLoading(false);
        setBatchesLoading(false);
      }
    };

    fetchData();
  }, [farmId]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!farm || !farm.id) return;
      try {
        const favs = await getMyFavoriteFarms();
        console.log(favs);

        if (!favs.success) {
          console.log(favs.success);
          setIsFavorited(false);
          return;
        }
        console.log(favs);
        if (Array.isArray(favs)) {
          const exists = favs.some((f) => f?.farm && f.farm.id === farm.id);
          setIsFavorited(Boolean(exists));
        }
      } catch (err) {
        console.error('Error fetching favorite farms', err);
      }
    };
    checkFavorite();
  }, [farm]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddFavorite = async () => {
    if (!hasValidCredentials()) {
      toast.error('You need to be logged in to save farms');
      return;
    }

    if (!farm?.id) return;
    try {
      setIsFavoriting(true);
      const res = await toggleFavoriteFarm(farm.id);

      if (res && res.success) {
        if (res.data === 'added') {
          toast.success('Added to favorites');
          setIsFavorited(true);
        } else if (res.data === 'removed') {
          toast.success('Removed from favorites');
          setIsFavorited(false);
        }
      } else {
        toast.error('Failed to update favorite status');
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
      toast.error('Failed to update favorite status');
    } finally {
      setIsFavoriting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(batches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatches = batches.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading farm details...</p>
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error || 'Farm not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Section: Back Button & Favorite Button */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {/* Report Button */}
          <button
            onClick={() => setShowReportDialog(true)}
            className="flex items-center gap-2 px-12 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="sm:inline">Report Farm</span>
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleAddFavorite}
            disabled={isFavoriting}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
              isFavorited
                ? 'bg-pink-600 text-white hover:bg-pink-700'
                : 'bg-pink-700 text-white hover:bg-pink-600'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorited ? 'fill-white' : ''
              }`}
            />
            <span className="sm:inline">
              {isFavorited ? 'Saved' : 'Save Farm'}
            </span>
          </button>
        </div>
      </div>

      {/* Farm Header */}
      <div className="mb-8 relative">
        {farm.bannerUrl && (
          <>
            <img
              src={farm.bannerUrl}
              alt={farm.farmName}
              className="w-full object-cover rounded-lg mb-6"
              style={{
                maxHeight: '80vh',
              }}
            />
            {farm.isConfirmAsMall && (
              <div className="absolute top-6 right-6">
                <Badge variant="destructive" className="text-sm">
                  Mall Farm
                </Badge>
              </div>
            )}
          </>
        )}
      </div>

      {/* Farm Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {farm.farmName}
            </h2>
            {farm.isConfirmAsMall && <Badge variant="destructive">Mall</Badge>}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-gray-700">{farm.farmDesc}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch Code Prefix</p>
              <p className="text-gray-700 font-mono">{farm.batchCodePrefix}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Area</p>
              <p className="text-gray-700">
                {farm.area} m<sup>2</sup>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-gray-700">{farm.phone}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Farm Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {!farm.isDelete && !farm.isBanned ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selling Enabled</span>
              <Badge variant="secondary">
                {farm.isValidForSelling ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mall Confirmed</span>
              <Badge variant="secondary">
                {farm.isConfirmAsMall ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-gray-700">{formatUtcDate(farm.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="text-gray-700">{formatUtcDate(farm.updatedAt)}</p>
            </div>
          </div>
        </Card>
        {/* Certificate section for customers */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Certificate
          </h3>
          {farm.certificateUrl ? (
            <div className="space-y-3">
              <img
                src={farm.certificateUrl}
                alt="certificate"
                className="w-64 h-auto object-contain rounded shadow"
              />
              <div>
                <CertificateViewer
                  imageUrl={farm.certificateUrl}
                  altText="Farm Certificate"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This farm has not uploaded a certificate yet.
            </p>
          )}
        </Card>
      </div>

      {/* Product Batches Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Product Batches Available
          {batches.length > 0 && (
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({batches.length})
            </span>
          )}
        </h2>

        {batchesLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading product batches...</p>
          </div>
        ) : batches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedBatches.map((batch) => (
                <ProductBatchCard
                  key={batch.id}
                  batch={batch}
                  onNavigate={() => navigate(`/product/${batch.id}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, batches.length)} of {batches.length}{' '}
                  batches
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      // Show first, last, current, and 1 page before/after current
                      const shouldShow =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        pageNum === currentPage ||
                        pageNum === currentPage - 1 ||
                        pageNum === currentPage + 1;

                      if (!shouldShow) {
                        // Show ellipsis before last page if needed
                        if (
                          pageNum === currentPage + 2 &&
                          currentPage + 2 < totalPages
                        ) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageClick(pageNum)}
                          className="min-w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No product batches available from this farm yet.
            </p>
          </Card>
        )}
      </section>

      {/* Report Farm Dialog */}
      {farm && (
        <ReportFarmDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          farmId={farm.id}
          farmName={farm.farmName}
        />
      )}

      <Footer />
    </div>
  );
}
