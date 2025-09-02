'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, Package2, Truck, Calendar, Thermometer } from 'lucide-react'
import { IngredientFormData } from '@/types/square'
import { ingredientService, CreateIngredientData } from '@/lib/database/ingredients'

const ingredientFormSchema = z.object({
  name: z.string().min(2, 'Ingredient name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  current_stock: z.number().nonnegative('Current stock must be a positive number'),
  unit: z.string().min(1, 'Please select a unit'),
  unit_cost: z.number().nonnegative('Unit cost must be a positive number'),
  reorder_point: z.number().nonnegative('Reorder point must be a positive number'),
  max_stock: z.number().optional(),
  location_id: z.string().min(1, 'Please select a location'),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  expiration_date: z.string().optional(),
  storage_requirements: z.string().optional()
})

type IngredientFormValues = z.infer<typeof ingredientFormSchema>

interface IngredientFormProps {
  onSuccess?: () => void
  ingredientId?: string
}

export function IngredientForm({ onSuccess, ingredientId }: IngredientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([])

  const categories = [
    { id: 'proteins', name: 'Proteins' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'grains', name: 'Grains & Starches' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'spices', name: 'Spices & Seasonings' },
    { id: 'oils', name: 'Oils & Fats' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'frozen', name: 'Frozen Items' },
    { id: 'canned', name: 'Canned Goods' },
    { id: 'other', name: 'Other' }
  ]

  const units = [
    { id: 'kg', name: 'Kilogram (kg)' },
    { id: 'g', name: 'Gram (g)' },
    { id: 'lb', name: 'Pound (lb)' },
    { id: 'oz', name: 'Ounce (oz)' },
    { id: 'l', name: 'Liter (L)' },
    { id: 'ml', name: 'Milliliter (mL)' },
    { id: 'gal', name: 'Gallon (gal)' },
    { id: 'qt', name: 'Quart (qt)' },
    { id: 'pt', name: 'Pint (pt)' },
    { id: 'cup', name: 'Cup' },
    { id: 'tbsp', name: 'Tablespoon (tbsp)' },
    { id: 'tsp', name: 'Teaspoon (tsp)' },
    { id: 'each', name: 'Each' },
    { id: 'case', name: 'Case' },
    { id: 'box', name: 'Box' },
    { id: 'bag', name: 'Bag' }
  ]

  // Load locations from database
  useEffect(() => {
    const loadLocations = async () => {
      const result = await ingredientService.getLocations()
      if (result.success && result.data) {
        setLocations(result.data)
      }
    }
    loadLocations()
  }, [])

  const storageRequirements = [
    { id: 'room_temp', name: 'Room Temperature' },
    { id: 'refrigerated', name: 'Refrigerated (32-40°F)' },
    { id: 'frozen', name: 'Frozen (0°F or below)' },
    { id: 'dry_cool', name: 'Dry & Cool' },
    { id: 'climate_controlled', name: 'Climate Controlled' }
  ]

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      current_stock: 0,
      unit: '',
      unit_cost: 0,
      reorder_point: 10,
      max_stock: undefined,
      location_id: '',
      supplier_name: '',
      supplier_contact: '',
      expiration_date: '',
      storage_requirements: ''
    }
  })

  const watchedStock = form.watch('current_stock')
  const watchedReorderPoint = form.watch('reorder_point')
  const watchedMaxStock = form.watch('max_stock')

  const getStockStatus = () => {
    if (watchedStock <= 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' }
    } else if (watchedStock <= watchedReorderPoint) {
      return { status: 'Low Stock', variant: 'outline' as const, color: 'text-yellow-600' }
    } else if (watchedMaxStock && watchedStock >= watchedMaxStock * 0.9) {
      return { status: 'Near Capacity', variant: 'outline' as const, color: 'text-blue-600' }
    } else {
      return { status: 'In Stock', variant: 'outline' as const, color: 'text-green-600' }
    }
  }

  async function onSubmit(data: IngredientFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // Convert form data to database format
      const ingredientData: CreateIngredientData = {
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        current_stock: data.current_stock,
        unit: data.unit,
        unit_cost: data.unit_cost,
        reorder_point: data.reorder_point,
        max_stock: data.max_stock || undefined,
        location_id: data.location_id,
        supplier_name: data.supplier_name || undefined,
        supplier_contact: data.supplier_contact || undefined,
        expiration_date: data.expiration_date || undefined,
        storage_requirements: data.storage_requirements || undefined
      }

      const result = await ingredientService.createIngredient(ingredientData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create ingredient')
      }

      router.refresh()
      if (onSuccess) {
        onSuccess()
      }
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const stockStatus = getStockStatus()

  return (
    <Form {...form}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package2 className="mr-2 h-5 w-5" />
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
                    <FormLabel>Ingredient Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., All-Purpose Flour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this ingredient"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map(location => (
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
          </CardContent>
        </Card>

        {/* Stock Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package2 className="mr-2 h-5 w-5" />
                Stock Management
              </div>
              <Badge variant={stockStatus.variant} className={stockStatus.color}>
                {stockStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
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
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost ($) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="reorder_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Minimum quantity before reordering</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>Maximum storage capacity (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Restaurant Depot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplier_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone, email, or contact person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage & Expiration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="mr-2 h-5 w-5" />
              Storage & Expiration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="storage_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Requirements</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select storage type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storageRequirements.map(requirement => (
                          <SelectItem key={requirement.id} value={requirement.id}>
                            {requirement.name}
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
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for non-perishable items</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {ingredientId ? 'Update Ingredient' : 'Add Ingredient'}
        </Button>
      </form>
    </Form>
  )
}
