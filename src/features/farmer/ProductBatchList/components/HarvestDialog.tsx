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
import { harvestProductBatch } from "../api";

interface HarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchCode: string;
  currentYield: number;
  onSuccess: () => void;
}

export function HarvestDialog({
  open,
  onOpenChange,
  batchId,
  batchCode,
  currentYield,
  onSuccess,
}: HarvestDialogProps) {
  const [totalYield, setTotalYield] = useState<string>(currentYield.toString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTotalYield(currentYield.toString());
    }
  }, [open, currentYield]);

  const handleSubmit = async () => {
    if (!totalYield || Number(totalYield) <= 0) {
      toast.error("Total yield must be greater than 0");
      return;
    }

    try {
      setIsLoading(true);
      const response = await harvestProductBatch(batchId, Number(totalYield));

      if (response.success) {
        toast.success("Harvest updated successfully");
        setTotalYield(currentYield.toString());
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update harvest");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating harvest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Total Yield</AlertDialogTitle>
          <AlertDialogDescription>
            Update the harvest amount for batch {batchCode}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="yield">Total Yield</Label>
            <Input
              id="yield"
              type="number"
              placeholder="Enter total yield"
              value={totalYield}
              onChange={(e) => setTotalYield(e.target.value)}
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
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Updating..." : "Update"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
