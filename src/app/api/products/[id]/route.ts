import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { productService } from '@/lib/database/products';
import { squareService } from '@/lib/square-integration';
import {
  updateProductSchema,
  ProductResponse,
} from '@/types/product';

/**
 * GET /api/products/[id] - Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' } as ProductResponse,
        { status: 400 }
      );
    }

    const result = await productService.getProductById(id);

    if (!result.success) {
      const status = result.error === 'Product not found' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: result.error } as ProductResponse,
        { status }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data } as ProductResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error(`GET /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ProductResponse,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id] - Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' } as ProductResponse,
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validatedData = updateProductSchema.parse(body);

    // Get current product to check if it exists and get Square ID
    const currentProduct = await productService.getProductById(id);
    
    if (!currentProduct.success) {
      const status = currentProduct.error === 'Product not found' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: currentProduct.error } as ProductResponse,
        { status }
      );
    }

    // Update product in database
    const dbResult = await productService.updateProduct(id, validatedData);

    if (!dbResult.success) {
      return NextResponse.json(
        { success: false, error: dbResult.error } as ProductResponse,
        { status: 400 }
      );
    }

    // If the product has a Square ID, try to update it in Square POS
    if (currentProduct.data?.square_id) {
      const squareResult = await squareService.updateItem(
        currentProduct.data.square_id,
        validatedData
      );

      if (!squareResult.success) {
        console.warn('Square item update failed:', squareResult.error);
        // Continue with success even if Square update fails
        // In production, you might want to implement a retry mechanism
      }
    }

    return NextResponse.json(
      { success: true, data: dbResult.data } as ProductResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error(`PUT /api/products/${params.id} error:`, error);

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

/**
 * DELETE /api/products/[id] - Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' } as ProductResponse,
        { status: 400 }
      );
    }

    // Get current product to check if it exists and get Square ID
    const currentProduct = await productService.getProductById(id);
    
    if (!currentProduct.success) {
      const status = currentProduct.error === 'Product not found' ? 404 : 500;
      return NextResponse.json(
        { success: false, error: currentProduct.error } as ProductResponse,
        { status }
      );
    }

    // Delete from database first
    const dbResult = await productService.deleteProduct(id);

    if (!dbResult.success) {
      return NextResponse.json(
        { success: false, error: dbResult.error } as ProductResponse,
        { status: 400 }
      );
    }

    // If the product has a Square ID, try to delete it from Square POS
    if (currentProduct.data?.square_id) {
      const squareResult = await squareService.deleteItem(currentProduct.data.square_id);

      if (!squareResult.success) {
        console.warn('Square item deletion failed:', squareResult.error);
        // Continue with success even if Square deletion fails
        // The database record is already deleted
      }
    }

    return NextResponse.json(
      { success: true, data: dbResult.data } as ProductResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error(`DELETE /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ProductResponse,
      { status: 500 }
    );
  }
}
