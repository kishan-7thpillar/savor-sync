import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { productService } from '@/lib/database/products';
import { squareService } from '@/lib/square-integration';
import {
  createProductSchema,
  productQuerySchema,
  ProductListResponse,
  ProductResponse,
  ProductQueryParams,
  DatabaseProduct,
} from '@/types/product';

/**
 * GET /api/products - List all products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Products API: GET request received');
    const { searchParams } = new URL(request.url);
    console.log('📋 Products API: Search params:', Object.fromEntries(searchParams));
    
    const params: ProductQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      pricing_type: (searchParams.get('pricing_type') as 'FIXED_PRICING' | 'VARIABLE_PRICING') || undefined,
      sort_by: (searchParams.get('sort_by') as 'name' | 'created_at' | 'updated_at' | 'price_amount') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    console.log('🔍 Products API: Query params:', params);

    // Remove null values and validate
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null)
    );

    const validatedParams = productQuerySchema.parse(cleanParams);

    // Get products from database
    console.log('📊 Products API: Calling productService.getProducts...');
    const result = await productService.getProducts(validatedParams);
    console.log('📦 Products API: Database result:', result);

    if (!result.success) {
      console.error('❌ Products API: Database error:', result.error);
      return NextResponse.json(
        { success: false, error: result.error } as ProductListResponse,
        { status: 400 }
      );
    }

    console.log('✅ Products API: Returning success response with', result.data?.products?.length || 0, 'products');
    return NextResponse.json({
      success: true,
      data: result.data,
    } as ProductListResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/products error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}` 
        } as ProductListResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ProductListResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validatedData = createProductSchema.parse(body);

    // Start database transaction-like operation
    let createdProduct;
    let squareResult;

    try {
      // First, try to create the item in Square POS
      squareResult = await squareService.createItem(validatedData);
      
      if (!squareResult.success) {
        console.warn('Square item creation failed:', squareResult.error);
        // Continue with database creation even if Square fails
        // In production, you might want to handle this differently
      }

      // Create product in database
      const dbResult = await productService.createProduct(
        validatedData,
        squareResult.squareId
      );

      if (!dbResult.success) {
        // If database creation fails but Square succeeded, we should clean up Square
        if (squareResult.success && squareResult.squareId) {
          console.log('Cleaning up Square item due to database failure');
          await squareService.deleteItem(squareResult.squareId);
        }

        return NextResponse.json(
          { success: false, error: dbResult.error } as ProductResponse,
          { status: 400 }
        );
      }

      createdProduct = dbResult.data;

      // If Square creation failed initially but database succeeded, 
      // we could retry Square creation here
      if (!squareResult.success && createdProduct) {
        console.log('Retrying Square item creation...');
        const retryResult = await squareService.createItem(validatedData);
        
        if (retryResult.success && retryResult.squareId) {
          // Update the product with the Square ID
          await productService.updateSquareId(createdProduct.id, retryResult.squareId);
          createdProduct.square_id = retryResult.squareId;
        }
      }

      return NextResponse.json(
        { success: true, data: createdProduct } as ProductResponse,
        { status: 201 }
      );

    } catch (error) {
      // Clean up any partial creations
      if (squareResult?.success && squareResult.squareId) {
        console.log('Cleaning up Square item due to error');
        await squareService.deleteItem(squareResult.squareId);
      }

      throw error;
    }

  } catch (error) {
    console.error('POST /api/products error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}` 
        } as ProductResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ProductResponse,
      { status: 500 }
    );
  }
}
