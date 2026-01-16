import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Calendar,
  Edit3,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Leaf,
  X,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getSeasons, createSeason, updateSeasonStatus } from './api';
import type { Season, Status } from './types';
import type { Product } from '../ProductList/types';

export function SeasonList() {
  const [farm, setFarm] = useState<{ id: string; name: string } | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status>('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();

  function onViewDetails(seasonId: string) {
    navigate(`/farmer/seasons/${seasonId}`);
  }

  // Form states
  const [seasonName, setSeasonName] = useState('');
  const [product, setProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const filteredSeasons = seasons.filter(
    (season) =>
      (season.seasonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        season.seasonDesc.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === '' || season.status === statusFilter)
  );

  const totalItems = filteredSeasons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentSeasons = filteredSeasons.slice(startIndex, endIndex);

  const handleCreateSeason = async () => {
    if (!seasonName || !product || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const farmId = localStorage.getItem('farmId');
    if (!farmId) {
      toast.error('Farm ID not found. Please select a farm first.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        seasonName,
        seasonDesc: description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        farmId,
        productId: product,
      };

      const response = await createSeason(payload);
      if (response.success) {
        toast.success('Season created successfully');
        setShowCreateDialog(false);
        resetForm();
        // Refresh seasons list
        const seasonsResponse = await getSeasons();
        if (seasonsResponse.success && seasonsResponse.data) {
          setSeasons(seasonsResponse.data);
        }
      } else {
        toast.error(response.message || 'Failed to create season');
      }
    } catch (error) {
      console.error('Error creating season:', error);
      toast.error('Error creating season');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSeasonName('');
    setProduct('');
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const getStatusColor = (status: Season['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm';
      case 'Harvested':
        return 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm';
      case 'Closed':
        return 'bg-gray-100 text-gray-700 border-gray-200 shadow-sm';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 shadow-sm';
    }
  };

  const handleStatusUpdate = (season: Season) => {
    setSelectedSeason(season);
    setSelectedStatus(season.status);
    setShowStatusDialog(true);
  };

  const handleStatusChange = async () => {
    if (!selectedSeason) return;

    setIsUpdatingStatus(true);
    try {
      const response = await updateSeasonStatus(
        selectedSeason.id,
        selectedStatus
      );
      if (response.success) {
        toast.success(response.message || 'Season status updated successfully');
        setShowStatusDialog(false);
        // Refresh seasons list
        const seasonsResponse = await getSeasons();
        if (seasonsResponse.success && seasonsResponse.data) {
          setSeasons(seasonsResponse.data);
        }
      } else {
        toast.error(response.message || 'Failed to update season status');
      }
    } catch (error) {
      console.error('Error updating season status:', error);
      toast.error('Error updating season status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await getSeasons();
        if (response.success && response.data) {
          setSeasons(response.data);
        } else {
          toast.error(`Failed to fetch seasons: ${response.message}`);
        }
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://192.168.2.67:5170/api/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);
  return (
    <div className="min-h-screen bg-green-50 rounded-lg py-8">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-green-600 p-8 text-white">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Season Management</h1>
              </div>
              <p className="text-green-100 text-lg">
                Manage growing seasons and production cycles with precision
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Season
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden mt-8">
          <CardHeader className="bg-linear-to-r from-white to-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pr-4 mr-4 text-gray-400" />
                <Input
                  placeholder="Search seasons by name or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-20 h-11 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Harvested">Harvested</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
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
          </CardHeader>
          <CardContent className="p-0">
            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 hover:bg-gray-50">
                    <TableHead className="font-bold text-gray-800 py-4 text-sm uppercase tracking-wide">
                      Season Name
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      Description
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      Start Date
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      End Date
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-gray-800 text-right text-sm uppercase tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSeasons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <Leaf className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">
                            No seasons found
                          </p>
                          <p className="text-gray-400 text-sm">
                            Create your first season to get started
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSeasons.map((season, index) => (
                      <TableRow
                        key={season.id}
                        className={`group transition-all duration-200 border-b border-gray-100 hover:shadow-md ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-linear-to-r hover:from-green-50 hover:to-emerald-50`}
                      >
                        <TableCell className="py-4 font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 group-hover:bg-green-600 transition-colors"></div>
                            <span
                              style={{ maxWidth: '180px' }}
                              className="block truncate"
                            >
                              {season.seasonName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                          <span
                            style={{ maxWidth: '220px' }}
                            className="block truncate"
                          >
                            {season.seasonDesc || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium group-hover:text-gray-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {season.startDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium group-hover:text-gray-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {season.endDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center">
                            <Badge
                              className={`${getStatusColor(
                                season.status
                              )} px-4 py-1.5 text-xs font-bold border-2 rounded-full shadow-sm transition-all group-hover:shadow-md`}
                              variant="secondary"
                            >
                              {season.status === 'Active' && (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              {season.status === 'Pending' && (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {season.status === 'Harvested' && (
                                <Zap className="h-3 w-3 mr-1" />
                              )}
                              {season.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(season)}
                              className="text-white bg-blue-600 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:text-white hover:bg-none shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1.5 rounded-lg"
                              title="Update Season Status"
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              <span className="text-xs font-semibold">
                                Update
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(season.id)}
                              className="text-white bg-green-600 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:text-white hover:bg-none shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1.5 rounded-lg"
                              title="View Season Details"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="text-xs font-semibold">
                                View
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="shadow-sm hover:shadow-md transition-shadow"
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
                          ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                          : 'shadow-sm hover:shadow-md transition-shadow'
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
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg">
                      Update Season Status
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1">
                      Change the status of{' '}
                      <span className="font-semibold">
                        {selectedSeason?.seasonName}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <Label className="text-sm font-bold text-gray-800 mb-3 block">
                  Select New Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as Status)}
                >
                  <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-2 border-gray-200">
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-md"></div>
                        <span className="font-medium">Pending</span>
                        <span className="text-xs text-gray-500 ml-2">
                          Starting phase
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Active">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-md animate-pulse"></div>
                        <span className="font-medium">Active</span>
                        <span className="text-xs text-gray-500 ml-2">
                          In progress
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Harvested">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-400 shadow-md"></div>
                        <span className="font-medium">Harvested</span>
                        <span className="text-xs text-gray-500 ml-2">
                          Completed
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Closed">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-gray-400 shadow-md"></div>
                        <span className="font-medium">Closed</span>
                        <span className="text-xs text-gray-500 ml-2">
                          Finished
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Info Card */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                  Current Status
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusColor(
                      selectedSeason?.status || 'Pending'
                    )} px-3 py-1 border-2 font-semibold`}
                  >
                    {selectedSeason?.status}
                  </Badge>
                  <span className="text-gray-600 text-sm">→</span>
                  <Badge
                    className={`${getStatusColor(
                      selectedStatus
                    )} px-3 py-1 border-2 font-semibold`}
                  >
                    {selectedStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
                disabled={isUpdatingStatus}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdatingStatus}
                className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
              >
                {isUpdatingStatus ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Season Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">
                  Create New Season
                </DialogTitle>
                <DialogDescription className="text-green-100 mt-1">
                  Start a new growing season for your farm with detailed
                  planning
                </DialogDescription>
              </div>
            </div>
            <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Season Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    placeholder="e.g., Spring Tomatoes 2025"
                    className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">
                    Product <span className="text-red-500">*</span>
                  </Label>
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-2 border-gray-200">
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter season description and details..."
                    rows={3}
                    className="border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                disabled={isLoading}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
                onClick={handleCreateSeason}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Season
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
