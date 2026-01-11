import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Sparkles,
  BarChart3,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { formatVND } from '../../../components/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import type { Category, Product } from './types';
import {
  deleteProduct,
  getCategoryList,
  getProductList,
  updateProduct,
} from './api';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [productName, setProductName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('');
  // const [price, setPrice] = useState("");
  // const [unit, setUnit] = useState("");
  // const [stock, setStock] = useState("");
  const [description, setDescription] = useState('');
  const [inventoryChange, setInventoryChange] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleCreateProduct = () => {
    if (!productName || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Product created successfully');
    setShowCreateDialog(false);
    resetForm();
  };

  const handleUpdateProduct = async () => {
    try {
      if (!productName || !category) {
        toast.error('Please fill in all required fields');
        return;
      }
      console.log('Updating product with ID:', selectedProduct?.id);
      const response = await updateProduct(selectedProduct!.id, {
        productName,
        productAttribute: selectedProduct!.productAttribute,
        productDesc: description,
        categoryId: category,
      });
      if (response.success) {
        toast.success('Product updated successfully');
        window.location.reload();
      } else {
        toast.error(`Update Product failed: ${response.message}`);
        return;
      }
      setShowUpdateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      console.log('Deleting product with ID:', selectedProduct?.id);
      const response = await deleteProduct(selectedProduct!.id);
      if (response.success) {
        toast.success('Product deleted successfully');
        window.location.reload();
      } else {
        toast.error(`Delete Product failed: ${response.message}`);
      }
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleUpdateInventory = () => {
    if (!inventoryChange) {
      toast.error('Please enter inventory change amount');
      return;
    }
    toast.success('Inventory updated successfully');
    setShowInventoryDialog(false);
    setInventoryChange('');
    setSelectedProduct(null);
  };

  const resetForm = () => {
    setProductName('');
    setCategory('');
    // setPrice("");
    // setUnit("");
    // setStock("");
    setDescription('');
    setSelectedProduct(null);
  };

  const openUpdateDialog = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.productName);
    setCategory(product.categoryId);
    // setPrice(product.price.toString());
    // setUnit(product.unit);
    // setStock(product.stock.toString());
    setShowUpdateDialog(true);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductList();
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          toast.error(`Get Product List failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await getCategoryList();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          toast.error(`Get Category List failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-green-600 to-emerald-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Product Management</h1>
              </div>
              <p className="text-green-100 text-lg">
                Create and manage all your farm products with ease
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Card Header with Stats */}
          <div className="bg-linear-to-r from-white to-gray-50 border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 h-11 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-lg"
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  Total Products:{' '}
                  <span className="text-green-600">{totalItems}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pagination and Items Per Page */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {startIndex + 1}
              </span>{' '}
              to <span className="font-semibold text-gray-900">{endIndex}</span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">{totalItems}</span>{' '}
              results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-10 border-gray-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 border-gray-200">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4 text-sm uppercase tracking-wide">
                    Product Name
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                    Category
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-right text-sm uppercase tracking-wide">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Leaf className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          No products found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Create your first product to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className={`group transition-all duration-200 border-b border-gray-100 hover:shadow-md ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-linear-to-r hover:from-green-50 hover:to-emerald-50`}
                    >
                      <TableCell className="py-4 font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 group-hover:bg-green-600 transition-colors"></div>
                          <span>{product.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 border px-3 py-1 font-medium">
                          {categories.find((c) => c.id === product.categoryId)
                            ?.categoryName ?? 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowInventoryDialog(true);
                            }}
                            className="text-white bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:text-white hover:bg-none shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1.5 rounded-lg"
                            title="Update Inventory"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            <span className="text-xs font-semibold">Stock</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUpdateDialog(product)}
                            className="text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:text-white hover:bg-none shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1.5 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="text-xs font-semibold">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                            className="text-white bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:text-white hover:bg-none shadow-md hover:shadow-lg transition-all duration-200 px-3 py-1.5 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs font-semibold">
                              Delete
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg'
                        : 'shadow-sm hover:shadow-md transition-shadow'
                    }
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Next
              </Button>
            </div>
          )}
        </Card>

        {/* Create Product Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">
                  Add New Product
                </DialogTitle>
                <DialogDescription className="text-green-100 mt-1">
                  Create a new product for your farm inventory
                </DialogDescription>
              </div>
            </div>
            <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-2 border-gray-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
                onClick={handleCreateProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Product Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Edit className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">
                  Update Product
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Edit product information and details
                </DialogDescription>
              </div>
            </div>
            <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-2 border-gray-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 col-span-2">
                  <Label className="text-sm font-bold text-gray-800">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateDialog(false);
                  resetForm();
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
                onClick={handleUpdateProduct}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4 text-white -mx-6 -mt-6 mb-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <AlertDialogTitle className="text-white text-lg">
                  Delete Product
                </AlertDialogTitle>
                <AlertDialogDescription className="text-red-100 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <div className="px-6 pb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900">
                  "{selectedProduct?.productName}"
                </span>
                ? This action cannot be undone and all associated data will be
                removed.
              </p>
            </div>
            <AlertDialogFooter className="px-6 pb-6 pt-0 flex gap-3">
              <AlertDialogCancel
                onClick={() => setSelectedProduct(null)}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl rounded-lg font-semibold transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Manage Inventory Dialog */}
        <Dialog
          open={showInventoryDialog}
          onOpenChange={setShowInventoryDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Inventory</DialogTitle>
              <DialogDescription>
                Update stock for {selectedProduct?.productName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl">{selectedProduct?.stock} {selectedProduct?.unit}</p>
            </div> */}
              <div className="space-y-2">
                <Label>Adjust Stock</Label>
                <Input
                  type="number"
                  value={inventoryChange}
                  onChange={(e) => setInventoryChange(e.target.value)}
                  placeholder="Enter amount to add or subtract (use - for subtract)"
                />
                <p className="text-sm text-muted-foreground">
                  Use positive numbers to add stock, negative to subtract
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInventoryDialog(false);
                  setInventoryChange('');
                  setSelectedProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleUpdateInventory}
              >
                Update Inventory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
