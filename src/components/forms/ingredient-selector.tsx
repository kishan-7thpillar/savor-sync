'use client'

import { useState, useEffect } from 'react'
import { useFieldArray, Control, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Search, Package, Loader2 } from 'lucide-react'
import { ingredientService, DatabaseIngredient } from '@/lib/database/ingredients'
// Avoid importing ProductFormValues here to prevent circular type refs


interface IngredientSelectorProps {
  control: Control<any>
  name: 'ingredients'
}

export function IngredientSelector({ control, name }: IngredientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [ingredients, setIngredients] = useState<DatabaseIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { setValue, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  // Fetch ingredients from Supabase
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true)
      setError(null)
      
      const result = await ingredientService.getIngredients()
      
      if (result.success && result.data) {
        setIngredients(result.data)
      } else {
        setError(result.error || 'Failed to fetch ingredients')
      }
      
      setLoading(false)
    }
    
    fetchIngredients()
  }, [])

  // Get already selected ingredient IDs to prevent duplicates
  const selectedIngredientIds = (watch(name) || []).map((item: any) => item.ingredient_id).filter(Boolean)
  
  const filteredIngredients = ingredients.filter(ingredient =>
    (ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !selectedIngredientIds.includes(ingredient.id)
  )

  const addIngredient = () => {
    append({
      ingredient_id: '',
      quantity: 1,
      unit: ''
    })
  }

  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    return ingredient?.name || 'Select ingredient'
  }

  const getIngredientStock = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    return ingredient ? `${ingredient.current_stock} ${ingredient.unit} available` : ''
  }

  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    return ingredient?.unit || ''
  }

  // Auto-update unit when ingredient is selected
  const handleIngredientChange = (ingredientId: string, fieldIndex: number, onChange: (value: string) => void) => {
    onChange(ingredientId)
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (ingredient) {
      // Update the unit field for this ingredient using setValue
      const unitFieldName = `${name}.${fieldIndex}.unit` as const
      setValue(unitFieldName, ingredient.unit)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recipe Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading ingredients...
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 text-center py-4">
            Error loading ingredients: {error}
          </div>
        )}
        
        {!loading && !error && fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No ingredients added yet. Click "Add Ingredient" to start building your recipe.
          </p>
        )}

        {fields.length > 0 && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`${name}.${index}.ingredient_id`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <Select 
                              onValueChange={(value) => handleIngredientChange(value, index, field.onChange)} 
                              value={field.value}
                              disabled={loading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue 
                                    placeholder={loading ? "Loading..." : "Select ingredient"}
                                  >
                                    {field.value ? getIngredientName(field.value) : "Select ingredient"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <div className="p-2">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search ingredients..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="pl-8"
                                    />
                                  </div>
                                </div>
                                {filteredIngredients.length === 0 && !loading && (
                                  <div className="p-2 text-sm text-muted-foreground text-center">
                                    {searchTerm ? 'No ingredients found' : 'No ingredients available'}
                                  </div>
                                )}
                                {filteredIngredients.map((ingredient) => (
                                  <SelectItem key={ingredient.id} value={ingredient.id}>
                                    <div className="flex flex-col">
                                      <span>{ingredient.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {ingredient.category} • {ingredient.current_stock} {ingredient.unit} available
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
                      {watch(`${name}.${index}.ingredient_id`) && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {getIngredientStock(watch(`${name}.${index}.ingredient_id`))}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={control}
                        name={`${name}.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="1.0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={control}
                        name={`${name}.${index}.unit`}
                        render={({ field }) => {
                          const selectedIngredientId = watch(`${name}.${index}.ingredient_id`)
                          const ingredientUnit = getIngredientUnit(selectedIngredientId)
                          
                          return (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  {...field}
                                  value={ingredientUnit || field.value}
                                  placeholder={selectedIngredientId ? ingredientUnit : "Select ingredient first"}
                                  disabled={true}
                                  className="bg-muted"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addIngredient}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </CardContent>
    </Card>
  )
}

