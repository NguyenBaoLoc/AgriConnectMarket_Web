import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { toast } from "sonner";
import { sellProductBatch } from "../api";

interface SellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchCode: string;
  availableQuantity: number;
  currentPrice: number;
  onSuccess: () => void;
}

export function SellDialog({
  open,
  onOpenChange,
  batchId,
  batchCode,
  availableQuantity,
  currentPrice,
  onSuccess,
}: SellDialogProps) {
  const [quantity, setQuantity] = useState<string>(availableQuantity.toString());
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(availableQuantity.toString());
      setPrice(currentPrice.toString());
    }
  }, [open, availableQuantity, currentPrice]);

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) <= 0) {
      toast.error("Available quantity must be greater than 0");
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setIsLoading(true);
      const response = await sellProductBatch(
        batchId,
        Number(quantity),
        Number(price)
      );

      if (response.success) {
        toast.success("Product batch sold successfully");
        setQuantity(availableQuantity.toString());
        setPrice(currentPrice.toString());
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to sell product batch");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error selling product batch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sell Product Batch</AlertDialogTitle>
          <AlertDialogDescription>
            Update available quantity and price for batch {batchCode}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="quantity">Available Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter available quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="1"
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Selling..." : "Sell"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
