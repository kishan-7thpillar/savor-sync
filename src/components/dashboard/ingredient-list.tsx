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
import { IngredientForm } from "@/components/forms/ingredient-form";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Settings,
} from "lucide-react";
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
import { Ingredient } from "@/types/square";
import {
  ingredientService,
  DatabaseIngredient,
} from "@/lib/database/ingredients";

interface IngredientListProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
  stockFilter?: string;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onManualUpdate?: (ingredientId: string) => void;
  refreshTrigger?: number;
}

export function IngredientList({
  searchQuery = "",
  categoryFilter = "all",
  locationFilter = "all",
  stockFilter = "all",
  selectedItems = [],
  onSelectionChange,
  onManualUpdate,
  refreshTrigger = 0,
}: IngredientListProps) {
  const [ingredients, setIngredients] = useState<DatabaseIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(
    null
  );
  const [locations, setLocations] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const pageSize = 10;

  useEffect(() => {
    fetchIngredients();
    fetchLocations();
  }, [
    currentPage,
    searchQuery,
    categoryFilter,
    locationFilter,
    stockFilter,
    refreshTrigger,
  ]);

  async function fetchIngredients() {
    setLoading(true);
    try {
      const filters: any = {};

      if (categoryFilter && categoryFilter !== "all") {
        filters.category = categoryFilter;
      }

      if (locationFilter && locationFilter !== "all") {
        filters.location_id = locationFilter;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      const result = await ingredientService.getIngredients(filters);

      if (!result.success) {
        console.error("Error fetching ingredients:", result.error);
        setIngredients([]);
        setTotalPages(1);
        return;
      }

      let filteredIngredients = result.data || [];

      // Apply stock filter (not handled by the service)
      if (stockFilter && stockFilter !== "all") {
        filteredIngredients = filteredIngredients.filter((ingredient) => {
          if (stockFilter === "low") {
            return ingredient.current_stock <= ingredient.reorder_point;
          } else if (stockFilter === "out") {
            return ingredient.current_stock === 0;
          }
          return true;
        });
      }

      // Set pagination
      setTotalPages(Math.ceil(filteredIngredients.length / pageSize));

      // Apply pagination
      const paginatedIngredients = filteredIngredients.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

      setIngredients(paginatedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations() {
    try {
      const result = await ingredientService.getLocations();
      if (result.success && result.data) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }

  const handleDeleteIngredient = async (ingredientId: string) => {
    try {
      setIngredients(
        ingredients.filter((ingredient) => ingredient.id !== ingredientId)
      );
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  const handleEditSuccess = () => {
    setEditingIngredientId(null);
    fetchIngredients();
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(ingredients.map((i) => i.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (ingredientId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedItems, ingredientId]);
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== ingredientId));
    }
  };

  const isAllSelected =
    ingredients.length > 0 &&
    ingredients.every((i) => selectedItems.includes(i.id));
  const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

  const getStockStatus = (
    currentStock: number,
    reorderPoint: number,
    expirationDate?: string
  ) => {
    // Check expiration first
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const today = new Date();
      const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration < 0) {
        return {
          status: "Expired",
          variant: "destructive" as const,
          icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        };
      } else if (daysUntilExpiration <= 3) {
        return {
          status: "Expiring Soon",
          variant: "destructive" as const,
          icon: <Clock className="mr-1 h-3 w-3" />,
        };
      } else if (daysUntilExpiration <= 7) {
        return {
          status: "Expires Soon",
          variant: "outline" as const,
          icon: <Clock className="mr-1 h-3 w-3" />,
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
      }
    }

    // Check stock levels
    if (currentStock <= 0) {
      return {
        status: "Out of Stock",
        variant: "destructive" as const,
        icon: <AlertTriangle className="mr-1 h-3 w-3" />,
      };
    } else if (currentStock <= reorderPoint) {
      return {
        status: "Low Stock",
        variant: "outline" as const,
        icon: <AlertTriangle className="mr-1 h-3 w-3" />,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    } else {
      return {
        status: "In Stock",
        variant: "outline" as const,
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
        className: "bg-green-100 text-green-800 border-green-300",
      };
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      proteins: "Proteins",
      vegetables: "Vegetables",
      grains: "Grains & Starches",
      dairy: "Dairy",
      spices: "Spices & Seasonings",
      oils: "Oils & Fats",
      beverages: "Beverages",
      frozen: "Frozen Items",
      canned: "Canned Goods",
      other: "Other",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getStorageIcon = (storageType?: string) => {
    switch (storageType) {
      case "refrigerated":
        return <Thermometer className="h-3 w-3 text-blue-500" />;
      case "frozen":
        return <Thermometer className="h-3 w-3 text-blue-700" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location?.name || locationId;
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
                      aria-label="Select all ingredients"
                      className={
                        isIndeterminate ? "data-[state=checked]:bg-primary" : ""
                      }
                    />
                  </TableHead>
                )}
                <TableHead>Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectionChange ? 9 : 8}
                    className="h-24 text-center"
                  >
                    Loading ingredients...
                  </TableCell>
                </TableRow>
              ) : ingredients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectionChange ? 9 : 8}
                    className="h-24 text-center"
                  >
                    No ingredients found. Add your first ingredient to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                ingredients.map((ingredient) => {
                  const stockStatus = getStockStatus(
                    ingredient.current_stock,
                    ingredient.reorder_point,
                    ingredient.expiration_date
                  );
                  return (
                    <TableRow
                      key={ingredient.id}
                      className={
                        selectedItems.includes(ingredient.id)
                          ? "bg-muted/50"
                          : ""
                      }
                    >
                      {onSelectionChange && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(ingredient.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(
                                ingredient.id,
                                checked as boolean
                              )
                            }
                            aria-label={`Select ${ingredient.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div>
                          <div className="flex items-center space-x-2">
                            {ingredient.name}
                            {getStorageIcon(ingredient.storage_requirements)}
                          </div>
                          {ingredient.description && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                              {ingredient.description}
                            </div>
                          )}
                          {ingredient.expiration_date && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Expires:{" "}
                              {new Date(
                                ingredient.expiration_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryLabel(ingredient.category)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {ingredient.current_stock} {ingredient.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reorder at {ingredient.reorder_point}{" "}
                            {ingredient.unit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(ingredient.unit_cost)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          ingredient.current_stock * ingredient.unit_cost
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={stockStatus.variant}
                          className={stockStatus.className}
                        >
                          {stockStatus.icon}
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getLocationName(ingredient.location_id)}
                      </TableCell>
                      <TableCell>
                        <div>
                          {ingredient.supplier_name && (
                            <div className="text-sm">
                              {ingredient.supplier_name}
                            </div>
                          )}
                          {ingredient.supplier_contact && (
                            <div className="text-xs text-muted-foreground">
                              {ingredient.supplier_contact}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
