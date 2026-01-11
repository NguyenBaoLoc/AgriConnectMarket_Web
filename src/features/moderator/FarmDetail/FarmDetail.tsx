import { useEffect, useState } from 'react';
import { Eye, Search, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { formatUtcDate } from '../../../utils/timeUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Pagination } from '../../../components/Pagination';
import type { Farm } from './types/index.ts';
import {
  getFarmList,
  allowFarmForSelling,
  certificateVerifiedFarm,
} from './api/index.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FarmActionsDialog } from './FarmActionsDialog';

export function FarmDetail() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [certificationFilter, setCertificationFilter] = useState<
    boolean | null
  >(false); // false = not verified (default)
  const [sellingAllowFilter, setSellingAllowFilter] = useState<boolean | null>(
    false
  ); // false = not allowed (default)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isLoadingAllowSell, setIsLoadingAllowSell] = useState(false);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);

  const onViewDetails = (farmId: string) => {
    navigate(`/moderator/farms/${farmId}`);
  };

  const onMoreActions = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsActionsDialogOpen(true);
  };

  const handleAllowForSellFromDialog = async () => {
    if (!selectedFarm) return;
    try {
      setIsLoadingAllowSell(true);
      const response = await allowFarmForSelling(selectedFarm.id);
      if (response.success) {
        toast.success('Farm has been allowed for selling');
        setIsActionsDialogOpen(false);
        // Refresh farms list
        const listResponse = await getFarmList();
        if (listResponse.success && listResponse.data) {
          setFarms(listResponse.data);
        }
      } else {
        toast.error(`Failed to allow farm for selling: ${response.message}`);
      }
    } catch (error) {
      console.error('Error allowing farm for selling:', error);
      toast.error('Error allowing farm for selling');
    } finally {
      setIsLoadingAllowSell(false);
    }
  };

  const handleCertificateVerifiedFromDialog = async () => {
    if (!selectedFarm) return;
    try {
      setIsLoadingCertificate(true);
      const response = await certificateVerifiedFarm(selectedFarm.id);
      if (response.success) {
        toast.success('Farm certificate has been verified');
        setIsActionsDialogOpen(false);
        // Refresh farms list
        const listResponse = await getFarmList();
        if (listResponse.success && listResponse.data) {
          setFarms(listResponse.data);
        }
      } else {
        toast.error(`Failed to verify farm certificate: ${response.message}`);
      }
    } catch (error) {
      console.error('Error verifying farm certificate:', error);
      toast.error('Error verifying farm certificate');
    } finally {
      setIsLoadingCertificate(false);
    }
  };

  useEffect(() => {
    const getFarmsData = async () => {
      try {
        setIsLoading(true);
        const response = await getFarmList();
        if (response.success && response.data) {
          setFarms(response.data);
        } else {
          toast.error(`Get Farm List failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Error loading farms:', error);
        toast.error('Failed to load farms');
      } finally {
        setIsLoading(false);
      }
    };
    getFarmsData();
  }, []);

  const filteredFarms = farms.filter((farm) => {
    // Apply search filter first
    const matchesSearch =
      farm.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.farmDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    // If both filters are null (All selected), show all
    if (certificationFilter === null && sellingAllowFilter === null) {
      return true;
    }

    // If only certification filter is set, apply only that
    if (certificationFilter !== null && sellingAllowFilter === null) {
      return farm.isConfirmAsMall === certificationFilter;
    }

    // If only selling allow filter is set, apply only that
    if (certificationFilter === null && sellingAllowFilter !== null) {
      return farm.isValidForSelling === sellingAllowFilter;
    }

    // If both filters are set, apply them distinctly (OR logic)
    return (
      farm.isConfirmAsMall === certificationFilter ||
      farm.isValidForSelling === sellingAllowFilter
    );
  });

  // Pagination logic
  const totalItems = filteredFarms.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFarms = filteredFarms.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const getStatusBadges = (farm: Farm) => {
    const badges: {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }[] = [];

    if (farm.isConfirmAsMall)
      badges.push({ label: 'Certificate Verified', variant: 'default' });
    else
      badges.push({ label: 'Certificate Not Verified', variant: 'secondary' });
    return badges;
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '—';
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Farm Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all registered farms ({farms.length} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Certificate Status:</label>
            <Select
              value={
                certificationFilter === null
                  ? 'all'
                  : certificationFilter
                  ? 'verified'
                  : 'not-verified'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  setCertificationFilter(null);
                } else if (value === 'verified') {
                  setCertificationFilter(true);
                } else {
                  setCertificationFilter(false);
                }
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-verified">Not Verified Farm</SelectItem>
                <SelectItem value="verified">Verified Farm</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Selling Allow:</label>
            <Select
              value={
                sellingAllowFilter === null
                  ? 'all'
                  : sellingAllowFilter
                  ? 'allowed'
                  : 'not-allowed'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  setSellingAllowFilter(null);
                } else if (value === 'allowed') {
                  setSellingAllowFilter(true);
                } else {
                  setSellingAllowFilter(false);
                }
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-allowed">Not Allowed</SelectItem>
                <SelectItem value="allowed">Allowed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center!">Area</TableHead>
                <TableHead className="text-center!">Status</TableHead>
                <TableHead className="text-center!">Created</TableHead>
                <TableHead className="text-center!">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 bg-green-50!"
                  >
                    Loading farms...
                  </TableCell>
                </TableRow>
              ) : paginatedFarms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No farms found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFarms.map((farm, index) => {
                  const statusBadges = getStatusBadges(farm);
                  return (
                    <TableRow
                      key={farm.id}
                      className={`${
                        index % 2 === 0 ? 'bg-green-100!' : 'bg-gray-50!'
                      } hover:bg-green-300!`}
                    >
                      <TableCell className="font-medium">
                        {farm.farmName}
                      </TableCell>
                      <TableCell
                        className="max-w-xs text-sm text-muted-foreground"
                        title={farm.farmDesc}
                      >
                        {truncateText(farm.farmDesc, 50)}
                      </TableCell>
                      <TableCell>{farm.phone}</TableCell>
                      <TableCell className="text-center!">
                        {farm.area} m<sup>2</sup>
                      </TableCell>
                      <TableCell className="text-center!">
                        <div className="flex flex-wrap justify-center gap-1 text-center!">
                          {statusBadges.map((badge, idx) => (
                            <Badge
                              key={idx}
                              variant={badge.variant}
                              className={`text-center! ${
                                badge.variant === 'secondary'
                                  ? 'bg-red-500'
                                  : badge.variant === 'default'
                                  ? 'bg-green-500'
                                  : ''
                              }`}
                            >
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-center!">
                        {formatUtcDate(farm.createdAt)}
                      </TableCell>
                      <TableCell className="text-center!">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(farm.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoreActions(farm)}
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {totalItems > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </CardContent>

      {/* Farm Actions Dialog */}
      {selectedFarm && (
        <FarmActionsDialog
          isOpen={isActionsDialogOpen}
          onOpenChange={setIsActionsDialogOpen}
          farmName={selectedFarm.farmName}
          onAllowForSell={handleAllowForSellFromDialog}
          onCertificateVerified={handleCertificateVerifiedFromDialog}
          isLoadingAllowSell={isLoadingAllowSell}
          isLoadingCertificate={isLoadingCertificate}
        />
      )}
    </Card>
  );
}
