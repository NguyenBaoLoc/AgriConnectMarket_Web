import { useEffect, useState } from 'react';
import { Search, Eye, Package, Plus, Leaf, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { toast } from 'sonner';
import type { ProductBatch } from './types';
import { getFarmerProductBatches } from './api';
import { AddProductBatchDialog } from './components/AddProductBatchDialog';
import { HarvestDialog } from './components/HarvestDialog';
import { SellDialog } from './components/SellDialog';
import axios from 'axios';
import { API } from '../../../api';

interface Farm {
  id: string;
  farmName: string;
}

interface FarmResponse {
  success: boolean;
  data?: Farm;
  message?: string;
}

export function ProductBatchList() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [productNameFilter, setProductNameFilter] =
    useState<string>('all-products');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [harvestDialogOpen, setHarvestDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  // Get farmId by fetching farmer's current farm
  const fetchFarmId = async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<FarmResponse>(API.farm.me, { headers });
      if (response.data.success && response.data.data?.id) {
        return response.data.data.id;
      }
      return null;
    } catch (error) {
      console.error('Error fetching farm:', error);
      return null;
    }
  };

  const uniqueProductNames = Array.from(
    new Set(
      batches
        .map((batch) => batch.season?.product?.productName)
        .filter((name): name is string => !!name)
    )
  ).sort();

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchCode.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.units.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.season?.product?.productName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesProductFilter =
      productNameFilter === 'all-products' ||
      batch.season?.product?.productName === productNameFilter;

    return matchesSearch && matchesProductFilter;
  });

  const totalItems = filteredBatches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentBatches = filteredBatches.slice(startIndex, endIndex);

  const handleViewBatchDetail = (batchId: string) => {
    navigate(`/farmer/product-batches/${batchId}`);
  };

  const handleHarvestClick = (batch: ProductBatch) => {
    setSelectedBatch(batch);
    setHarvestDialogOpen(true);
  };

  const handleSellClick = (batch: ProductBatch) => {
    setSelectedBatch(batch);
    setSellDialogOpen(true);
  };

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const farmId = await fetchFarmId();

      if (!farmId) {
        toast.error('No farm found. Please create a farm first.');
        setIsLoading(false);
        return;
      }

      const response = await getFarmerProductBatches(farmId);
      if (response.success && response.data) {
        console.log('Fetched batches with season data:', response.data);
        setBatches(response.data);
      } else {
        toast.error(
          `Failed to fetch batches: ${response.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error loading product batches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading product batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Product Batch Management</h2>
          <p className="text-muted-foreground">Manage your product batches</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </Button>
      </div>

      <Card className="p-6">
        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={productNameFilter}
            onValueChange={(value) => {
              setProductNameFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by product name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-products">All Products</SelectItem>
              {uniqueProductNames.map((productName) => (
                <SelectItem key={productName} value={productName}>
                  {productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>

        {/* Table */}
        {currentBatches.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Total Yield</TableHead>
                    <TableHead>Available Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-semibold">
                        {batch.batchCode.value}
                      </TableCell>
                      <TableCell>
                        {batch.season?.product?.productName || 'N/A'}
                      </TableCell>
                      <TableCell>{batch.totalYield}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            batch.availableQuantity > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {batch.availableQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Number(batch.price).toLocaleString('vi-VN')}₫
                      </TableCell>
                      <TableCell>
                        {new Date(batch.harvestDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHarvestClick(batch)}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            title="Update harvest yield"
                          >
                            <Leaf className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSellClick(batch)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Sell product batch"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBatchDetail(batch.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Process
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? 'bg-green-600 hover:bg-green-700'
                          : ''
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No batches match your search'
                : 'No product batches yet'}
            </p>
          </div>
        )}
      </Card>

      {/* Add Product Batch Dialog */}
      <AddProductBatchDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onBatchAdded={() => fetchBatches()}
      />

      {/* Harvest Dialog */}
      {selectedBatch && (
        <HarvestDialog
          open={harvestDialogOpen}
          onOpenChange={setHarvestDialogOpen}
          batchId={selectedBatch.id}
          batchCode={selectedBatch.batchCode.value}
          currentYield={selectedBatch.totalYield}
          onSuccess={() => fetchBatches()}
        />
      )}

      {/* Sell Dialog */}
      {selectedBatch && (
        <SellDialog
          open={sellDialogOpen}
          onOpenChange={setSellDialogOpen}
          batchId={selectedBatch.id}
          batchCode={selectedBatch.batchCode.value}
          availableQuantity={selectedBatch.availableQuantity}
          currentPrice={selectedBatch.price}
          onSuccess={() => fetchBatches()}
        />
      )}
    </div>
  );
}
