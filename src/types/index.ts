type UserRole = "Guest" | "Admin" | "Buyer" | "Farmer";

interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

interface Farm {
  id: string;
  farmName: string;
  farmDesc: string;
  batchCodePrefix: string;
  bannerUrl: string;
  phone: string;
  area: string;
  isDelete: boolean;
  isBanned: boolean;
  isValidForSelling: boolean;
  isConfirmAsMall: boolean;
  createdAt: string;
  createdBy: string;
  farmerId: string;
  addressId: string;
}

export type { UserRole, ApiResponse, Farm };
