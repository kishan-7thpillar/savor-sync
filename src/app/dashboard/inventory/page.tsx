"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Package,
  Package2,
  BarChart3,
  History,
  Download,
  Search,
  Filter,
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
import { Product, Ingredient } from "@/types/square";

export default function InventoryPage() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddItemSuccess = () => {
    setShowAddItem(false);
    // Increment the refresh trigger to force a reload
    setRefreshTrigger((prev) => prev + 1);
    console.log(`${activeTab === "products" ? "Product" : "Ingredient"} added successfully, refreshing list...`);
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
            <TabsTrigger value="ingredients" className="flex items-center">
              <Package2 className="mr-2 h-4 w-4" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col space-y-4 mt-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="westside">Westside</SelectItem>
                <SelectItem value="eastside">Eastside</SelectItem>
              </SelectContent>
            </Select>

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

        <TabsContent value="ingredients" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <InventoryCategories />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <InventoryOrders />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <InventoryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
