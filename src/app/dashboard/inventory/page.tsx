"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Package2,
  Filter,
  History,
  BarChart3,
  Search,
  Download,
  PlusCircle,
  Settings,
  AlertTriangle,
  TrendingDown,
  Activity,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductList } from "@/components/dashboard/product-list";
import { IngredientList } from "@/components/dashboard/ingredient-list";
import { ProductForm } from "@/components/forms/product-form";
import { IngredientForm } from "@/components/forms/ingredient-form";
import { BulkActions } from "@/components/dashboard/bulk-actions";
import { InventoryCategories } from "@/components/dashboard/inventory-categories";
import { InventoryOrders } from "@/components/dashboard/inventory-orders";
import { InventoryReports } from "@/components/dashboard/inventory-reports";
import { InventoryLogsTable } from "@/components/dashboard/inventory-logs-table";
import { ManualInventoryUpdateForm } from "@/components/forms/manual-inventory-update-form";
import { Product, Ingredient } from "@/types/square";
import {
  mockIngredients,
  mockProducts,
  mockStockLevels,
  mockStockMovements,
  mockInventoryAlerts,
  mockWastageReports,
  mockSuppliers,
  getStockLevelsByLocation,
  getStockMovementsByLocation,
  getInventoryAlertsByLocation,
  getWastageReportsByLocation,
} from "@/data/mockSalesData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Stock Levels Tab Component
function StockLevelsTab({
  selectedLocation,
  searchQuery,
}: {
  selectedLocation: string;
  searchQuery: string;
}) {
  const stockLevels =
    selectedLocation === "all"
      ? mockStockLevels
      : getStockLevelsByLocation(selectedLocation);

  const filteredStockLevels = stockLevels.filter((stock) =>
    stock.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge
            variant="destructive"
            className="bg-yellow-100 text-yellow-800"
          >
            Low Stock
          </Badge>
        );
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Stock Levels</h3>
          <Badge variant="outline">{filteredStockLevels.length} items</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Expiration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStockLevels.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">
                  {stock.ingredientName}
                </TableCell>
                <TableCell>{stock.locationName}</TableCell>
                <TableCell>{stock.currentStock}</TableCell>
                <TableCell>{stock.unitOfMeasure}</TableCell>
                <TableCell>{getStatusBadge(stock.stockStatus)}</TableCell>
                <TableCell>
                  {new Date(stock.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {stock.expirationDate
                    ? new Date(stock.expirationDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Stock Movements Tab Component
function StockMovementsTab({
  selectedLocation,
  searchQuery,
}: {
  selectedLocation: string;
  searchQuery: string;
}) {
  const movements =
    selectedLocation === "all"
      ? mockStockMovements
      : mockStockMovements.filter((m) => m.locationId === selectedLocation);

  const filteredMovements = movements.filter((movement) =>
    movement.ingredientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMovementBadge = (type: string) => {
    return type === "in" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        IN
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        OUT
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    const reasonColors: Record<string, string> = {
      sale: "bg-blue-100 text-blue-800",
      delivery: "bg-green-100 text-green-800",
      spoilage: "bg-red-100 text-red-800",
      over_prep: "bg-yellow-100 text-yellow-800",
      manual_adjustment: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge variant="outline" className={reasonColors[reason] || ""}>
        {reason.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Stock Movement History</h3>
          <Badge variant="outline">{filteredMovements.length} movements</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {movement.ingredientName}
                </TableCell>
                <TableCell>{movement.locationName}</TableCell>
                <TableCell>{getMovementBadge(movement.movementType)}</TableCell>
                <TableCell>
                  {movement.quantity} {movement.unitOfMeasure}
                </TableCell>
                <TableCell>{getReasonBadge(movement.reason)}</TableCell>
                <TableCell>{movement.staffName}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {movement.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Inventory Alerts Tab Component
function InventoryAlertsTab({
  selectedLocation,
}: {
  selectedLocation: string;
}) {
  const alerts =
    selectedLocation === "all"
      ? mockInventoryAlerts
      : mockInventoryAlerts.filter((a) => a.locationId === selectedLocation);

  const getSeverityBadge = (severity: string) => {
    const severityColors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return (
      <Badge variant="outline" className={severityColors[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      low_stock: "bg-yellow-100 text-yellow-800",
      out_of_stock: "bg-red-100 text-red-800",
      expiring_soon: "bg-orange-100 text-orange-800",
      overstock: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge variant="outline" className={typeColors[type]}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Inventory Alerts</h3>
          <Badge variant="outline">{alerts.length} alerts</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{getTypeBadge(alert.type)}</TableCell>
                <TableCell className="font-medium">
                  {alert.ingredientName}
                </TableCell>
                <TableCell>{alert.locationName}</TableCell>
                <TableCell>{alert.currentStock}</TableCell>
                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                <TableCell className="max-w-xs">{alert.message}</TableCell>
                <TableCell>
                  {new Date(alert.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {alert.isResolved ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Resolved
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Active</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Wastage Reports Tab Component
function WastageReportsTab({ selectedLocation }: { selectedLocation: string }) {
  const reports =
    selectedLocation === "all"
      ? mockWastageReports
      : mockWastageReports.filter((r) => r.locationId === selectedLocation);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Wastage Reports</h3>
          <Badge variant="outline">{reports.length} reports</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Expected Usage</TableHead>
              <TableHead>Actual Usage</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Variance %</TableHead>
              <TableHead>Estimated Cost</TableHead>
              <TableHead>Primary Reasons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.period}</TableCell>
                <TableCell className="font-medium">
                  {report.ingredientName}
                </TableCell>
                <TableCell>{report.locationName}</TableCell>
                <TableCell>{report.expectedUsage}</TableCell>
                <TableCell>{report.actualUsage}</TableCell>
                <TableCell
                  className={
                    report.variance > 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {report.variance > 0 ? "+" : ""}
                  {report.variance}
                </TableCell>
                <TableCell
                  className={
                    report.variancePercentage > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {report.variancePercentage > 0 ? "+" : ""}
                  {report.variancePercentage.toFixed(1)}%
                </TableCell>
                <TableCell>${report.estimatedWastageCost.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {report.primaryReasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Suppliers Tab Component
function SuppliersTab({ searchQuery }: { searchQuery: string }) {
  const filteredSuppliers = mockSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Suppliers</h3>
          <Badge variant="outline">{filteredSuppliers.length} suppliers</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {supplier.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{supplier.leadTimeDays} days</TableCell>
                <TableCell>{supplier.paymentTerms}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-1">⭐</span>
                    {supplier.rating.toFixed(1)}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.isActive ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function InventoryPage() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const selectedLocation =
    useAppSelector((state) => state.location.selectedLocation) || "all";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showManualUpdate, setShowManualUpdate] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | null
  >(null);

  const handleAddItemSuccess = () => {
    setShowAddItem(false);
    // Increment the refresh trigger to force a reload
    setRefreshTrigger((prev) => prev + 1);
    console.log(
      `${
        activeTab === "products" ? "Product" : "Ingredient"
      } added successfully, refreshing list...`
    );
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "products":
        return showAddItem ? "Cancel" : "Add Product";
      case "ingredients":
        return showAddItem ? "Cancel" : "Add Ingredient";
      default:
        return showAddItem ? "Cancel" : "Add Item";
    }
  };

  const shouldShowAddButton = ["products", "ingredients"].includes(activeTab);

  const handleBulkDelete = (ids: string[]) => {
    // In a real app, you would delete from the database
    console.log("Bulk deleting items:", ids);
    setSelectedItems([]);
  };

  const handleBulkDuplicate = (ids: string[]) => {
    // In a real app, you would duplicate the items
    console.log("Bulk duplicating items:", ids);
    setSelectedItems([]);
  };

  const handleImportComplete = () => {
    // Refresh the current list
    console.log("Import completed, refreshing data");
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };

  const handleManualUpdate = (
    ingredientId: string,
    newQuantity: number,
    reason: string
  ) => {
    // Here you would typically call an API to update the inventory
    console.log("Manual update:", { ingredientId, newQuantity, reason });

    // For now, we'll just trigger a refresh
    setRefreshTrigger((prev) => prev + 1);
    setShowManualUpdate(false);
    setSelectedIngredientId(null);
  };

  const handleManualUpdateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowManualUpdate(false);
    setSelectedIngredientId(null);
  };

  const handleManualUpdateClick = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId);
    setShowManualUpdate(true);
  };

  // Mock data for bulk actions
  const getMockData = (): (Product | Ingredient)[] => {
    if (activeTab === "products") {
      return [
        {
          id: "PROD_001",
          name: "Margherita Pizza",
          description:
            "Classic pizza with tomato sauce, mozzarella, and fresh basil",
          abbreviation: "MP",
          category_id: "entrees",
          product_type: "RESTAURANT_ITEM" as const,
          variations: [],
          created_at: "2025-08-20T10:00:00Z",
          updated_at: "2025-08-20T10:00:00Z",
          organization_id: "org_1",
          created_by: "user_1",
        },
      ] as Product[];
    } else {
      return [
        {
          id: "ING_001",
          name: "All-Purpose Flour",
          description: "High-quality all-purpose flour",
          category: "grains",
          current_stock: 25.5,
          unit: "kg",
          unit_cost: 1.2,
          reorder_point: 10,
          location_id: "downtown",
          created_at: "2025-08-20T10:00:00Z",
          updated_at: "2025-08-20T10:00:00Z",
          organization_id: "org_1",
          created_by: "user_1",
        },
      ] as Ingredient[];
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Inventory Management
        </h2>
        {shouldShowAddButton && (
          <Button onClick={() => setShowAddItem(!showAddItem)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {getAddButtonText()}
          </Button>
        )}
      </div>

      {showAddItem && (
        <Card>
          <CardContent className="pt-6">
            {activeTab === "products" && (
              <ProductForm onSuccess={handleAddItemSuccess} />
            )}
            {activeTab === "ingredients" && (
              <IngredientForm onSuccess={handleAddItemSuccess} />
            )}
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="products"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setShowAddItem(false);
          setSelectedItems([]);
          setShowBulkActions(false);
        }}
        className="w-full"
      >
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            {/* <TabsTrigger value="ingredients" className="flex items-center">
              <Package2 className="mr-2 h-4 w-4" />
              Ingredients
            </TabsTrigger> */}
            <TabsTrigger value="stock-levels" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Stock Levels
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Movements
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="wastage" className="flex items-center">
              <TrendingDown className="mr-2 h-4 w-4" />
              Wastage
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Suppliers
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col space-y-4 mt-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activeTab === "products" ? (
                  <>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="entrees">Entrees</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="sides">Sides</SelectItem>
                    <SelectItem value="specials">Specials</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="proteins">Proteins</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="grains">Grains & Starches</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="spices">Spices & Seasonings</SelectItem>
                    <SelectItem value="oils">Oils & Fats</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="frozen">Frozen Items</SelectItem>
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {activeTab === "ingredients" && (
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 md:w-[300px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <Download className="mr-2 h-4 w-4" />
              Bulk Actions
            </Button>
            {activeTab === "ingredients" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualUpdate(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manual Update
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div
              className={showBulkActions ? "lg:col-span-3" : "lg:col-span-4"}
            >
              <ProductList
                searchQuery={searchQuery}
                categoryFilter={selectedCategory}
                locationFilter={selectedLocation}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                refreshTrigger={refreshTrigger}
              />
            </div>
            {showBulkActions && (
              <div className="lg:col-span-1">
                <BulkActions
                  selectedItems={selectedItems}
                  allItems={getMockData()}
                  itemType="products"
                  onBulkDelete={handleBulkDelete}
                  onBulkDuplicate={handleBulkDuplicate}
                  onImportComplete={handleImportComplete}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* <TabsContent value="ingredients" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div
              className={showBulkActions ? "lg:col-span-3" : "lg:col-span-4"}
            >
              <IngredientList
                searchQuery={searchQuery}
                categoryFilter={selectedCategory}
                locationFilter={selectedLocation}
                stockFilter={stockFilter}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onManualUpdate={handleManualUpdateClick}
                refreshTrigger={refreshTrigger}
              />
            </div>
            {showBulkActions && (
              <div className="lg:col-span-1">
                <BulkActions
                  selectedItems={selectedItems}
                  allItems={getMockData()}
                  itemType="ingredients"
                  onBulkDelete={handleBulkDelete}
                  onImportComplete={handleImportComplete}
                />
              </div>
            )}
          </div>
        </TabsContent> */}

        <TabsContent value="stock-levels">
          <StockLevelsTab
            selectedLocation={selectedLocation}
            searchQuery={searchQuery}
          />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTab
            selectedLocation={selectedLocation}
            searchQuery={searchQuery}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <InventoryAlertsTab selectedLocation={selectedLocation} />
        </TabsContent>

        <TabsContent value="wastage">
          <WastageReportsTab selectedLocation={selectedLocation} />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersTab searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>

      {/* Manual Inventory Update Dialog */}
      <Dialog open={showManualUpdate} onOpenChange={setShowManualUpdate}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manual Inventory Update</DialogTitle>
          </DialogHeader>
          <ManualInventoryUpdateForm
            preselectedIngredientId={selectedIngredientId || undefined}
            preselectedLocationId={
              selectedLocation !== "all" ? selectedLocation : undefined
            }
            onSuccess={handleManualUpdateSuccess}
            onCancel={() => setShowManualUpdate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
