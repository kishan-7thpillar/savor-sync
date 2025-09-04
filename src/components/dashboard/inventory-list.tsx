'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InventoryForm } from '@/components/forms/inventory-form'
import { Edit, Trash2, MoreHorizontal, AlertTriangle, CheckCircle, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  category: string
  quantity: number
  unit: string
  unit_cost: number
  reorder_point: number
  location_id: string
  location_name?: string
  supplier: string | null
  updated_at: string
}

interface InventoryListProps {
  locationFilter?: string
  onManualUpdate?: (itemId: string) => void
}

export function InventoryList({ locationFilter = 'all', onManualUpdate }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const supabase = createClient()
  const pageSize = 10

  useEffect(() => {
    fetchInventoryItems()
  }, [currentPage, locationFilter])

  async function fetchInventoryItems() {
    setLoading(true)
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get the user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!userOrg) {
        throw new Error('Organization not found')
      }

      // In a real app, we would fetch from an inventory_items table
      // For now, we'll create mock data
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: 'All-Purpose Flour',
          sku: 'FLR-001',
          category: 'ingredients',
          quantity: 25.5,
          unit: 'kg',
          unit_cost: 1.2,
          reorder_point: 10,
          location_id: 'downtown',
          location_name: 'Downtown Location',
          supplier: 'Restaurant Depot',
          updated_at: '2025-08-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'Olive Oil',
          sku: 'OIL-002',
          category: 'ingredients',
          quantity: 12,
          unit: 'l',
          unit_cost: 8.5,
          reorder_point: 5,
          location_id: 'downtown',
          location_name: 'Downtown Location',
          supplier: 'Sysco Foods',
          updated_at: '2025-08-19T10:15:00Z'
        },
        {
          id: '3',
          name: 'To-Go Containers',
          sku: 'PKG-001',
          category: 'packaging',
          quantity: 350,
          unit: 'each',
          unit_cost: 0.25,
          reorder_point: 100,
          location_id: 'westside',
          location_name: 'Westside Branch',
          supplier: 'PackageWorld',
          updated_at: '2025-08-18T16:45:00Z'
        },
        {
          id: '4',
          name: 'Chicken Breast',
          sku: 'MEAT-001',
          category: 'ingredients',
          quantity: 8.2,
          unit: 'kg',
          unit_cost: 6.75,
          reorder_point: 5,
          location_id: 'eastside',
          location_name: 'Eastside Location',
          supplier: 'Local Farms',
          updated_at: '2025-08-21T09:30:00Z'
        },
        {
          id: '5',
          name: 'Red Wine',
          sku: 'BEV-005',
          category: 'beverages',
          quantity: 24,
          unit: 'each',
          unit_cost: 12.99,
          reorder_point: 6,
          location_id: 'downtown',
          location_name: 'Downtown Location',
          supplier: 'Wine Distributors Inc.',
          updated_at: '2025-08-17T11:20:00Z'
        },
        {
          id: '6',
          name: 'Napkins',
          sku: 'SUP-002',
          category: 'supplies',
          quantity: 1200,
          unit: 'each',
          unit_cost: 0.02,
          reorder_point: 300,
          location_id: 'westside',
          location_name: 'Westside Branch',
          supplier: 'Restaurant Supplies Co.',
          updated_at: '2025-08-16T14:10:00Z'
        }
      ]

      // Filter by location if needed
      let filteredItems = [...mockItems]
      if (locationFilter !== 'all') {
        filteredItems = mockItems.filter(item => item.location_id === locationFilter)
      }

      // Set pagination
      setTotalPages(Math.ceil(filteredItems.length / pageSize))
      
      // Apply pagination
      const paginatedItems = filteredItems.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )

      setItems(paginatedItems)
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      // In a real app, we would delete from the database
      // For now, we'll just remove from our local state
      setItems(items.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleEditSuccess = () => {
    setEditingItemId(null)
    fetchInventoryItems()
  }

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (quantity <= reorderPoint) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          In Stock
        </Badge>
      )
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      ingredients: 'Ingredients',
      beverages: 'Beverages',
      supplies: 'Supplies',
      equipment: 'Equipment',
      packaging: 'Packaging'
    }
    return categories[category as keyof typeof categories] || category
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading inventory items...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No inventory items found. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        {item.name}
                        {item.sku && (
                          <div className="text-xs text-muted-foreground mt-1">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryLabel(item.category)}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell>{formatCurrency(item.quantity * item.unit_cost)}</TableCell>
                    <TableCell>
                      {getStockStatus(item.quantity, item.reorder_point)}
                    </TableCell>
                    <TableCell>{item.location_name}</TableCell>
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
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={() => setEditingItemId(item.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                            {onManualUpdate && (
                              <DropdownMenuItem onSelect={() => onManualUpdate(item.id)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Manual Update
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the inventory item "{item.name}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {editingItemId === item.id && (
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Inventory Item</DialogTitle>
                            </DialogHeader>
                            <InventoryForm 
                              itemId={item.id} 
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
                    onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
