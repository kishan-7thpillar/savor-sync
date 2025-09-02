import { createClient } from '@supabase/supabase-js';
import {
  DatabaseProduct,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
} from '@/types/product';

// Improved Supabase client with better error handling
const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase environment variables:', {
      url: !!url,
      key: !!key
    });
    throw new Error('Supabase configuration missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

const supabase = createSupabaseClient();

export class ProductService {
  /**
   * Test database connection and table access
   */
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return {
          success: false,
          error: `Database error: ${error.message} (Code: ${error.code})`
        };
      }

      console.log('Supabase connection test successful');
      return { success: true };
    } catch (error) {
      console.error('Connection test exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error',
      };
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(params: ProductQueryParams): Promise<{
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
  }> {
    try {
      const { page, limit, search, pricing_type, sort_by, sort_order } = params;
      const offset = (page - 1) * limit;

      // Build Supabase query
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (pricing_type) {
        query = query.eq('pricing_type', pricing_type);
      }

      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: products, count, error } = await query;

      if (error) {
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          products: products || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Error getting products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Product not found',
          };
        }
        throw error;
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new product with enhanced error handling
   */
  async createProduct(productData: CreateProductInput, squareId?: string): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      console.log('Creating product:', { 
        name: productData.name, 
        pricing_type: productData.pricing_type,
        hasSquareId: !!squareId 
      });

      // Prepare insert data
      const insertData = {
        name: productData.name,
        description: productData.description || null,
        abbreviation: productData.abbreviation || null,
        pricing_type: productData.pricing_type,
        price_amount: productData.price_amount || null,
        currency: productData.currency || 'USD',
        square_id: squareId || null,
      };

      console.log('Insert data:', insertData);

      const { data: product, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        
        // Handle specific error codes
        switch (error.code) {
          case '23505':
            if (error.message.includes('square_id')) {
              return {
                success: false,
                error: 'A product with this Square ID already exists',
              };
            }
            return {
              success: false,
              error: 'A product with this data already exists',
            };
          
          case '42501':
            return {
              success: false,
              error: 'Permission denied. Check RLS policies and service role key.',
            };
          
          case '42P01':
            return {
              success: false,
              error: 'Products table does not exist. Run the migration first.',
            };
          
          case '23514':
            return {
              success: false,
              error: 'Invalid pricing_type. Must be FIXED_PRICING or VARIABLE_PRICING.',
            };
          
          default:
            return {
              success: false,
              error: `Database error: ${error.message} (Code: ${error.code})`,
            };
        }
      }

      if (!product) {
        return {
          success: false,
          error: 'Product was not created (no data returned)',
        };
      }

      console.log('Product created successfully:', product.id);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Product creation exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during product creation',
      };
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: number, productData: UpdateProductInput): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      // Filter out undefined values
      const updateData = Object.fromEntries(
        Object.entries(productData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          error: 'No fields to update',
        };
      }

      const { data: product, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Product not found',
          };
        }
        throw error;
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Product not found',
          };
        }
        throw error;
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get product by Square ID
   */
  async getProductBySquareId(squareId: string): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('square_id', squareId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Product not found',
          };
        }
        throw error;
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Error getting product by Square ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update Square ID for a product
   */
  async updateSquareId(id: number, squareId: string): Promise<{
    success: boolean;
    data?: DatabaseProduct;
    error?: string;
  }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update({ square_id: squareId })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Product not found',
          };
        }
        throw error;
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Error updating Square ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      
      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
