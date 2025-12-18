import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
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
import { Textarea } from "../../../../components/ui/textarea";
import { toast } from "sonner";
import { createFarm, getProvinces, getDistricts, getWards } from "../api";
import type { Province, District, Ward } from "../types";

interface AddFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFarmAdded?: () => void;
}

export function AddFarmDialog({
  open,
  onOpenChange,
  onFarmAdded,
}: AddFarmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Form fields
  const [farmName, setFarmName] = useState("");
  const [farmDesc, setFarmDesc] = useState("");
  const [batchCodePrefix, setBatchCodePrefix] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [detail, setDetail] = useState("");

  // Location fields
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces on dialog open
  useEffect(() => {
    if (open) {
      fetchProvinces();
    }
  }, [open]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      setSelectedDistrict("");
      setSelectedDistrictName("");
      setSelectedWard("");
      setSelectedWardName("");
      setDistricts([]);
      setWards([]);
      fetchDistricts(selectedProvince);
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      setSelectedWard("");
      setSelectedWardName("");
      setWards([]);
      fetchWards(selectedDistrict);
    }
  }, [selectedDistrict]);

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast.error("Failed to load provinces");
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    setIsLoadingDistricts(true);
    try {
      const data = await getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode: string) => {
    setIsLoadingWards(true);
    try {
      const data = await getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Failed to load wards");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !farmName.trim() ||
      !farmDesc.trim() ||
      !batchCodePrefix.trim() ||
      !phone.trim() ||
      !area.trim() ||
      !detail.trim() ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const farmerId = localStorage.getItem("accountId");
    if (!farmerId) {
      toast.error("Unable to get farmer information. Please login again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createFarm(
        {
          farmName: farmName.trim(),
          farmDesc: farmDesc.trim(),
          batchCodePrefix: batchCodePrefix.trim(),
          phone: phone.trim(),
          area: area.trim(),
          farmerId,
          province: selectedProvinceName,
          district: selectedDistrictName,
          ward: selectedWardName,
          detail: detail.trim(),
        },
        bannerFile || undefined
      );

      if (response.success) {
        toast.success("Farm created successfully!");
        resetForm();
        onOpenChange(false);
        onFarmAdded?.();
      } else {
        toast.error(response.message || "Failed to create farm");
      }
    } catch (error) {
      console.error("Error creating farm:", error);
      toast.error("Error creating farm");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFarmName("");
    setFarmDesc("");
    setBatchCodePrefix("");
    setPhone("");
    setArea("");
    setDetail("");
    setSelectedProvince("");
    setSelectedProvinceName("");
    setSelectedDistrict("");
    setSelectedDistrictName("");
    setSelectedWard("");
    setSelectedWardName("");
    setBannerFile(null);
    setBannerPreview(null);
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
          <DialogTitle>Add New Farm</DialogTitle>
          <DialogDescription>
            Register a new farm with all required information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Farm Name */}
          <div className="space-y-2">
            <Label htmlFor="farmName" className="text-sm font-medium">
              Farm Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="farmName"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Enter farm name"
              disabled={isLoading}
            />
          </div>

          {/* Farm Description */}
          <div className="space-y-2">
            <Label htmlFor="farmDesc" className="text-sm font-medium">
              Farm Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="farmDesc"
              value={farmDesc}
              onChange={(e) => setFarmDesc(e.target.value)}
              placeholder="Enter farm description"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Batch Code Prefix */}
          <div className="space-y-2">
            <Label htmlFor="batchCodePrefix" className="text-sm font-medium">
              Batch Code Prefix <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batchCodePrefix"
              value={batchCodePrefix}
              onChange={(e) => setBatchCodePrefix(e.target.value)}
              placeholder="e.g., BATCH001"
              disabled={isLoading}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              disabled={isLoading}
            />
          </div>

          {/* Area */}
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">
              Area <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g., 25 hectares"
              disabled={isLoading}
            />
          </div>

          {/* Province */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Province <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedProvince}
              onValueChange={(code) => {
                setSelectedProvince(code);
                const province = provinces.find((p) => String(p.code) === code);
                setSelectedProvinceName(province?.name || "");
              }}
              disabled={isLoadingProvinces || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={String(province.code)}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              District <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedDistrict}
              onValueChange={(code) => {
                setSelectedDistrict(code);
                const district = districts.find((d) => String(d.code) === code);
                setSelectedDistrictName(district?.name || "");
              }}
              disabled={!selectedProvince || isLoadingDistricts || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.code} value={String(district.code)}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ward */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Ward <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedWard}
              onValueChange={(code) => {
                setSelectedWard(code);
                const ward = wards.find((w) => String(w.code) === code);
                setSelectedWardName(ward?.name || "");
              }}
              disabled={!selectedDistrict || isLoadingWards || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.code} value={String(ward.code)}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detail */}
          <div className="space-y-2">
            <Label htmlFor="detail" className="text-sm font-medium">
              Detail Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Enter detailed address"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Farm Banner */}
          <div className="space-y-2">
            <Label htmlFor="banner" className="text-sm font-medium">
              Farm Banner
            </Label>
            {!bannerPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="banner" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">
                    Click to upload banner
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={bannerPreview}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  {bannerFile?.name} (
                  {`${((bannerFile?.size || 0) / 1024 / 1024).toFixed(2)}`} MB)
                </p>
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
            {isLoading ? "Creating..." : "Create Farm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
