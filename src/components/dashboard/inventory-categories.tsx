'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { PlusCircle, Edit, Trash2, Package } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  itemCount: number
  totalValue: number
}

export function InventoryCategories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'ingredients',
      name: 'Ingredients',
      description: 'Raw food ingredients used in recipes',
      itemCount: 45,
      totalValue: 3250.75
    },
    {
      id: 'beverages',
      name: 'Beverages',
      description: 'Drinks, alcohol, and other liquid refreshments',
      itemCount: 28,
      totalValue: 4120.50
    },
    {
      id: 'supplies',
      name: 'Supplies',
      description: 'Non-food items used in daily operations',
      itemCount: 32,
      totalValue: 1875.25
    },
    {
      id: 'equipment',
      name: 'Equipment',
      description: 'Kitchen and restaurant equipment',
      itemCount: 15,
      totalValue: 12450.00
    },
    {
      id: 'packaging',
      name: 'Packaging',
      description: 'To-go containers, bags, and other packaging materials',
      itemCount: 18,
      totalValue: 950.30
    }
  ])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const supabase = createClient()

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const newCategory: Category = {
        id: `category-${Date.now()}`,
        name: newCategoryName,
        description: newCategoryDescription,
        itemCount: 0,
        totalValue: 0
      }

      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setNewCategoryDescription('')
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return

    try {
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      )
      setCategories(updatedCategories)
      setEditingCategory(null)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setCategories(categories.filter(cat => cat.id !== categoryId))
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Inventory Categories</h3>
          <p className="text-sm text-muted-foreground">
            Organize your inventory with custom categories
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your inventory items
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dairy Products"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this category"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5" />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-2xl font-bold">{category.itemCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(category.totalValue)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                  </DialogHeader>
                  {editingCategory && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">Category Name</Label>
                        <Input
                          id="edit-name"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input
                          id="edit-description"
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            description: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={handleUpdateCategory}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the "{category.name}" category.
                      Any items in this category will need to be reassigned.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
