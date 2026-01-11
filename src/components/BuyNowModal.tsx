import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface BuyNowModalProps {
  isOpen: boolean;
  productName: string;
  units: string;
  availableQuantity: number;
  price: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function BuyNowModal({
  isOpen,
  productName,
  units,
  availableQuantity,
  price,
  onConfirm,
  onCancel,
}: BuyNowModalProps) {
  const [quantity, setQuantity] = useState<string>('1');
  const [error, setError] = useState<string>('');

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);
    setError('');
  };

  const handleConfirm = () => {
    const qty = parseFloat(quantity);

    // Validation
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (qty > availableQuantity) {
      setError(
        `Quantity cannot exceed available stock (${availableQuantity} ${units})`
      );
      return;
    }

    onConfirm(qty);
    setQuantity('1');
    setError('');
  };

  const handleCancel = () => {
    setQuantity('1');
    setError('');
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy Now</DialogTitle>
          <DialogDescription>
            Enter the quantity of {productName} you want to buy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product</Label>
            <div className="p-3 bg-gray-50 rounded-md text-sm font-medium">
              {productName}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({units})
              <span className="text-xs text-muted-foreground ml-2">
                (Available: {availableQuantity} {units})
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              max={availableQuantity}
              placeholder="Enter quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className="text-base"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-semibold text-green-700">
                {(price * (parseFloat(quantity) || 0)).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-700">
                {(price * (parseFloat(quantity) || 0)).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
          >
            Confirm Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
