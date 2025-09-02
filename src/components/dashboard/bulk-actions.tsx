'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  Download, 
  Trash2, 
  Copy, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react'
import { 
  exportProductsToCSV, 
  exportIngredientsToCSV, 
  exportProductVariationsToCSV,
  downloadCSV,
  parseCSVFile,
  validateIngredientCSV,
  generateInventoryReport
} from '@/lib/export-utils'
import { Product, Ingredient } from '@/types/square'

interface BulkActionsProps {
  selectedItems: string[]
  allItems: (Product | Ingredient)[]
  itemType: 'products' | 'ingredients'
  onBulkDelete: (ids: string[]) => void
  onBulkDuplicate?: (ids: string[]) => void
  onImportComplete: () => void
}

export function BulkActions({ 
  selectedItems, 
  allItems, 
  itemType, 
  onBulkDelete, 
  onBulkDuplicate,
  onImportComplete 
}: BulkActionsProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (itemType === 'products') {
      const products = allItems as Product[]
      const csvData = exportProductsToCSV(products)
      downloadCSV(csvData, `products-${timestamp}.csv`)
    } else {
      const ingredients = allItems as Ingredient[]
      const csvData = exportIngredientsToCSV(ingredients)
      downloadCSV(csvData, `ingredients-${timestamp}.csv`)
    }
  }

  const handleExportSelected = () => {
    if (selectedItems.length === 0) return
    
    const selectedData = allItems.filter(item => selectedItems.includes(item.id))
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (itemType === 'products') {
      const products = selectedData as Product[]
      const csvData = exportProductsToCSV(products)
      downloadCSV(csvData, `selected-products-${timestamp}.csv`)
    } else {
      const ingredients = selectedData as Ingredient[]
      const csvData = exportIngredientsToCSV(ingredients)
      downloadCSV(csvData, `selected-ingredients-${timestamp}.csv`)
    }
  }

  const handleExportVariations = () => {
    if (itemType !== 'products') return
    
    const products = allItems as Product[]
    const csvData = exportProductVariationsToCSV(products)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csvData, `product-variations-${timestamp}.csv`)
  }

  const handleGenerateReport = () => {
    const products = itemType === 'products' ? allItems as Product[] : []
    const ingredients = itemType === 'ingredients' ? allItems as Ingredient[] : []
    
    const report = generateInventoryReport(products, ingredients)
    const timestamp = new Date().toISOString().split('T')[0]
    
    // Create a detailed report CSV
    const reportLines = [
      'INVENTORY REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      `Total Products,${report.summary.totalProducts}`,
      `Total Variations,${report.summary.totalVariations}`,
      `Total Ingredients,${report.summary.totalIngredients}`,
      `Total Inventory Value,$${report.summary.totalInventoryValue.toFixed(2)}`,
      `Low Stock Items,${report.summary.lowStockCount}`,
      `Out of Stock Items,${report.summary.outOfStockCount}`,
      `Expiring Items,${report.summary.expiringCount}`,
      '',
      'LOW STOCK ALERTS',
      'Name,Current Stock,Reorder Point,Unit',
      ...report.alerts.lowStockIngredients.map(item => 
        `"${item.name}",${item.currentStock},${item.reorderPoint},${item.unit}`
      ),
      '',
      'OUT OF STOCK ALERTS',
      'Name,Unit,Supplier',
      ...report.alerts.outOfStockIngredients.map(item => 
        `"${item.name}",${item.unit},"${item.supplier || 'N/A'}"`
      ),
      '',
      'EXPIRING SOON',
      'Name,Expiration Date,Current Stock,Unit',
      ...report.alerts.expiringIngredients.map(item => 
        `"${item.name}",${item.expirationDate},${item.currentStock},${item.unit}`
      )
    ]
    
    downloadCSV(reportLines.join('\n'), `inventory-report-${timestamp}.csv`)
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(false)
    setImportProgress(0)

    try {
      // Parse CSV file
      setImportProgress(25)
      const data = await parseCSVFile(file)
      
      // Validate data
      setImportProgress(50)
      if (itemType === 'ingredients') {
        const validation = validateIngredientCSV(data)
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }
      }
      
      // Simulate import process
      setImportProgress(75)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would process the data here
      // const processedItems = await processImportData(data, itemType)
      
      setImportProgress(100)
      setImportSuccess(true)
      onImportComplete()
      
      // Reset file input
      event.target.value = ''
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
      setTimeout(() => {
        setImportProgress(0)
        setImportSuccess(false)
      }, 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Bulk Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Export Data</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportSelected}
              disabled={selectedItems.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedItems.length})
            </Button>
            
            {itemType === 'products' && (
              <Button variant="outline" size="sm" onClick={handleExportVariations}>
                <Download className="mr-2 h-4 w-4" />
                Export Variations
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleGenerateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Import Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Import Data</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              disabled={isImporting}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
            />
            {isImporting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
          
          {isImporting && (
            <div className="space-y-2">
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Importing... {importProgress}%
              </p>
            </div>
          )}
          
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          {importSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Import completed successfully!</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Bulk Actions for Selected Items */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Selected Actions ({selectedItems.length} items)
            </Label>
            <div className="flex flex-wrap gap-2">
              {onBulkDuplicate && itemType === 'products' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onBulkDuplicate(selectedItems)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Bulk Delete</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>
                      Are you sure you want to delete {selectedItems.length} selected {itemType}? 
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button 
                        variant="destructive"
                        onClick={() => onBulkDelete(selectedItems)}
                      >
                        Delete {selectedItems.length} Items
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Import Template Download */}
        <div className="pt-2 border-t">
          <Label className="text-sm font-medium">Import Templates</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Download CSV templates for bulk import
          </p>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const template = itemType === 'products' 
                  ? 'name,description,abbreviation,category_id,product_type\n"Sample Product","Product description","SP","entrees","RESTAURANT_ITEM"'
                  : 'name,description,category,current_stock,unit,unit_cost,reorder_point,location_id,supplier_name\n"Sample Ingredient","Ingredient description","proteins",10,"kg",5.99,5,"downtown","Sample Supplier"'
                downloadCSV(template, `${itemType}-template.csv`)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {itemType === 'products' ? 'Product' : 'Ingredient'} Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
