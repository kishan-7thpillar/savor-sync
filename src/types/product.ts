import { z } from 'zod';

// Enum for pricing types
export const PricingType = {
  FIXED_PRICING: 'FIXED_PRICING',
  VARIABLE_PRICING: 'VARIABLE_PRICING'
} as const;

export type PricingTypeEnum = typeof PricingType[keyof typeof PricingType];

// Database Product model (matches Supabase schema)
export interface DatabaseProduct {
  id: number;
  name: string;
  description: string | null;
  abbreviation: string | null;
  pricing_type: PricingTypeEnum;
  price_amount: number | null; // Price in dollars
  currency: string;
  square_id: string | null;
  created_at: string; // Supabase returns ISO string
  updated_at: string; // Supabase returns ISO string
}

// Product creation schema (for API requests)
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  abbreviation: z.string().max(10, 'Abbreviation must be 10 characters or less').optional(),
  pricing_type: z.enum(['FIXED_PRICING', 'VARIABLE_PRICING']),
  price_amount: z.number().min(0, 'Price must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
});

// Product update schema (all fields optional except those that shouldn't change)
export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name too long').optional(),
  description: z.string().optional(),
  abbreviation: z.string().max(10, 'Abbreviation must be 10 characters or less').optional(),
  pricing_type: z.enum(['FIXED_PRICING', 'VARIABLE_PRICING']).optional(),
  price_amount: z.number().min(0, 'Price must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
});

// Product query parameters schema
export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  pricing_type: z.enum(['FIXED_PRICING', 'VARIABLE_PRICING']).optional(),
  sort_by: z.enum(['name', 'created_at', 'updated_at', 'price_amount']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;

// API Response types
export interface ProductResponse {
  success: boolean;
  data?: DatabaseProduct;
  error?: string;
}

export interface ProductListResponse {
  success: boolean;
  data?: {
    products: DatabaseProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

// Square API related types
export interface SquareItemVariation {
  id: string;
  type: 'ITEM_VARIATION';
  item_variation_data: {
    item_id: string;
    name: string;
    pricing_type: PricingTypeEnum;
    price_money?: {
      amount: number; // Amount in cents
      currency: string;
    };
  };
}

export interface SquareItem {
  id: string;
  type: 'ITEM';
  item_data: {
    abbreviation?: string;
    description?: string;
    name: string;
    variations: SquareItemVariation[];
  };
}

export interface SquareCreateItemRequest {
  idempotency_key: string;
  object: SquareItem;
}

export interface SquareCreateItemResponse {
  catalog_object?: SquareItem;
  errors?: Array<{
    category: string;
    code: string;
    detail: string;
  }>;
}

// Utility function to convert database product to Square format
export function convertToSquareFormat(product: CreateProductInput): SquareItem {
  const itemId = `#${product.name.replace(/\s+/g, '')}`;
  const variationId = `#${product.name.replace(/\s+/g, '')}Variation1`;

  return {
    id: itemId,
    type: 'ITEM',
    item_data: {
      abbreviation: product.abbreviation,
      description: product.description,
      name: product.name,
      variations: [
        {
          id: variationId,
          type: 'ITEM_VARIATION',
          item_variation_data: {
            item_id: itemId,
            name: 'Default',
            pricing_type: product.pricing_type,
            ...(product.pricing_type === 'FIXED_PRICING' && product.price_amount && {
              price_money: {
                amount: Math.round(product.price_amount * 100), // Convert dollars to cents
                currency: product.currency,
              },
            }),
          },
        },
      ],
    },
  };
}
