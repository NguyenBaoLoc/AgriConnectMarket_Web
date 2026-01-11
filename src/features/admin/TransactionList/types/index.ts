import type { ApiResponse } from '../../../../types';

export interface Transaction {
  id: string;
  transactionRef: string;
  bankCode: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled';
  isResolved: boolean;
  createdAt: string;
  orders: Record<string, unknown>[];
}

export type GetTransactionListResponse = ApiResponse<Transaction[]>;
export type GetTransactionDetailResponse = ApiResponse<Transaction>;
