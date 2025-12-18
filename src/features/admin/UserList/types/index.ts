import type { ApiResponse } from "../../../../types";

interface Account {
  userName: string;
  password: string;
  role: string;
  verifiedAt?: string;
  isActive: boolean;
  isDeLeted: boolean;
  createdAt: string;
  updatedAt?: string;
  id: string;
}

interface User {
  fullname: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accountId: string;
  account: Account;
  createdAt: string;
  id: string;
}

type GetUserListResponse = ApiResponse<User[]>;
export type { User, Account, GetUserListResponse };
