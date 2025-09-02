'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

const inventoryFormSchema = z.object({
  name: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
  sku: z.string().optional(),
  category: z.string().min(1, { message: 'Please select a category' }),
  quantity: z.number().nonnegative({ message: 'Quantity must be a positive number' }),
  unit: z.string().min(1, { message: 'Please select a unit' }),
  unitCost: z.number().nonnegative({ message: 'Unit cost must be a positive number' }),
  reorderPoint: z.number().nonnegative({ message: 'Reorder point must be a positive number' }),
  locationId: z.string().min(1, { message: 'Please select a location' }),
  supplier: z.string().optional(),
  description: z.string().optional(),
})

type InventoryFormValues = z.infer<typeof inventoryFormSchema>

interface InventoryFormProps {
  onSuccess?: () => void
  itemId?: string
}

export function InventoryForm({ onSuccess, itemId }: InventoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState([
    { id: 'ingredients', name: 'Ingredients' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'supplies', name: 'Supplies' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'packaging', name: 'Packaging' }
  ])
  const [locations, setLocations] = useState([
    { id: 'downtown', name: 'Downtown Location' },
    { id: 'westside', name: 'Westside Branch' },
    { id: 'eastside', name: 'Eastside Location' }
  ])
  const supabase = createClient()

  const defaultValues: Partial<InventoryFormValues> = {
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unit: 'each',
    unitCost: 0,
    reorderPoint: 10,
    locationId: '',
    supplier: '',
    description: '',
  }

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues,
  })

  async function onSubmit(data: InventoryFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error(userError?.message || 'Not authenticated')
      }

      // Get the user's organization
      const { data: userOrg, error: orgError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (orgError || !userOrg) {
        throw new Error(orgError?.message || 'Organization not found')
      }

      // Format the data for insertion
      const inventoryData = {
        organization_id: userOrg.organization_id,
        name: data.name,
        sku: data.sku || null,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        unit_cost: data.unitCost,
        reorder_point: data.reorderPoint,
        location_id: data.locationId,
        supplier: data.supplier || null,
        description: data.description || null,
        created_by: user.id,
      }

      // Insert or update the inventory item
      let dbOperation
      if (itemId) {
        dbOperation = supabase
          .from('inventory_items')
          .update(inventoryData)
          .eq('id', itemId)
      } else {
        dbOperation = supabase
          .from('inventory_items')
          .insert(inventoryData)
      }

      const { error: insertError } = await dbOperation

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Success
      router.refresh()
      if (onSuccess) {
        onSuccess()
      }
      form.reset(defaultValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., All-Purpose Flour" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU/Item Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., FLR-001" {...field} />
                </FormControl>
                <FormDescription>Optional unique identifier</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
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
          
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
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
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
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
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="lb">Pound (lb)</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="oz">Ounce (oz)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="l">Liter (L)</SelectItem>
                    <SelectItem value="ml">Milliliter (mL)</SelectItem>
                    <SelectItem value="gal">Gallon (gal)</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unitCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>Minimum quantity before reordering</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Restaurant Depot" {...field} />
                </FormControl>
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
                  placeholder="Additional details about this inventory item"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {itemId ? 'Update Item' : 'Add Item'}
        </Button>
      </form>
    </Form>
  )
}
