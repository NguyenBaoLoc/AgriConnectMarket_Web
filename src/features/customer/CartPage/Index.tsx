import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import {
  ShoppingCart,
  ArrowLeft,
  Loader,
  Plus,
  Minus,
  Trash2,
  Check,
} from 'lucide-react';
import { Footer } from '../components';
import { formatVND } from '../../../components/ui/utils';
import type { CartData } from './types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  deleteAllCart,
} from './api';
import type { UpdateCartItemRequest } from './api';

interface CartPageProps {
  onNavigateHome: () => void;
  onNavigateToCheckout: () => void;
  onNavigateToProductDetails?: (productId: string) => void;
  onCartCountUpdate?: (count: number) => void;
}

export function CartPage({
  onNavigateHome,
  onNavigateToCheckout,
  onNavigateToProductDetails,
  onCartCountUpdate,
}: CartPageProps) {
  const navigate = useNavigate();
  const context = useOutletContext<{
    setHeaderCartCount?: (count: number) => void;
  }>();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [deletingAll, setDeletingAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ❗ TEMP INPUTS for quantity — THIS is what caused your bug
  const [quantityInputs, setQuantityInputs] = useState<Record<string, number>>(
    {}
  );

  // Helper to clear temporary inputs
  const clearQuantityInputs = (itemId?: string) => {
    if (!itemId) {
      setQuantityInputs({});
      return;
    }
    setQuantityInputs((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // Toggle selection of a single item
  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }
      return updated;
    });
  };

  // Select all items
  const handleSelectAll = () => {
    if (!cartData) return;
    const allItemIds = new Set<string>();
    cartData.cartItems.forEach((farm) => {
      if (farm && farm.items) {
        farm.items.forEach((item) => {
          allItemIds.add(item.itemId);
        });
      }
    });
    setSelectedItems(allItemIds);
  };

  // Deselect all items
  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const cartItemCount =
    cartData?.cartItems
      ?.filter((farm) => farm !== null)
      .reduce(
        (sum: number, farm: any) => sum + (farm?.items?.length || 0),
        0
      ) || 0;

  const selectedItemCount = selectedItems.size;

  const selectedItemsTotal =
    cartData?.cartItems
      ?.filter((farm) => farm !== null && farm.items)
      .reduce((sum: number, farm) => {
        const farmTotal = farm.items
          .filter((item) => selectedItems.has(item.itemId))
          .reduce((itemSum, item) => itemSum + item.itemPrice, 0);
        return sum + farmTotal;
      }, 0) || 0;

  const hasCartItems =
    cartData?.cartItems &&
    cartData.cartItems.filter((farm) => farm !== null).length > 0;

  // Helper function to separate items by selling status
  const separateItemsBySellingStatus = (items: any[]) => {
    const selling = items.filter((item) => item.isSelling !== false);
    const notSelling = items.filter((item) => item.isSelling === false);
    return { selling, notSelling };
  };

  const handleNavigateToProduct = (batchId: string) => {
    navigate(`/product/${batchId}`);
  };

  const handleProceedToCheckout = () => {
    // Pass selected items info to checkout page
    navigate('/checkout', {
      state: {
        selectedItemIds: Array.from(selectedItems),
      },
    });
  };

  const handleUpdateQuantity = async (
    itemId: string,
    batchId: string,
    newQuantity: number,
    currentQuantity?: number
  ) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems((prev) => {
      const s = new Set(prev);
      s.add(itemId);
      return s;
    });

    try {
      const cartId = cartData?.cartId;
      if (!cartId) {
        toast.error('Cart ID not found');
        return;
      }

      // Get current quantity from cart data
      const current =
        currentQuantity ??
        cartData?.cartItems
          .flatMap((farm) => farm?.items || [])
          .find((item) => item.itemId === itemId)?.quantity ??
        0;

      // Calculate delta (change amount)
      const delta = newQuantity - current;

      const payload: UpdateCartItemRequest = { batchId, quantity: delta };
      const response = await updateCartItemQuantity(cartId, payload);

      if (response.success) {
        // Fetch fresh cart data to ensure accuracy
        const fresh = await getCartItems();
        if (fresh.success && fresh.data) {
          setCartData(fresh.data);
          toast.success('Cart updated');
        } else {
          toast.error('Failed to refresh cart data');
        }

        // FIX: Clear temporary input after update
        clearQuantityInputs(itemId);
      } else {
        toast.error(response.message || 'Failed to update cart');

        const fresh = await getCartItems();
        if (fresh.success && fresh.data) {
          setCartData(fresh.data);

          // FIX: Clear all temp inputs
          clearQuantityInputs();
        }
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      toast.error('Failed to update cart');

      try {
        const fresh = await getCartItems();
        if (fresh.success && fresh.data) {
          setCartData(fresh.data);

          // FIX: clear stale inputs
          clearQuantityInputs();
        }
      } catch (e) {}
    } finally {
      setUpdatingItems((prev) => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      const response = await removeCartItem(itemId);

      if (response.success) {
        toast.success('Item removed from cart');

        const fresh = await getCartItems();
        if (fresh.success && fresh.data) {
          setCartData(fresh.data);

          // FIX: Clear temporary for removed item
          clearQuantityInputs(itemId);
        }
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItems((prev) => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!cartData?.cartId) {
      toast.error('Cart ID not found');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to remove all items from your cart?'
    );
    if (!confirmDelete) return;

    setDeletingAll(true);
    try {
      const response = await deleteAllCart(cartData.cartId);

      if (response.success) {
        toast.success('All items removed');

        const fresh = await getCartItems();
        if (fresh.success && fresh.data) {
          setCartData(fresh.data);

          // FIX: Reset ALL temp inputs
          clearQuantityInputs();
        }
      }
    } catch (err) {
      console.error('Error deleting all items:', err);
      toast.error('Failed to remove all items');
    } finally {
      setDeletingAll(false);
    }
  };

  // INITIAL FETCH — FIX HERE
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCartItems();
        if (response.success && response.data) {
          setCartData(response.data);

          // FIX: Clear stale quantity inputs on page load
          clearQuantityInputs();
        } else {
          setError(response.message || 'Failed to fetch cart');
          toast.error(response.message || 'Failed to fetch cart items');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred';
        setError(msg);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cartData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || 'Failed to load cart'}</p>
          <Button onClick={onNavigateHome}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onNavigateHome} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                  <h2>Shopping Cart ({cartItemCount} items)</h2>
                </div>
                {hasCartItems && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="text-xs"
                    >
                      Deselect All
                    </Button>
                  </div>
                )}
              </div>

              {!hasCartItems ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button onClick={onNavigateHome}>Start Shopping</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartData.cartItems
                    .filter((farm) => farm !== null && farm.items)
                    .map((farm) => {
                      const { selling, notSelling } =
                        separateItemsBySellingStatus(farm.items || []);

                      return (
                        <div key={farm.farmId}>
                          {/* Selling Products Section */}
                          {selling.length > 0 && (
                            <div className="border border-gray-200 rounded-lg p-4 mb-4">
                              <h3 className="font-semibold text-green-600 mb-3">
                                {farm.farmName}
                              </h3>
                              <div className="space-y-3">
                                {selling.map((item) => (
                                  <div
                                    key={item.itemId}
                                    className={`flex gap-4 pb-3 border-b border-gray-100 items-start transition-colors ${
                                      selectedItems.has(item.itemId)
                                        ? 'bg-green-50 p-2 rounded'
                                        : ''
                                    }`}
                                  >
                                    {/* Checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.has(item.itemId)}
                                      onChange={() =>
                                        handleToggleItemSelection(item.itemId)
                                      }
                                      className="mt-2 w-5 h-5 text-green-600 rounded cursor-pointer"
                                    />

                                    <button
                                      onClick={() =>
                                        handleNavigateToProduct(item.itemId)
                                      }
                                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                    >
                                      {item.batchImageUrls.length > 0 ? (
                                        <img
                                          src={item.batchImageUrls[0]}
                                          alt={item.productName}
                                          className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                                        />
                                      ) : (
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
                                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </button>
                                    <div
                                      className="flex-1 cursor-pointer"
                                      onClick={() =>
                                        handleNavigateToProduct(item.batchId)
                                      }
                                    >
                                      <h4 className="font-medium hover:text-green-600 transition-colors">
                                        {item.productName}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {item.categoryName} • {item.seasonName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Batch: {item.batchCode}
                                      </p>
                                      <p className="text-gray-600 mt-1">
                                        {formatVND(item.batchPrice)} /{' '}
                                        {item.units}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Status: {item.seasonStatus}
                                      </p>
                                    </div>
                                    <div className="text-right flex flex-col gap-2">
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          Unit Price:{' '}
                                          {formatVND(item.batchPrice)}
                                        </p>
                                        <p className="font-semibold">
                                          {formatVND(item.itemPrice)}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              item.itemId,
                                              item.batchId,
                                              item.quantity - 1,
                                              item.quantity
                                            )
                                          }
                                          disabled={
                                            updatingItems.has(item.itemId) ||
                                            item.quantity <= 1
                                          }
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>

                                        {/* FIXED: quantityInputs is now safe because we clear it */}
                                        <input
                                          type="number"
                                          min="1"
                                          value={
                                            quantityInputs[item.itemId] ??
                                            item.quantity
                                          }
                                          onChange={(e) => {
                                            setQuantityInputs((prev) => ({
                                              ...prev,
                                              [item.itemId]: parseInt(
                                                e.target.value,
                                                10
                                              ),
                                            }));
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const newQty =
                                                quantityInputs[item.itemId] ??
                                                item.quantity;
                                              if (newQty >= 1) {
                                                handleUpdateQuantity(
                                                  item.itemId,
                                                  item.batchId,
                                                  newQty,
                                                  item.quantity
                                                );
                                                clearQuantityInputs(
                                                  item.itemId
                                                );
                                              }
                                            }
                                          }}
                                          onBlur={() =>
                                            clearQuantityInputs(item.itemId)
                                          }
                                          disabled={updatingItems.has(
                                            item.itemId
                                          )}
                                          className="w-12 text-center text-sm font-medium border-0 outline-none"
                                        />

                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              item.itemId,
                                              item.batchId,
                                              item.quantity + 1,
                                              item.quantity
                                            )
                                          }
                                          disabled={updatingItems.has(
                                            item.itemId
                                          )}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-xs text-gray-600 ml-1 min-w-fit">
                                          KG
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                          handleRemoveItem(item.itemId)
                                        }
                                        disabled={updatingItems.has(
                                          item.itemId
                                        )}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Not Selling Products Section */}
                          {notSelling.length > 0 && (
                            <div className="border border-yellow-300 rounded-lg p-4 mb-4 bg-yellow-50">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                  ⚠️ Currently Unavailable
                                </div>
                                <h3 className="font-semibold text-yellow-700">
                                  {farm.farmName} - Not Selling
                                </h3>
                              </div>
                              <p className="text-sm text-yellow-700 mb-3">
                                These products are not available for purchase at
                                the moment. You can keep them in your cart or
                                remove them below.
                              </p>
                              <div className="space-y-3">
                                {notSelling.map((item) => (
                                  <div
                                    key={item.itemId}
                                    className="flex gap-4 pb-3 border-b border-yellow-200 items-start opacity-75"
                                  >
                                    {/* Disabled Checkbox */}
                                    <input
                                      type="checkbox"
                                      disabled
                                      className="mt-2 w-5 h-5 text-gray-400 rounded cursor-not-allowed"
                                      title="This item is not available for purchase"
                                    />

                                    <button
                                      onClick={() =>
                                        handleNavigateToProduct(item.itemId)
                                      }
                                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                    >
                                      {item.batchImageUrls.length > 0 ? (
                                        <img
                                          src={item.batchImageUrls[0]}
                                          alt={item.productName}
                                          className="w-20 h-20 object-cover rounded-lg cursor-pointer grayscale"
                                        />
                                      ) : (
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
                                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </button>
                                    <div
                                      className="flex-1 cursor-pointer"
                                      onClick={() =>
                                        handleNavigateToProduct(item.batchId)
                                      }
                                    >
                                      <h4 className="font-medium text-gray-600 line-through">
                                        {item.productName}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {item.categoryName} • {item.seasonName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Batch: {item.batchCode}
                                      </p>
                                      <p className="text-gray-600 mt-1">
                                        {formatVND(item.batchPrice)} /{' '}
                                        {item.units}
                                      </p>
                                      <p className="text-xs text-yellow-700 mt-1 font-semibold">
                                        Status: Not Selling
                                      </p>
                                    </div>
                                    <div className="text-right flex flex-col gap-2">
                                      <div>
                                        <p className="text-sm text-gray-600">
                                          Unit Price:{' '}
                                          {formatVND(item.batchPrice)}
                                        </p>
                                        <p className="font-semibold text-gray-600">
                                          {formatVND(item.itemPrice)}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-gray-100">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          disabled
                                        >
                                          <Minus className="h-3 w-3 text-gray-400" />
                                        </Button>
                                        <span className="w-12 text-center text-sm font-medium text-gray-400">
                                          {item.quantity}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          disabled
                                        >
                                          <Plus className="h-3 w-3 text-gray-400" />
                                        </Button>
                                        <span className="text-xs text-gray-600 ml-1 min-w-fit">
                                          KG
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                          handleRemoveItem(item.itemId)
                                        }
                                        disabled={updatingItems.has(
                                          item.itemId
                                        )}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="mb-4">Order Summary</h3>

              {!hasCartItems ? (
                <div className="text-gray-500 py-4">
                  <p className="text-sm mb-4">
                    Cart is empty. Add items to see the total.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-medium">{cartItemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Items</span>
                      <span className="font-medium text-green-600">
                        {selectedItemCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer</span>
                      <span>{cartData.fullname}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email</span>
                      <span>{cartData.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone</span>
                      <span>{cartData.phone}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-2 pt-4">
                    <span className="text-sm text-gray-600">Cart Total</span>
                    <span className="text-sm text-gray-600">
                      {formatVND(cartData?.totalPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-semibold">
                      Selected Total
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatVND(selectedItemsTotal)}
                    </span>
                  </div>
                </>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={selectedItemCount === 0}
                onClick={handleProceedToCheckout}
              >
                {selectedItemCount === 0
                  ? 'Select Items to Checkout'
                  : `Proceed to Checkout (${selectedItemCount} items)`}
              </Button>

              <div className={cartItemCount === 0 ? 'hidden' : 'mt-3'}>
                <Button
                  variant="ghost"
                  className="w-full text-red-600 border border-red-200 hover:bg-red-50"
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                >
                  {deletingAll ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin text-red-600" />
                      Removing all
                    </span>
                  ) : (
                    'Remove All Items'
                  )}
                </Button>
              </div>

              <div
                className={cartItemCount === 0 ? 'hidden' : 'mt-4 space-y-2'}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  Multiple Payment Options
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
