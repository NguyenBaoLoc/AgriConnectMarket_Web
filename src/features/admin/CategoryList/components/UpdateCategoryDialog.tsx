import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { toast } from "sonner";
import { updateCategory } from "../api";
import type { Category } from "../types";

interface UpdateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export function UpdateCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: UpdateCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category && open) {
      setCategoryName(category.categoryName);
      setCategoryDesc(category.categoryDesc);
      setImagePreview(category.illustrativeImageUrl);
      setImage(null);
    }
  }, [category, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error("Category not found");
      return;
    }

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!categoryDesc.trim()) {
      toast.error("Category description is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("CategortName", categoryName);
      formData.append("CategoryDesc", categoryDesc);
      if (image) {
        formData.append("IllustractiveImage", image);
      }

      const response = await updateCategory(category.id, formData);

      if (response.success) {
        toast.success("Category updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(`Failed to update category: ${response.message}`);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("An error occurred while updating the category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="categoryDesc">Description</Label>
            <Textarea
              id="categoryDesc"
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              placeholder="Enter category description"
              disabled={loading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image">Illustrative Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
