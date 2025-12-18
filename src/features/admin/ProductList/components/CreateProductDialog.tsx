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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { toast } from "sonner";
import { createProduct, getCategoryList } from "../api";
import type { Category } from "../types";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductDialogProps) {
  const [productName, setProductName] = useState("");
  const [productAttribute, setProductAttribute] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getCategoryList();
      if (response.success && response.data) {
        setCategories(response.data.filter((cat) => !cat.isDelete));
      } else {
        toast.error(`Get Category List failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!productAttribute.trim()) {
      toast.error("Product attribute is required");
      return;
    }

    if (!productDesc.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!categoryId) {
      toast.error("Category is required");
      return;
    }

    setLoading(true);
    try {
      const response = await createProduct({
        productName,
        productAttribute,
        productDesc,
        categoryId,
      });

      if (response.success) {
        toast.success("Product created successfully");
        setProductName("");
        setProductAttribute("");
        setProductDesc("");
        setCategoryId("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(`Failed to create product: ${response.message}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="productAttribute">Product Attribute</Label>
            <Input
              id="productAttribute"
              value={productAttribute}
              onChange={(e) => setProductAttribute(e.target.value)}
              placeholder="Enter product attribute"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="productDesc">Description</Label>
            <Textarea
              id="productDesc"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              placeholder="Enter product description"
              disabled={loading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loading || loadingCategories}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading || loadingCategories}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
