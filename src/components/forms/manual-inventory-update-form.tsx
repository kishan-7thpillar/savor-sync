"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const manualUpdateSchema = z.object({
  ingredientId: z.string().min(1, { message: "Please select an ingredient" }),
  newStock: z
    .number()
    .nonnegative({ message: "Stock must be a positive number" }),
  reason: z
    .string()
    .min(3, { message: "Reason must be at least 3 characters" }),
  locationId: z.string().min(1, { message: "Please select a location" }),
});

type ManualUpdateValues = z.infer<typeof manualUpdateSchema>;

interface Ingredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  category: string;
  reorder_point: number;
}

interface Location {
  id: string;
  name: string;
}

interface ManualInventoryUpdateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedIngredientId?: string;
  preselectedLocationId?: string;
}

export function ManualInventoryUpdateForm({
  onSuccess,
  onCancel,
  preselectedIngredientId,
  preselectedLocationId,
}: ManualInventoryUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const supabase = createClient();

  const form = useForm<ManualUpdateValues>({
    resolver: zodResolver(manualUpdateSchema),
    defaultValues: {
      ingredientId: preselectedIngredientId || "",
      newStock: 0,
      reason: "",
      locationId: preselectedLocationId || "",
    },
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Load locations from Supabase
        await loadLocations();

        // Load ingredients if location is selected
        if (preselectedLocationId) {
          await loadIngredients(preselectedLocationId);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [preselectedLocationId]);

  // Load locations from Supabase
  const loadLocations = async () => {
    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Get user's organization
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error("User profile not found");
      }

      // Fetch locations for the user's organization
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("id, name")
        .eq("organization_id", userProfile.organization_id)
        .eq("is_active", true)
        .order("name");

      if (locationsError) {
        throw new Error("Failed to fetch locations");
      }

      setLocations(locationsData || []);
    } catch (error) {
      console.error("Error loading locations:", error);
      setError("Failed to load locations");
    }
  };

  // Load ingredients when location changes
  const loadIngredients = async (locationId: string) => {
    try {
      const response = await fetch(`/api/inventory?locationId=${locationId}`);
      const data = await response.json();

      if (data.success) {
        setIngredients(data.data);
      } else {
        setError("Failed to load ingredients");
      }
    } catch (error) {
      console.error("Error loading ingredients:", error);
      setError("Failed to load ingredients");
    }
  };

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    form.setValue("locationId", locationId);
    form.setValue("ingredientId", ""); // Reset ingredient selection
    setSelectedIngredient(null);
    loadIngredients(locationId);
  };

  // Handle ingredient change
  const handleIngredientChange = (ingredientId: string) => {
    form.setValue("ingredientId", ingredientId);
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    setSelectedIngredient(ingredient || null);

    // Set current stock as default new stock value
    if (ingredient) {
      form.setValue("newStock", ingredient.current_stock);
    }
  };

  const onSubmit = async (data: ManualUpdateValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Successfully updated ${result.data.ingredientName} inventory`
        );
        form.reset();
        setSelectedIngredient(null);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || "Failed to update inventory");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stockDifference =
    selectedIngredient && form.watch("newStock") !== undefined
      ? form.watch("newStock") - selectedIngredient.current_stock
      : 0;

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Manual Inventory Update
        </CardTitle>
        <CardDescription>
          Update inventory stock manually with a reason for the change
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={handleLocationChange}
                      defaultValue={field.value}
                      disabled={!!preselectedLocationId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ingredientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient</FormLabel>
                    <Select
                      onValueChange={handleIngredientChange}
                      defaultValue={field.value}
                      // disabled={!form.watch('locationId') || !!preselectedIngredientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{ingredient.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {ingredient.current_stock} {ingredient.unit}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedIngredient && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Current Inventory Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Current Stock:
                    </span>
                    <div className="font-medium">
                      {selectedIngredient.current_stock}{" "}
                      {selectedIngredient.unit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Reorder Point:
                    </span>
                    <div className="font-medium">
                      {selectedIngredient.reorder_point}{" "}
                      {selectedIngredient.unit}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="newStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Stock Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  {selectedIngredient && (
                    <FormDescription className="flex items-center gap-2">
                      {stockDifference > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Increase of {stockDifference.toFixed(2)}{" "}
                            {selectedIngredient.unit}
                          </span>
                        </>
                      ) : stockDifference < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">
                            Decrease of {Math.abs(stockDifference).toFixed(2)}{" "}
                            {selectedIngredient.unit}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No change</span>
                      )}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Update</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Buns expired, Damaged during delivery, Physical count correction"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear reason for this manual inventory adjustment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Inventory
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
