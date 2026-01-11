import { useEffect, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
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
import { getFarmList } from './api/index.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function FarmList() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const navigate = useNavigate();

  const onViewDetails = (farmId: string) => {
    navigate(`/admin/farms/${farmId}`);
  };

  useEffect(() => {
    const getFarms = async () => {
      try {
        const response = await getFarmList();
        if (response.success && response.data) {
          setFarms(response.data);
        } else {
          toast.error(`Get Farm List failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Unexpected login error:', error);
      }
    };
    getFarms();
  }, []);

  const filteredFarms = farms.filter((farm) => {
    const matchesSearch =
      farm.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.farmDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.phone.includes(searchQuery);

    return matchesSearch;
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
    setCurrentPage(1); // Reset to first page when changing items per page
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Farms Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all registered farms ({farms.length} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farms by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
                <TableHead>Area</TableHead>
                <TableHead className="text-center!">Status</TableHead>
                <TableHead className="text-center!">Created</TableHead>
                <TableHead className="text-center!">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFarms.length === 0 ? (
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
                        className="max-w-xs truncate text-sm text-muted-foreground"
                        style={{ lineClamp: 1, maxWidth: '100px' }}
                      >
                        {farm.farmDesc || '—'}
                      </TableCell>
                      <TableCell>{farm.phone}</TableCell>
                      <TableCell>
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
                      <TableCell className="text-center! text-sm text-muted-foreground">
                        {formatUtcDate(farm.createdAt)}
                      </TableCell>
                      <TableCell className="text-center!">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(farm.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                        </Button>
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
    </Card>
  );
}
