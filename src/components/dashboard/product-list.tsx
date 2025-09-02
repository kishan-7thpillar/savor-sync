"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/product-form";
import { Edit, Trash2, MoreHorizontal, Eye, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Product } from "@/types/square";

interface ProductListProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  refreshTrigger?: number;
}

export function ProductList({
  searchQuery = "",
  categoryFilter = "all",
  locationFilter = "all",
  selectedItems = [],
  onSelectionChange,
  refreshTrigger = 0,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    console.log("🎯 ProductList: Component mounted, starting fetchProducts...");
    fetchProducts();
  }, [currentPage, searchQuery, categoryFilter, locationFilter, refreshTrigger]);

  async function fetchProducts() {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort_by: "updated_at",
        sort_order: "desc",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      const apiUrl = `/api/products?${params}`;
      console.log("🔍 ProductList: Fetching products from:", apiUrl);

      // Fetch from API
      const response = await fetch(apiUrl);

      console.log("📡 ProductList: API Response status:", response.status);

      if (!response.ok) {
        console.error(
          "❌ ProductList: API request failed:",
          response.status,
          response.statusText
        );
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 ProductList: API Response data:", result);

      if (!result.success) {
        console.error("❌ ProductList: API returned error:", result.error);
        throw new Error(result.error || "Failed to fetch products");
      }

      // Convert database products to UI format
      const uiProducts: Product[] = result.data.products.map(
        (dbProduct: any) => ({
          id: dbProduct.id.toString(),
          name: dbProduct.name,
          description: dbProduct.description || "",
          abbreviation: dbProduct.abbreviation || "",
          category_id: "entrees", // Default category since we don't have categories in DB yet
          product_type: "RESTAURANT_ITEM" as const,
          variations: [
            {
              id: `VAR_${dbProduct.id}_1`,
              name: "Default",
              pricing_type: dbProduct.pricing_type as
                | "FIXED_PRICING"
                | "VARIABLE_PRICING",
              price: dbProduct.price_amount
                ? dbProduct.price_amount / 100
                : undefined,
              currency: dbProduct.currency || "USD",
              stockable: true,
              track_inventory: true,
              ordinal: 0,
            },
          ],
          created_at: dbProduct.created_at,
          updated_at: dbProduct.updated_at,
          organization_id: "org_1",
          created_by: "user_1",
        })
      );

      console.log("✅ ProductList: Converted products:", uiProducts);
      setProducts(uiProducts);
      setTotalPages(result.data.pagination.totalPages);
    } catch (error) {
      console.error("❌ ProductList: Error fetching products:", error);
      // Set empty products on error so UI shows "No products found"
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditSuccess = () => {
    setEditingProductId(null);
    fetchProducts();
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicatedProduct = {
        ...product,
        id: `PROD_${Date.now()}`,
        name: `${product.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variations: product.variations.map((v) => ({
          ...v,
          id: `VAR_${Date.now()}_${v.ordinal}`,
        })),
      };
      setProducts([duplicatedProduct, ...products]);
    } catch (error) {
      console.error("Error duplicating product:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(products.map((p) => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedItems, productId]);
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== productId));
    }
  };

  const isAllSelected =
    products.length > 0 && products.every((p) => selectedItems.includes(p.id));
  const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

  const getCategoryLabel = (categoryId?: string) => {
    const categories = {
      appetizers: "Appetizers",
      entrees: "Entrees",
      desserts: "Desserts",
      beverages: "Beverages",
      sides: "Sides",
      specials: "Specials",
    };
    return (
      categories[categoryId as keyof typeof categories] ||
      categoryId ||
      "Uncategorized"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPriceRange = (variations: Product["variations"]) => {
    const fixedPrices = variations
      .filter((v) => v.pricing_type === "FIXED_PRICING" && v.price)
      .map((v) => v.price!);

    if (fixedPrices.length === 0) {
      return "Variable Pricing";
    }

    const min = Math.min(...fixedPrices);
    const max = Math.max(...fixedPrices);

    if (min === max) {
      return formatCurrency(min);
    }

    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {onSelectionChange && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all products"
                      className={
                        isIndeterminate ? "data-[state=checked]:bg-primary" : ""
                      }
                    />
                  </TableHead>
                )}
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variations</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectionChange ? 8 : 7}
                    className="h-24 text-center"
                  >
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectionChange ? 8 : 7}
                    className="h-24 text-center"
                  >
                    No products found. Create your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className={
                      selectedItems.includes(product.id) ? "bg-muted/50" : ""
                    }
                  >
                    {onSelectionChange && (
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(product.id, checked as boolean)
                          }
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <div>
                        <div className="flex items-center space-x-2">
                          {product.name}
                          {product.abbreviation && (
                            <Badge variant="outline" className="text-xs">
                              {product.abbreviation}
                            </Badge>
                          )}
                        </div>
                        {product.description && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryLabel(product.category_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.variations.slice(0, 2).map((variation) => (
                          <Badge
                            key={variation.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {variation.name}
                          </Badge>
                        ))}
                        {product.variations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.variations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPriceRange(product.variations)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.product_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={() => setEditingProductId(product.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DropdownMenuItem
                              onSelect={() => handleDuplicateProduct(product)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the product "
                                    {product.name}" and all its variations. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {editingProductId === product.id && (
                          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                              productId={product.id}
                              onSuccess={handleEditSuccess}
                            />
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && setCurrentPage((p) => p - 1)
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages && setCurrentPage((p) => p + 1)
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
