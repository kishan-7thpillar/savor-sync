import { Product, Ingredient } from '@/types/square';

/**
 * Export utilities for inventory data
 */

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Convert products to CSV format
 */
export function exportProductsToCSV(products: Product[]): string {
  const headers = [
    'ID',
    'Name',
    'Description',
    'Abbreviation',
    'Category',
    'Product Type',
    'Variations Count',
    'Price Range',
    'Created At',
    'Updated At'
  ];

  const rows = products.map(product => {
    const priceRange = getPriceRange(product.variations);
    return [
      product.id,
      `"${product.name}"`,
      `"${product.description || ''}"`,
      product.abbreviation || '',
      product.category_id || '',
      product.product_type,
      product.variations.length.toString(),
      `"${priceRange}"`,
      new Date(product.created_at).toLocaleDateString(),
      new Date(product.updated_at).toLocaleDateString()
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Convert ingredients to CSV format
 */
export function exportIngredientsToCSV(ingredients: Ingredient[]): string {
  const headers = [
    'ID',
    'Name',
    'Description',
    'Category',
    'Current Stock',
    'Unit',
    'Unit Cost',
    'Total Value',
    'Reorder Point',
    'Max Stock',
    'Location',
    'Supplier Name',
    'Supplier Contact',
    'Expiration Date',
    'Storage Requirements',
    'Created At',
    'Updated At'
  ];

  const rows = ingredients.map(ingredient => [
    ingredient.id,
    `"${ingredient.name}"`,
    `"${ingredient.description || ''}"`,
    ingredient.category,
    ingredient.current_stock.toString(),
    ingredient.unit,
    ingredient.unit_cost.toString(),
    (ingredient.current_stock * ingredient.unit_cost).toFixed(2),
    ingredient.reorder_point.toString(),
    ingredient.max_stock?.toString() || '',
    ingredient.location_id,
    `"${ingredient.supplier_name || ''}"`,
    `"${ingredient.supplier_contact || ''}"`,
    ingredient.expiration_date || '',
    ingredient.storage_requirements || '',
    new Date(ingredient.created_at).toLocaleDateString(),
    new Date(ingredient.updated_at).toLocaleDateString()
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export products with variations details
 */
export function exportProductVariationsToCSV(products: Product[]): string {
  const headers = [
    'Product ID',
    'Product Name',
    'Variation ID',
    'Variation Name',
    'Pricing Type',
    'Price',
    'Currency',
    'Stockable',
    'Track Inventory',
    'Alert Threshold',
    'Ordinal'
  ];

  const rows: string[] = [];
  
  products.forEach(product => {
    product.variations.forEach(variation => {
      rows.push([
        product.id,
        `"${product.name}"`,
        variation.id,
        `"${variation.name}"`,
        variation.pricing_type,
        variation.price?.toString() || '',
        variation.currency || '',
        variation.stockable.toString(),
        variation.track_inventory.toString(),
        variation.inventory_alert_threshold?.toString() || '',
        variation.ordinal.toString()
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate inventory report data
 */
export function generateInventoryReport(products: Product[], ingredients: Ingredient[]) {
  const totalProducts = products.length;
  const totalVariations = products.reduce((sum, p) => sum + p.variations.length, 0);
  const totalIngredients = ingredients.length;
  
  const lowStockIngredients = ingredients.filter(i => 
    i.current_stock <= i.reorder_point && i.current_stock > 0
  );
  
  const outOfStockIngredients = ingredients.filter(i => i.current_stock <= 0);
  
  const expiringIngredients = ingredients.filter(i => {
    if (!i.expiration_date) return false;
    const expirationDate = new Date(i.expiration_date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  });

  const totalInventoryValue = ingredients.reduce((sum, i) => 
    sum + (i.current_stock * i.unit_cost), 0
  );

  const categoryBreakdown = ingredients.reduce((acc, ingredient) => {
    acc[ingredient.category] = (acc[ingredient.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      totalProducts,
      totalVariations,
      totalIngredients,
      totalInventoryValue,
      lowStockCount: lowStockIngredients.length,
      outOfStockCount: outOfStockIngredients.length,
      expiringCount: expiringIngredients.length
    },
    alerts: {
      lowStockIngredients: lowStockIngredients.map(i => ({
        name: i.name,
        currentStock: i.current_stock,
        reorderPoint: i.reorder_point,
        unit: i.unit
      })),
      outOfStockIngredients: outOfStockIngredients.map(i => ({
        name: i.name,
        unit: i.unit,
        supplier: i.supplier_name
      })),
      expiringIngredients: expiringIngredients.map(i => ({
        name: i.name,
        expirationDate: i.expiration_date,
        currentStock: i.current_stock,
        unit: i.unit
      }))
    },
    categoryBreakdown
  };
}

/**
 * Parse CSV file for bulk import
 */
export function parseCSVFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const data = lines.map(line => {
          // Simple CSV parsing - in production, use a proper CSV parser
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          values.push(current.trim());
          return values;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Validate CSV data for ingredients import
 */
export function validateIngredientCSV(data: string[][]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }
  
  const headers = data[0];
  const requiredHeaders = ['name', 'category', 'current_stock', 'unit', 'unit_cost', 'reorder_point', 'location_id'];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
  );
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  
  // Validate data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Helper function to get price range
function getPriceRange(variations: Product['variations']): string {
  const fixedPrices = variations
    .filter(v => v.pricing_type === 'FIXED_PRICING' && v.price)
    .map(v => v.price!);
  
  if (fixedPrices.length === 0) {
    return 'Variable Pricing';
  }
  
  const min = Math.min(...fixedPrices);
  const max = Math.max(...fixedPrices);
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  if (min === max) {
    return formatCurrency(min);
  }
  
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}
