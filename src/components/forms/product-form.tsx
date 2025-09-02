"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Clock,
  Users,
  ChefHat,
} from "lucide-react";
import {
  convertProductToSquareFormat,
  createSquareProduct,
} from "@/lib/square-api";
import { IngredientSelector } from "./ingredient-selector";

const variationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  pricing_type: z.enum(["FIXED_PRICING", "VARIABLE_PRICING"]),
  price: z.number().optional(),
  currency: z.string().default("GBP"),
  stockable: z.boolean().default(true),
  track_inventory: z.boolean().default(true),
  inventory_alert_threshold: z.number().optional(),
  ordinal: z.number().default(0),
});

const ingredientSchema = z.object({
  ingredient_id: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
});

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().default(""),
  abbreviation: z
    .string()
    .max(3, "Abbreviation must be 3 characters or less")
    .default(""),
  category_id: z.string().default(""),
  product_type: z
    .enum([
      "REGULAR",
      "GIFT_CARD",
      "APPOINTMENTS_SERVICE",
      "FOOD_AND_BEV",
      "EVENT",
      "DIGITAL",
      "DONATION",
      "LEGACY_SQUARE_ONLINE_SERVICE",
      "LEGACY_SQUARE_ONLINE_MEMBERSHIP",
      "RESTAURANT_ITEM",
      "RETAIL_ITEM",
    ])
    .default("FOOD_AND_BEV"),
  variations: z
    .array(variationSchema)
    .min(1, "At least one variation is required"),
  ingredients: z.array(ingredientSchema).default([]),
  recipe_instructions: z.string().default(""),
  prep_time: z.number().optional(),
  cook_time: z.number().optional(),
  servings: z.number().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  productId?: string;
}

