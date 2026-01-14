import { useEffect, useState } from 'react';
import { Search, Eye, CheckCircle } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { formatUtcDateTime } from '../../../utils/timeUtils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Pagination } from '../../../components/Pagination';
import type { Transaction } from './types/index';
import {
  getTransactionList,
  getTransactionDetail,
  resolveTransaction,
} from './api/index';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [transactionToResolve, setTransactionToResolve] =
    useState<Transaction | null>(null);
  const [isResolvingTransaction, setIsResolvingTransaction] = useState(false);

  const filteredTransactions = transactions
    .filter(
      (transaction) =>
        (transaction.transactionRef
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'all' || transaction.status === statusFilter) &&
        (resolvedFilter === 'all' ||
          (resolvedFilter === 'resolved' && transaction.isResolved) ||
          (resolvedFilter === 'not-resolved' && !transaction.isResolved))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleResolvedFilterChange = (value: string) => {
    setResolvedFilter(value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Get unique statuses from transactions
  const uniqueStatuses = Array.from(
    new Set(transactions.map((t) => t.status).filter(Boolean))
  ).sort();

  const getStatusBadgeVariant = (
    status: Transaction['status']
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Success':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getResolvedBadgeVariant = (
    isResolved: boolean
  ): 'default' | 'secondary' => {
    return isResolved ? 'default' : 'secondary';
  };

  const handleViewDetails = async (transactionId: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await getTransactionDetail(transactionId);
      if (response.success && response.data) {
        setSelectedTransaction(response.data);
        setIsModalOpen(true);
      } else {
        toast.error(`Failed to load transaction details: ${response.message}`);
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
      toast.error('Failed to load transaction details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleResolveClick = (transaction: Transaction) => {
    setTransactionToResolve(transaction);
    setIsResolveDialogOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!transactionToResolve) return;

    setIsResolvingTransaction(true);
    try {
      const response = await resolveTransaction(transactionToResolve.id);
      console.log(response);
      if (response.success && response.data) {
        // Update the transaction in the list
        // setTransactions((prevTransactions) =>
        //   prevTransactions.map((t) =>
        //     t.id === transactionToResolve.id ? response.data : t
        //   )
        // );
        filteredTransactions.forEach((tx) => {
          if (tx.id === transactionToResolve.id) {
            tx.isResolved = true;
          }
        });
        toast.success('Transaction resolved successfully!');
        setIsResolveDialogOpen(false);
        setTransactionToResolve(null);
      } else {
        toast.error(`Failed to resolve transaction: ${response.message}`);
      }
    } catch (error) {
      console.error('Error resolving transaction:', error);
      toast.error('Failed to resolve transaction');
    } finally {
      setIsResolvingTransaction(false);
    }
  };

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await getTransactionList();
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          toast.error(`Get Transaction List failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Failed to load transactions');
      }
    };
    getTransactions();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and monitor all transactions ({transactions.length}{' '}
                total)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ref or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Transaction Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={resolvedFilter}
              onValueChange={handleResolvedFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Resolved Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="not-resolved">Not Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Bank Code</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => (
                    <TableRow
                      key={transaction.id}
                      className={`hover:bg-green-300! ${
                        index % 2 === 0 ? 'bg-white!' : 'bg-green-50!'
                      }`}
                    >
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.transactionRef}
                      </TableCell>
                      <TableCell>
                        {transaction.amount
                          ? `${transaction.amount.toLocaleString()} VND`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(transaction.status)}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getResolvedBadgeVariant(
                            transaction.isResolved
                          )}
                        >
                          {transaction.isResolved ? 'Resolved' : 'Not Resolved'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.bankCode || 'N/A'}</TableCell>
                      <TableCell>
                        {formatUtcDateTime(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction.id)}
                            disabled={isLoadingDetail}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!transaction.isResolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveClick(transaction)}
                              disabled={isResolvingTransaction}
                              title="Mark as Resolved"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No transactions found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="text-sm font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Transaction Reference
                  </p>
                  <p className="text-sm font-medium">
                    {selectedTransaction.transactionRef}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount
                  </p>
                  <p className="text-sm font-medium">
                    {selectedTransaction.amount
                      ? `${selectedTransaction.amount.toLocaleString()} VND`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bank Code
                  </p>
                  <p className="text-sm">
                    {selectedTransaction.bankCode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={getStatusBadgeVariant(selectedTransaction.status)}
                    className="mt-1"
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Resolved Status
                  </p>
                  <Badge
                    variant={getResolvedBadgeVariant(
                      selectedTransaction.isResolved
                    )}
                    className="mt-1"
                  >
                    {selectedTransaction.isResolved
                      ? 'Resolved'
                      : 'Not Resolved'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">
                    {formatUtcDateTime(selectedTransaction.createdAt)}
                  </p>
                </div>
                {selectedTransaction.orders &&
                  selectedTransaction.orders.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Related Orders
                      </p>
                      <div className="text-sm">
                        {selectedTransaction.orders.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTransaction.orders.map(
                              (order: Record<string, unknown>, idx: number) => (
                                <li key={idx}>
                                  {(order.id as string) ||
                                    JSON.stringify(order)}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">
                            No related orders
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Confirmation Dialog */}
      <AlertDialog
        open={isResolveDialogOpen}
        onOpenChange={setIsResolveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark transaction{' '}
              <span className="font-semibold text-foreground">
                {transactionToResolve?.transactionRef}
              </span>{' '}
              as resolved? This action will indicate that you have transferred
              the money to the farmer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel disabled={isResolvingTransaction}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmResolve}
              disabled={isResolvingTransaction}
              className="bg-green-600 hover:bg-green-700"
            >
              {isResolvingTransaction ? 'Resolving...' : 'Confirm'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
