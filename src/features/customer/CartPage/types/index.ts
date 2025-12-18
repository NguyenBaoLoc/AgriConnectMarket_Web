import type { ApiResponse } from "../../../../types";

interface CartItemProduct {
  itemId: string;
  batchId: string;
  batchCode: string;
  batchImageUrls: string[];
  productName: string;
  categoryName: string;
  seasonName: string;
  batchPrice: number;
  quantity: number;
  units: string;
  itemPrice: number;
  seasonStatus: string;
}

interface CartItemFarm {
  farmId: string;
  farmName: string;
  items: CartItemProduct[];
}

interface CartData {
  cartId: string;
  totalPrice: number;
  fullname: string;
  email: string;
  phone: string;
  cartItems: CartItemFarm[];
}

// Legacy type for local state management
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

type GetCartItemResponse = ApiResponse<CartData>;

// For update/delete operations that return a different structure
interface CartUpdateResponse {
  id: string;
  batchId: string;
  quantity: number;
  itemPrice: number;
  cart: CartData;
  batch?: Record<string, unknown>;
}

type UpdateDeleteCartResponse = ApiResponse<CartUpdateResponse>;

export type { CartItem, GetCartItemResponse, CartData, CartItemFarm, CartItemProduct, UpdateDeleteCartResponse, CartUpdateResponse };