export function ProductForm({ onSuccess, productId }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [squarePreview, setSquarePreview] = useState<object | null>(null);

  const categories = [
    { id: "appetizers", name: "Appetizers" },
    { id: "entrees", name: "Entrees" },
    { id: "desserts", name: "Desserts" },
    { id: "beverages", name: "Beverages" },
    { id: "sides", name: "Sides" },
    { id: "specials", name: "Specials" },
  ];

  const resolver = zodResolver(
    productFormSchema
  ) as Resolver<ProductFormValues>;

  const form = useForm<ProductFormValues>({
    resolver: resolver,
    defaultValues: {
      name: "",
      description: "",
      abbreviation: "",
      category_id: "",
      product_type: "FOOD_AND_BEV",
      variations: [
        {
          name: "Regular",
          pricing_type: "FIXED_PRICING",
          price: 0,
          currency: "GBP",
          stockable: true,
          track_inventory: true,
          ordinal: 0,
        },
      ],
      ingredients: [],
      recipe_instructions: "",
      prep_time: undefined,
      cook_time: undefined,
      servings: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const addVariation = () => {
    append({
      name: "",
      pricing_type: "FIXED_PRICING",
      price: 0,
      currency: "GBP",
      stockable: true,
      track_inventory: true,
      ordinal: fields.length,
    });
  };

  const generateSquarePreview = (data: ProductFormValues) => {
    const mockProduct = {
      id: `PROD_${Date.now()}`,
      name: data.name,
      description: data.description,
      abbreviation: data.abbreviation,
      category_id: data.category_id,
      product_type: data.product_type,
      variations: data.variations.map((v, index) => ({
        id: `VAR_${Date.now()}_${index}`,
        ...v,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: "mock_org",
      created_by: "mock_user",
    };

    return convertProductToSquareFormat(mockProduct);
  };

  const previewSquareFormat = () => {
    const data = form.getValues();
    const preview = generateSquarePreview(data);
    setSquarePreview(preview);
  };

  async function onSubmit(data: ProductFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Generate Square API format
      const squareRequest = generateSquarePreview(data);

      // Create product via Square API
      console.log("🚀 Creating product in Square...");
      const squareResult = await createSquareProduct(squareRequest);

      if (!squareResult.success) {
        throw new Error(
          squareResult.error || "Failed to create product in Square"
        );
      }

      console.log("✅ Square product created successfully");

      // Create product in Supabase database
      console.log("🚀 Creating product in database...");
      const dbPayload = {
        ...data,
        square_id:
          squareResult.data?.catalog_object?.item_data?.variations?.[0]?.id ||
          null,
        square_data: squareResult.data || null,
      };

      const dbResponse = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dbPayload),
      });

      if (!dbResponse.ok) {
        const errorData = await dbResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Database error: ${dbResponse.status}`
        );
      }

      const dbResult = await dbResponse.json();

      if (!dbResult.success) {
        throw new Error(dbResult.error || "Failed to save product to database");
      }

      console.log("✅ Product saved to database successfully");

      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
      form.reset();
      setSquarePreview(null);
    } catch (err) {
      console.error("❌ Product creation failed:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Margherita Pizza"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abbreviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abbreviation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., MP"
                          maxLength={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Max 3 characters for POS display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the product"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                  name="product_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REGULAR">
                            Regular - An ordinary item
                          </SelectItem>
                          <SelectItem value="GIFT_CARD">
                            Gift Card - A Square gift card (Deprecated)
                          </SelectItem>
                          <SelectItem value="APPOINTMENTS_SERVICE">
                            Appointments Service - Bookable via Square
                            Appointments
                          </SelectItem>
                          <SelectItem value="FOOD_AND_BEV">
                            Food & Beverage - For restaurants and food venues
                          </SelectItem>
                          <SelectItem value="EVENT">
                            Event - Ticketed events with location and times
                          </SelectItem>
                          <SelectItem value="DIGITAL">
                            Digital - Digital items like ebooks or songs
                          </SelectItem>
                          <SelectItem value="DONATION">
                            Donation - For any cause donations
                          </SelectItem>
                          <SelectItem value="LEGACY_SQUARE_ONLINE_SERVICE">
                            Legacy Online Service - Manually fulfilled service
                          </SelectItem>
                          <SelectItem value="LEGACY_SQUARE_ONLINE_MEMBERSHIP">
                            Legacy Online Membership - Manually fulfilled
                            membership
                          </SelectItem>
                          <SelectItem value="RESTAURANT_ITEM">
                            Restaurant Item (Legacy)
                          </SelectItem>
                          <SelectItem value="RETAIL_ITEM">
                            Retail Item (Legacy)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Product Variations
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium">
                      Variation {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`variations.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variation Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Small, Medium, Large"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variations.${index}.pricing_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pricing type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FIXED_PRICING">
                                Fixed Price
                              </SelectItem>
                              <SelectItem value="VARIABLE_PRICING">
                                Variable Price
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`variations.${index}.pricing_type`) ===
                    "FIXED_PRICING" && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                      <FormField
                        control={form.control}
                        name={`variations.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variations.${index}.currency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <FormControl>
                              <Input placeholder="GBP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-6 mt-4">
                    <FormField
                      control={form.control}
                      name={`variations.${index}.stockable`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Stockable</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variations.${index}.track_inventory`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Track Inventory</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`variations.${index}.track_inventory`) && (
                    <FormField
                      control={form.control}
                      name={`variations.${index}.inventory_alert_threshold`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Low Stock Alert Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Alert when stock falls below this number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Recipe & Ingredients Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5" />
                Recipe & Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipe Details */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="prep_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Prep Time (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="15"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cook_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cook Time (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Servings
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="4"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ingredients Selector */}
              <IngredientSelector control={form.control} name="ingredients" />

              {/* Recipe Instructions */}
              <FormField
                control={form.control}
                name="recipe_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Step-by-step cooking instructions..."
                        className="resize-none"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed instructions for preparing this dish
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Square API Preview */}
          {squarePreview && (
            <Card>
              <CardHeader>
                <CardTitle>Square API Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(squarePreview, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={previewSquareFormat}
              disabled={isLoading}
            >
              Preview Square Format
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
