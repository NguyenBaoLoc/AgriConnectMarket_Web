import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { createProductBatch } from "../api";
import { getSeasonsByFarm } from "../../SeasonList/api";
import { API } from "../../../../api";
import type { Season } from "../types";

interface AddProductBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBatchAdded?: () => void;
}

interface Farm {
  id: string;
  farmName: string;
}

interface FarmResponse {
  success: boolean;
  data?: Farm;
  message?: string;
}

export function AddProductBatchDialog({
  open,
  onOpenChange,
  onBatchAdded,
}: AddProductBatchDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [farmId, setFarmId] = useState<string | null>(null);

  // Form fields
  const [selectedSeason, setSelectedSeason] = useState("");
  const [totalYield, setTotalYield] = useState("");
  const [units, setUnits] = useState("kg");
  const [plantingDate, setPlantingDate] = useState("");

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Get farmId and load seasons on dialog open
  useEffect(() => {
    if (open) {
      fetchFarmIdAndSeasons();
    }
  }, [open]);

  const fetchFarmId = async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get<FarmResponse>(API.farm.me, { headers });
      if (response.data.success && response.data.data?.id) {
        return response.data.data.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching farm:", error);
      return null;
    }
  };

  const fetchFarmIdAndSeasons = async () => {
    try {
      const id = await fetchFarmId();
      if (!id) {
        toast.error("No farm found. Please create a farm first.");
        return;
      }
      setFarmId(id);
      await fetchSeasons(id);
    } catch (error) {
      console.error("Error initializing dialog:", error);
      toast.error("Error loading seasons");
    }
  };

  const fetchSeasons = async (id: string) => {
    setIsLoadingSeasons(true);
    try {
      const response = await getSeasonsByFarm(id);
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        toast.error("Failed to load seasons");
      }
    } catch (error) {
      console.error("Error fetching seasons:", error);
      toast.error("Error loading seasons");
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);

      // Validate each file
      for (const file of newFiles) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return;
        }
      }

      // Add new files
      setImageFiles((prev) => [...prev, ...newFiles]);

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !selectedSeason.trim() ||
      !totalYield.trim() ||
      !units.trim() ||
      !plantingDate.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const totalYieldNum = parseFloat(totalYield);
    if (isNaN(totalYieldNum) || totalYieldNum <= 0) {
      toast.error("Total Yield must be a positive number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createProductBatch(
        {
          seasonId: selectedSeason,
          totalYield: totalYieldNum,
          units: "kg",
          plantingDate,
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );

      if (response.success) {
        toast.success("Product batch created successfully!");
        resetForm();
        onOpenChange(false);
        onBatchAdded?.();
      } else {
        toast.error(response.message || "Failed to create product batch");
      }
    } catch (error) {
      console.error("Error creating product batch:", error);
      toast.error("Error creating product batch");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSeason("");
    setTotalYield("");
    setUnits("");
    setPlantingDate("");
    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col"
        style={{
          maxHeight: "90vh",
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Product Batch</DialogTitle>
          <DialogDescription>
            Create a new product batch with planting information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Season */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Season <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedSeason}
              onValueChange={setSelectedSeason}
              disabled={isLoadingSeasons || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.seasonName} ({season.seasonDesc})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Yield */}
          <div className="space-y-2">
            <Label htmlFor="totalYield" className="text-sm font-medium">
              Total Yield <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalYield"
              type="number"
              step="0.01"
              value={totalYield}
              onChange={(e) => setTotalYield(e.target.value)}
              placeholder="Enter total yield amount"
              disabled={isLoading}
            />
          </div>

          {/* Planting Date */}
          <div className="space-y-2">
            <Label htmlFor="plantingDate" className="text-sm font-medium">
              Planting Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="plantingDate"
              type="datetime-local"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium">
              Product Images
            </Label>
            {imagePreviews.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="images" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(
                      "images-add"
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  disabled={isLoading}
                >
                  + Add more images
                </button>
                <input
                  id="images-add"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
