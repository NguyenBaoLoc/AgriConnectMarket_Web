import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface FarmRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToFarmManagement: () => void;
}

export function FarmRequiredDialog({
  open,
  onOpenChange,
  onNavigateToFarmManagement,
}: FarmRequiredDialogProps) {
  const handleNavigate = () => {
    onOpenChange(false);
    onNavigateToFarmManagement();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-1/2 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Farm Required</DialogTitle>
          <DialogDescription>
            You need to create or register a farm before accessing this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Please navigate to the "Manage Farm" section to create your farm profile. Once your farm is registered and approved, you'll be able to access other features.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleNavigate}
          >
            Go to Manage Farm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
