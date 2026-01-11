import { useState, useEffect } from 'react';
import { Search, Eye, X, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { formatVND } from '../../../components/ui/utils';
import { formatUtcDate } from '../../../utils/timeUtils';
import { toast } from 'sonner';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { API } from '../../../api';

interface OrderItem {
  orderId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  id: string;
}

interface Customer {
  fullname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Order {
  id: string;
  customerId: string;
  addressId: string;
  orderCode: string;
  totalPrice: number;
  orderDate: string;
  shippingFee: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipping' | 'Delivered' | 'Canceled';
  orderType: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  customer: Customer;
  orderItems: OrderItem[];
}

// Local storage key for approved pre-orders
const APPROVED_PREORDERS_KEY = 'approvedPreOrderIds';

// Helper functions for local storage
function getApprovedPreOrderIds(): string[] {
  try {
    const stored = localStorage.getItem(APPROVED_PREORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(
      'Error reading approved pre-orders from local storage:',
      error
    );
    return [];
  }
}

function addApprovedPreOrderId(orderId: string): void {
  try {
    const approvedIds = getApprovedPreOrderIds();
    if (!approvedIds.includes(orderId)) {
      approvedIds.push(orderId);
      localStorage.setItem(APPROVED_PREORDERS_KEY, JSON.stringify(approvedIds));
    }
  } catch (error) {
    console.error('Error saving approved pre-order to local storage:', error);
  }
}

function isPreOrderApproved(orderId: string): boolean {
  const approvedIds = getApprovedPreOrderIds();
  return approvedIds.includes(orderId);
}

function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Processing':
      return 'default';
    case 'Shipping':
      return 'default';
    case 'Delivered':
      return 'outline';
    case 'Canceled':
      return 'destructive';
    default:
      return 'default';
  }
}

function getStatusBadgeClassName(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'Processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'Shipping':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'Delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'Canceled':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

export function OrderList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewPreOrders, setViewPreOrders] = useState(false);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPreOrderId, setSelectedPreOrderId] = useState<string | null>(
    null
  );
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [fullname, setFullname] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [expectedReleaseDate, setExpectedReleaseDate] = useState('');
  const navigate = useNavigate();

  const statusOptions = [
    'Pending',
    'Processing',
    'Shipping',
    'Delivered',
    'Canceled',
  ];

  const fetchFarmAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current farm
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const farmApi = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const farmResponse = await farmApi.get(API.farm.me);
      if (!farmResponse.data.success || !farmResponse.data.data) {
        throw new Error(farmResponse.data.message || 'Failed to get farm info');
      }

      const currentFarmId = farmResponse.data.data.id;
      console.log('Farm ID:', currentFarmId);

      // Fetch orders for this farm
      const ordersApi = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ordersUrl = API.order.getByFarm(currentFarmId);
      console.log('Fetching orders from:', ordersUrl);

      const ordersResponse = await ordersApi.get(ordersUrl);
      console.log('Orders response:', ordersResponse.data);

      if (
        ordersResponse.data.success &&
        Array.isArray(ordersResponse.data.data)
      ) {
        setOrders(ordersResponse.data.data);
      } else {
        throw new Error(
          ordersResponse.data.message || 'Invalid response format'
        );
      }

      // Fetch pre-orders for this farm
      const preOrdersUrl = API.order.getPreOrdersByFarm(currentFarmId);
      console.log('Fetching pre-orders from:', preOrdersUrl);

      const preOrdersResponse = await ordersApi.get(preOrdersUrl);
      console.log('Pre-orders response:', preOrdersResponse.data);

      if (
        preOrdersResponse.data.success &&
        Array.isArray(preOrdersResponse.data.data)
      ) {
        setPreOrders(preOrdersResponse.data.data);
      } else {
        setPreOrders([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Failed to fetch orders:', errorMessage);
      setOrders([]);
      setPreOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmAndOrders();
  }, []);

  function onViewDetails(orderId: string) {
    navigate(`/farmer/orders/${orderId}`);
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const statusApi = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await statusApi.patch(
        `${API.order.base}/${orderId}/order-status`,
        { orderStatus: newStatus }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: newStatus as Order['orderStatus'] }
              : order
          )
        );
      } else {
        throw new Error(
          response.data.message || 'Failed to update order status'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      alert(`Error updating status: ${errorMessage}`);
      console.error('Failed to update order status:', errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleProcessOrder(orderId: string) {
    try {
      setProcessingOrderId(orderId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const api = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await api.patch(`${API.order.base}/${orderId}/process`);

      if (response.data.success) {
        toast.success('Order processed successfully');

        const processOrderRes = response.data.data;

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === processOrderRes.orderId
              ? {
                  ...order,
                  orderStatus:
                    processOrderRes.newStatus as Order['orderStatus'],
                }
              : order
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to process order');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Error: ${errorMessage}`);
      console.error('Failed to process order:', errorMessage);
    } finally {
      setProcessingOrderId(null);
    }
  }

  function handleOpenApproveModal(orderId: string) {
    setSelectedPreOrderId(orderId);
    setShowApproveModal(true);
  }

  function handleCloseApproveModal() {
    setShowApproveModal(false);
    setSelectedPreOrderId(null);
    setBankName('');
    setAccountNumber('');
    setFullname('');
    setDepositAmount('');
    setExpectedReleaseDate('');
  }

  async function handleSubmitApprove() {
    try {
      if (!selectedPreOrderId) {
        throw new Error('No pre-order selected');
      }

      if (
        !bankName ||
        !accountNumber ||
        !fullname ||
        !depositAmount ||
        !expectedReleaseDate
      ) {
        alert('Please fill in all required fields');
        return;
      }

      setApprovingOrderId(selectedPreOrderId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const approveApi = axios.create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await approveApi.patch(
        API.order.approvePreOrder(selectedPreOrderId),
        {
          bankName,
          accountNumber,
          fullname,
          depositAmount: parseFloat(depositAmount),
          expectedReleaseDate: new Date(expectedReleaseDate).toISOString(),
        }
      );

      if (response.data.success) {
        // Save approved order ID to local storage
        addApprovedPreOrderId(selectedPreOrderId);

        setPreOrders((prevPreOrders) =>
          prevPreOrders.filter((order) => order.id !== selectedPreOrderId)
        );
        alert('Pre-order approved successfully');
        handleCloseApproveModal();
      } else {
        throw new Error(response.data.message || 'Failed to approve pre-order');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      alert(`Error approving pre-order: ${errorMessage}`);
      console.error('Failed to approve pre-order:', errorMessage);
    } finally {
      setApprovingOrderId(null);
    }
  }

  const dataToFilter = viewPreOrders ? preOrders : orders;

  const filteredOrders = dataToFilter.filter((order) => {
    // Search filter
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullname.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || order.orderStatus === filterStatus;

    // Date range filter
    const orderDate = new Date(order.orderDate);
    const matchesStartDate = !startDate || orderDate >= new Date(startDate);
    const matchesEndDate = !endDate || orderDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Order Management</h2>
          <p className="text-muted-foreground">
            View and manage customer orders and pre-orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={viewPreOrders ? 'default' : 'outline'}
            onClick={() => {
              setViewPreOrders(false);
              setCurrentPage(1);
              setSearchQuery('');
              setFilterStatus('all');
              setStartDate('');
              setEndDate('');
            }}
            className={viewPreOrders ? '' : 'bg-blue-600 hover:bg-blue-700'}
          >
            Orders
          </Button>
          <Button
            variant={viewPreOrders ? 'default' : 'outline'}
            onClick={() => {
              setViewPreOrders(true);
              setCurrentPage(1);
              setSearchQuery('');
              setFilterStatus('all');
              setStartDate('');
              setEndDate('');
            }}
            className={viewPreOrders ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Pre-Orders
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
              disabled={loading}
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2 text-gray-700">
                Status
              </label>
              <Select
                value={filterStatus}
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2 text-gray-700">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="w-40"
              />
            </div>

            {/* End Date Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2 text-gray-700">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="w-40"
              />
            </div>

            {/* Clear Filters Button */}
            {(filterStatus !== 'all' || startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
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
              disabled={loading}
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
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  Order Code
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Date
                </TableHead>
                {viewPreOrders ? (
                  <TableHead className="font-semibold text-gray-700">
                    Quantity
                  </TableHead>
                ) : (
                  <>
                    <TableHead className="font-semibold text-gray-700">
                      Items
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Total Price
                    </TableHead>
                  </>
                )}
                {!viewPreOrders && (
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                )}
                <TableHead className="text-right font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={viewPreOrders ? 6 : 8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading {viewPreOrders ? 'pre-orders' : 'orders'}...
                  </TableCell>
                </TableRow>
              ) : currentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={viewPreOrders ? 6 : 8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No {viewPreOrders ? 'pre-orders' : 'orders'} found
                  </TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className={`border-b transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-green-300'
                    } hover:bg-green-500`}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {order.orderCode}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {order.customer.fullname}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {order.customer.phone}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatUtcDate(order.orderDate)}
                    </TableCell>
                    {viewPreOrders ? (
                      <TableCell className="text-center font-semibold text-gray-900">
                        {order.orderItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className="text-center text-gray-700">
                          {order.orderItems.length}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatVND(order.totalPrice)}
                        </TableCell>
                      </>
                    )}
                    {!viewPreOrders && (
                      <TableCell>
                        <Badge
                          className={getStatusBadgeClassName(order.orderStatus)}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(order.id)}
                          disabled={
                            processingOrderId === order.id ||
                            approvingOrderId === order.id
                          }
                          title="View order details"
                          className="hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Detail
                        </Button>
                        {!viewPreOrders && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProcessOrder(order.id)}
                            disabled={processingOrderId === order.id}
                            className="bg-green-600 hover:bg-green-700"
                            title="Process this order"
                          >
                            {processingOrderId === order.id && (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            )}
                            {processingOrderId !== order.id && 'Process Order'}
                            {processingOrderId === order.id && 'Processing...'}
                          </Button>
                        )}
                        {viewPreOrders &&
                          (isPreOrderApproved(order.id) ? (
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              Approved
                            </span>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenApproveModal(order.id)}
                              disabled={approvingOrderId === order.id}
                              className="bg-green-600 hover:bg-green-700 rounded-full"
                              title="Approve pre-order"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ))}
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
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''
                }
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Approve Pre-Order Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Pre-Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Bank Name
              </label>
              <Input
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Account Number
              </label>
              <Input
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Full Name
              </label>
              <Input
                placeholder="Enter full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Deposit Amount
              </label>
              <Input
                type="number"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Expected Release Date
              </label>
              <Input
                type="date"
                value={expectedReleaseDate}
                onChange={(e) => setExpectedReleaseDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseApproveModal}
              disabled={approvingOrderId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApprove}
              disabled={approvingOrderId !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvingOrderId ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
