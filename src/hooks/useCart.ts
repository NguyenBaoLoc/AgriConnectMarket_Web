import { useState } from "react";
import { toast } from "sonner";
import {
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  getCartItems,
} from "../features/customer/CartPage/api";
import type { AddToCartRequest, UpdateCartItemRequest } from "../features/customer/CartPage/api";
import type { UpdateDeleteCartResponse } from "../features/customer/CartPage/types";

export function useCart() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (
    batchId: string,
    quantity: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to use our website");
        return false;
      }

      // Fetch current cart to get cartId
      const cartResponse = await getCartItems();
      if (!cartResponse.success || !cartResponse.data) {
        toast.error("Failed to retrieve cart");
        return false;
      }

      const cartId = cartResponse.data.cartId;
      const payload: AddToCartRequest = { cartId, batchId, quantity };
      const response = await addToCart(payload);

      if (response.success) {
        toast.success("Added to cart");
        return true;
      } else {
        toast.error(response.message || "Failed to add to cart");
        return false;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    cartId: string,
    batchId: string,
    quantity: number,
    itemId?: string
  ): Promise<UpdateDeleteCartResponse | null> => {
    setIsLoading(true);
    try {
      if (quantity < 1) {
        if (itemId) {
          return await handleRemoveItem(itemId);
        }
        return null;
      }

      const payload: UpdateCartItemRequest = { batchId, quantity };
      const response = await updateCartItemQuantity(cartId, payload);

      if (response.success) {
        toast.success("Cart updated");
        return response;
      } else {
        toast.error(response.message || "Failed to update cart");
        return null;
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (
    itemId: string
  ): Promise<UpdateDeleteCartResponse | null> => {
    setIsLoading(true);
    try {
      const response = await removeCartItem(itemId);

      if (response.success) {
        toast.success("Item removed from cart");
        return response;
      } else {
        toast.error(response.message || "Failed to remove item");
        return null;
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
  };
}
