import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import type { Farm } from "./types";
import { getFarms } from "./api";
import { AddFarmDialog } from "./components/AddFarmDialog";
import { FarmDetail } from "../FarmDetail/FarmDetail";
import { useFarmCheck } from "../../../hooks/useFarmCheck";

const defaultFarm: Farm = {
  farmName: "",
  bannerUrl: "",
  phone: "",
  area: "",
  isDeleted: false,
  isBanned: false,
  isValidForSelling: false,
  isConfirmAsMall: false,
  farmerId: "",
  addressId: "",
  id: "",
};

export function FarmManage() {
  const [farm, setFarm] = useState<Farm>(defaultFarm);
  const [showAddFarmDialog, setShowAddFarmDialog] = useState(false);
  const { hasFarmId, getFarmIdFromLocalStorage, saveFarmIdToLocalStorage } =
    useFarmCheck();

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const farmsResponse = await getFarms();
        if (farmsResponse.success && farmsResponse.data) {
          setFarm(farmsResponse.data);
          saveFarmIdToLocalStorage(farmsResponse.data.id);
        } else {
          toast.error(farmsResponse.message || "Failed to fetch farms");
        }
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    };
    fetchFarms();
  }, [saveFarmIdToLocalStorage]);

  // If no farm exists, show add farm dialog
  if (!hasFarmId() || !farm.id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">Farm Management</h2>
            <p className="text-muted-foreground">Create your first farm</p>
          </div>
        </div>

        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Farm Found
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any farms yet. Create your first farm to get
              started.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddFarmDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Farm
            </Button>
          </div>
        </div>

        {/* Add Farm Dialog */}
        <AddFarmDialog
          open={showAddFarmDialog}
          onOpenChange={setShowAddFarmDialog}
          onFarmAdded={() => {
            // Refresh farms list after adding
            const fetchFarms = async () => {
              try {
                const farmsResponse = await getFarms();
                if (farmsResponse.success && farmsResponse.data) {
                  setFarm(farmsResponse.data);
                  saveFarmIdToLocalStorage(farmsResponse.data.id);
                  setShowAddFarmDialog(false);
                  toast.success("Farm created successfully!");
                }
              } catch (error) {
                console.error("Error fetching farms:", error);
              }
            };
            fetchFarms();
          }}
        />
      </div>
    );
  }

  // If farm exists, show farm detail
  if (farm.id) {
    const farmId = getFarmIdFromLocalStorage();
    return <FarmDetail farmId={farmId || farm.id} />;
  }

  return null;
}
