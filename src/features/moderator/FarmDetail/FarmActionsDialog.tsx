import { CheckCircle, ShoppingCart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

interface FarmActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farmName: string;
  onAllowForSell: () => void;
  onCertificateVerified: () => void;
  isLoadingAllowSell?: boolean;
  isLoadingCertificate?: boolean;
}

export function FarmActionsDialog({
  isOpen,
  onOpenChange,
  farmName,
  onAllowForSell,
  onCertificateVerified,
  isLoadingAllowSell = false,
  isLoadingCertificate = false,
}: FarmActionsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Farm Actions</DialogTitle>
          <DialogDescription>
            Manage actions for <span className="font-semibold">{farmName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            className="w-full"
            variant="default"
            onClick={onAllowForSell}
            disabled={isLoadingAllowSell || isLoadingCertificate}
          >
            {isLoadingAllowSell && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            <ShoppingCart className="w-4 h-4 mr-2" />
            Allow for Sell
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={onCertificateVerified}
            disabled={isLoadingCertificate || isLoadingAllowSell}
          >
            {isLoadingCertificate && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            )}
            <CheckCircle className="w-4 h-4 mr-2" />
            Certificate Verified
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
